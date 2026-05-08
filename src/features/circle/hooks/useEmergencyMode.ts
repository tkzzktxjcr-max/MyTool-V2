import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context';
import { emergencyService } from '../services';
import type { EmergencySession } from '../types';

const STALE_TIME = 60 * 1000;

export const useEmergencyMode = (enabled: boolean = true) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.$id;

  const sessionQuery = useQuery({
    queryKey: ['emergency-session', userId],
    queryFn: () => emergencyService.getActiveSession(userId!),
    enabled: !!userId && enabled,
    staleTime: STALE_TIME,
    refetchInterval: enabled ? 120000 : false, // Reduced from 60s to 120s
  });

  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  const session = sessionQuery.data;

  useEffect(() => {
    if (!session?.isActive) {
      setTimeRemaining(0);
      return;
    }

    const expiresAt = new Date(session.expiresAt).getTime();
    
    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setTimeRemaining(remaining);
      if (remaining === 0) {
        queryClient.invalidateQueries({ queryKey: ['emergency-session', userId] });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [session, userId, queryClient]);

  const startSessionMutation = useMutation({
    mutationFn: ({ duration, memberIds }: { duration: number; memberIds: string[] }) =>
      emergencyService.startSession(userId!, duration, memberIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergency-session', userId] });
    },
  });

  const stopSessionMutation = useMutation({
    mutationFn: (sessionId: string) => emergencyService.deactivateSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergency-session', userId] });
    },
  });

  const startEmergency = async (duration: number, memberIds: string[]) => {
    return startSessionMutation.mutateAsync({ duration, memberIds });
  };

  const stopEmergency = async () => {
    if (session?.id) {
      await stopSessionMutation.mutateAsync(session.id);
    }
  };

  const formatTimeRemaining = (): string => {
    if (timeRemaining <= 0) return '00:00';
    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    session,
    isActive: !!session?.isActive,
    timeRemaining,
    formattedTime: formatTimeRemaining(),
    startEmergency,
    stopEmergency,
    isLoading: sessionQuery.isLoading,
  };
};