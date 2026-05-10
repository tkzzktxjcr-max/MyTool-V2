import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context';
import { alcoholService, drinksService } from '../services';
import type { Drink, AlcoholLog, MoodType } from '../types';
import { toast } from 'sonner';

const STALE_TIME = 2 * 60 * 1000;

export const useAlcoholLogs = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.$id;

  const logsQuery = useQuery({
    queryKey: ['alcohol-logs', userId],
    queryFn: () => alcoholService.getLogs(userId!),
    enabled: !!userId,
    staleTime: STALE_TIME,
  });

  const logs = logsQuery.data ?? [];
  const [lastDeletedLog, setLastDeletedLog] = useState<AlcoholLog | null>(null);

  const quickLogMutation = useMutation({
    mutationFn: ({ drink, mood, quantity, timestamp }: {
      drink: Drink; mood?: MoodType; quantity: number; timestamp?: string;
    }) => {
      if (!userId) throw new Error('Not authenticated');
      return alcoholService.createLog(userId, {
        drinkType: drink.type, servingSize: drink.defaultServingSize,
        abv: drink.abv, mood, drinkName: drink.name, drinkEmoji: drink.emoji,
        quantity, timestamp,
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['alcohol-logs', userId] });
      drinksService.incrementUsage(variables.drink.id).catch(() => {});
      queryClient.invalidateQueries({ queryKey: ['drinks'] });
      setLastDeletedLog(null);
    },
  });

  const deleteLogMutation = useMutation({
    mutationFn: (logId: string) => alcoholService.deleteLog(logId),
    onMutate: async (logId) => {
      await queryClient.cancelQueries({ queryKey: ['alcohol-logs', userId] });
      const previousLogs = queryClient.getQueryData<AlcoholLog[]>(['alcohol-logs', userId]);
      const logToDelete = previousLogs?.find(l => l.id === logId);
      if (logToDelete) {
        setLastDeletedLog(logToDelete);
        setTimeout(() => setLastDeletedLog(null), 5000);
      }
      queryClient.setQueryData<AlcoholLog[]>(['alcohol-logs', userId],
        (old) => old?.filter(l => l.id !== logId) ?? []
      );
      return { previousLogs };
    },
    onError: (_err, _logId, context) => {
      if (context?.previousLogs) queryClient.setQueryData(['alcohol-logs', userId], context.previousLogs);
      toast.error('Erreur lors de la suppression');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['alcohol-logs', userId] }),
  });

  const undoDeleteMutation = useMutation({
    mutationFn: () => {
      if (!lastDeletedLog || !userId) throw new Error('Nothing to undo');
      return alcoholService.createLog(userId, {
        drinkType: lastDeletedLog.drinkType, servingSize: lastDeletedLog.servingSize,
        abv: lastDeletedLog.abv, mood: lastDeletedLog.mood, drinkName: lastDeletedLog.drinkName,
        drinkEmoji: lastDeletedLog.drinkEmoji, quantity: lastDeletedLog.quantity,
      });
    },
    onSuccess: () => {
      setLastDeletedLog(null);
      queryClient.invalidateQueries({ queryKey: ['alcohol-logs', userId] });
    },
  });

  const getTodayUnits = useCallback((): number => {
    const today = new Date().toISOString().split('T')[0];
    return logs.filter(l => l.timestamp.split('T')[0] === today).reduce((sum, l) => sum + l.units, 0);
  }, [logs]);

  const getWeeklyUnits = useCallback((): number => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return logs.filter(l => new Date(l.timestamp) >= weekAgo).reduce((sum, l) => sum + l.units, 0);
  }, [logs]);

  return {
    logs, lastDeletedLog,
    isLoading: logsQuery.isLoading,
    isError: logsQuery.isError,
    quickLog: (drink: Drink, mood?: MoodType, quantity?: number, timestamp?: string) =>
      quickLogMutation.mutateAsync({ drink, mood, quantity: quantity || 1, timestamp }),
    deleteLog: (logId: string) => deleteLogMutation.mutateAsync(logId),
    undoDelete: () => undoDeleteMutation.mutateAsync(),
    getTodayUnits, getWeeklyUnits,
  };
};