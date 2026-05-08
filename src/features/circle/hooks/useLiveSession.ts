import { useState, useEffect, useCallback, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context';
import { liveSessionService } from '../services/liveSession';
import { safetyEventService } from '../services/safetyEvent';
import { useGeolocation } from './useGeolocation';
import type { LiveAccuracy, LiveStatus, TransportMode, LiveLocation } from '../types';

const STALE_TIME = 30 * 1000;

export const useLiveSession = (circleId: string | undefined, enabled: boolean = true) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.$id;
  const userName = user?.name;

  const [manualStatus, setManualStatus] = useState<LiveStatus>('ok');

  const sessionQuery = useQuery({
    queryKey: ['live-session', userId],
    queryFn: () => liveSessionService.getMyActiveSession(userId!),
    enabled: !!userId && enabled,
    staleTime: STALE_TIME,
    refetchInterval: enabled ? 60000 : false,
  });

  const session = sessionQuery.data;
  const isLive = !!session?.isActive;

  const geo = useGeolocation({
    accuracy: session?.accuracy || 'approximate',
    enabled: isLive && enabled,
    throttleMs: session?.safeReturnMode ? 15000 : 30000,
  });

  // Update location in Appwrite when position changes
  useEffect(() => {
    if (!session?.id || !geo.position) return;
    liveSessionService.updateLocation(session.id, {
      lat: geo.position.latitude,
      lng: geo.position.longitude,
      timestamp: new Date(geo.position.timestamp).toISOString(),
    });
  }, [geo.position, session?.id]);

  // Update battery level
  useEffect(() => {
    if (!session?.id || geo.batteryLevel === null) return;
    if (geo.batteryLevel <= 20) {
      liveSessionService.updateBattery(session.id, geo.batteryLevel);
    }
  }, [geo.batteryLevel, session?.id]);

  // Auto-expiration check
  useEffect(() => {
    if (!session?.id || !session.isActive) return;
    const checkExpiry = setInterval(() => {
      if (new Date(session.expiresAt) < new Date()) {
        liveSessionService.stopSession(session.id).then(() => {
          queryClient.invalidateQueries({ queryKey: ['live-session', userId] });
        });
      }
    }, 60000);
    return () => clearInterval(checkExpiry);
  }, [session, userId, queryClient]);

  const startSessionMutation = useMutation({
    mutationFn: (data: { accuracy: LiveAccuracy; durationMinutes: number }) => {
      if (!userId || !circleId) throw new Error('Missing userId or circleId');
      return liveSessionService.createSession({
        userId,
        circleId,
        accuracy: data.accuracy,
        durationMinutes: data.durationMinutes,
        userName,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-session', userId] });
      queryClient.invalidateQueries({ queryKey: ['live-locations', circleId] });
    },
  });

  const stopSessionMutation = useMutation({
    mutationFn: () => {
      if (!session?.id) throw new Error('No active session');
      return liveSessionService.stopSession(session.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-session', userId] });
      queryClient.invalidateQueries({ queryKey: ['live-locations', circleId] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: LiveStatus) => {
      if (!session?.id) throw new Error('No active session');
      return liveSessionService.updateStatus(session.id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-session', userId] });
      queryClient.invalidateQueries({ queryKey: ['live-locations', circleId] });
    },
  });

  const startSafeReturnMutation = useMutation({
    mutationFn: (data: { transportMode: TransportMode; destination?: LiveLocation & { address?: string } }) => {
      if (!session?.id) throw new Error('No active session');
      return liveSessionService.startSafeReturn(session.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-session', userId] });
    },
  });

  const stopSafeReturnMutation = useMutation({
    mutationFn: () => {
      if (!session?.id) throw new Error('No active session');
      return liveSessionService.stopSafeReturn(session.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-session', userId] });
    },
  });

  const startSession = async (accuracy: LiveAccuracy, durationMinutes: number) => {
    await startSessionMutation.mutateAsync({ accuracy, durationMinutes });
  };

  const stopSession = async () => {
    await stopSessionMutation.mutateAsync();
  };

  const updateStatus = async (status: LiveStatus) => {
    setManualStatus(status);
    await updateStatusMutation.mutateAsync(status);
  };

  const startSafeReturn = async (transportMode: TransportMode, destination?: LiveLocation & { address?: string }) => {
    await startSafeReturnMutation.mutateAsync({ transportMode, destination });
  };

  const stopSafeReturn = async () => {
    await stopSafeReturnMutation.mutateAsync();
  };

  return {
    session,
    isLive,
    position: geo.position,
    batteryLevel: geo.batteryLevel,
    isTracking: geo.isTracking,
    geoError: geo.error,
    manualStatus,
    startSession,
    stopSession,
    updateStatus,
    startSafeReturn,
    stopSafeReturn,
    isLoading: sessionQuery.isLoading || startSessionMutation.isPending,
  };
};