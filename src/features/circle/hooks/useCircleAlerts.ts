import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context';
import { alertService } from '../services';
import type { CircleAlert } from '../types';

const STALE_TIME = 60 * 1000;

export const useCircleAlerts = (enabled: boolean = true) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.$id;

  const alertsQuery = useQuery({
    queryKey: ['circle-alerts', userId],
    queryFn: () => alertService.getAlertsForUser(userId!),
    enabled: !!userId && enabled,
    staleTime: STALE_TIME,
    refetchInterval: enabled ? 60000 : false, // Reduced from 30s to 60s
  });

  const unreadCount = (alertsQuery.data ?? []).filter(a => !a.isRead).length;

  const markAsReadMutation = useMutation({
    mutationFn: (alertId: string) => alertService.markAsRead(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circle-alerts', userId] });
    },
  });

  const dismissAlertMutation = useMutation({
    mutationFn: (alertId: string) => alertService.dismissAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circle-alerts', userId] });
    },
  });

  const markAsRead = async (alertId: string) => markAsReadMutation.mutateAsync(alertId);
  const dismissAlert = async (alertId: string) => dismissAlertMutation.mutateAsync(alertId);
  const markAllAsRead = async (alerts: CircleAlert[]) => {
    for (const alert of alerts.filter(a => !a.isRead)) {
      await markAsRead(alert.id);
    }
  };

  return {
    alerts: alertsQuery.data ?? [],
    unreadCount,
    isLoading: alertsQuery.isLoading,
    markAsRead,
    dismissAlert,
    markAllAsRead,
  };
};