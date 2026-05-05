import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context';
import { alcoholService } from '@/features/alcohol/services';
import { calculateFinancialStats, generateBudgetProjections } from '@/features/wellbeing/utils/financial';
import { startOfMonth, subMonths, format } from 'date-fns';
import type { AlcoholLog } from '@/features/alcohol/types';

const STALE_TIME = 2 * 60 * 1000;

const AVERAGE_PRICES: Record<string, number> = {
  beer: 4, wine: 5, spirit: 8, cocktail: 12, cider: 5, other: 5,
};

export interface MonthlyData { month: string; spend: number; units: number; }
export interface WeeklyTrend { week: string; spend: number; units: number; }
export interface UseFinancialHistoryResult {
  monthlyHistory: MonthlyData[];
  weeklyHistory: WeeklyTrend[];
  projections: { label: string; value: number; percentage: number }[];
  currentStats: ReturnType<typeof calculateFinancialStats>;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export const useFinancialHistory = (): UseFinancialHistoryResult => {
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

  const monthlyHistory = useMemo((): MonthlyData[] => {
    const history: MonthlyData[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = i === 0 ? now : subMonths(startOfMonth(now), i - 1);
      const monthLogs = logs.filter((log: AlcoholLog) => {
        const logDate = new Date(log.timestamp);
        return logDate >= monthStart && (i === 0 || logDate < monthEnd);
      });
      const spend = monthLogs.reduce((sum: number, log: AlcoholLog) => sum + (AVERAGE_PRICES[log.drinkType] || 5) * (log.quantity || 1), 0);
      const units = monthLogs.reduce((sum: number, log: AlcoholLog) => sum + (log.units || 0), 0);
      history.push({ month: format(monthStart, 'MMM yyyy'), spend: Math.round(spend * 100) / 100, units: Math.round(units * 10) / 10 });
    }
    return history;
  }, [logs]);

  const weeklyHistory = useMemo((): WeeklyTrend[] => {
    const history: WeeklyTrend[] = [];
    const now = new Date();

    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now); weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
      const weekEnd = new Date(now); weekEnd.setDate(weekEnd.getDate() - i * 7);
      const weekLogs = logs.filter((log: AlcoholLog) => {
        const logDate = new Date(log.timestamp);
        return logDate >= weekStart && logDate < weekEnd;
      });
      const spend = weekLogs.reduce((sum: number, log: AlcoholLog) => sum + (AVERAGE_PRICES[log.drinkType] || 5) * (log.quantity || 1), 0);
      const units = weekLogs.reduce((sum: number, log: AlcoholLog) => sum + (log.units || 0), 0);
      history.push({ week: `S${4 - i}`, spend: Math.round(spend * 100) / 100, units: Math.round(units * 10) / 10 });
    }
    return history;
  }, [logs]);

  const currentStats = useMemo(() => calculateFinancialStats(logs), [logs]);
  const projections = useMemo(() => generateBudgetProjections(currentStats.monthlySpend, 6), [currentStats.monthlySpend]);

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['alcohol-logs', userId] });
  };

  return { monthlyHistory, weeklyHistory, projections, currentStats, isLoading: logsQuery.isLoading, refresh };
};