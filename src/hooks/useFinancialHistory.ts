import { useState, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from '@/features/auth/context';
import { alcoholService } from '@/features/alcohol/services';
import { calculateFinancialStats, generateBudgetProjections } from '@/features/wellbeing/utils/financial';
import { startOfMonth, subMonths, format } from 'date-fns';

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
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadHistory = useCallback(async () => {
    if (!user?.$id) return;
    setIsLoading(true);
    try {
      const alcoholLogs = await alcoholService.getLogs(user.$id);
      setLogs(alcoholLogs);
    } catch {
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.$id]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const monthlyHistory = useMemo((): MonthlyData[] => {
    const history: MonthlyData[] = [];
    const now = new Date();
    const priceMap: Record<string, number> = { beer: 4, wine: 5, spirit: 8, cocktail: 12, cider: 5, other: 5 };

    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = subMonths(startOfMonth(now), i - 1);
      const monthLogs = logs.filter((log: any) => {
        const logDate = new Date(log.timestamp);
        return logDate >= monthStart && (i === 0 || logDate < monthEnd);
      });
      const spend = monthLogs.reduce((sum: number, log: any) => sum + (priceMap[log.drinkType] || 5) * (log.quantity || 1), 0);
      const units = monthLogs.reduce((sum: number, log: any) => sum + (log.units || 0), 0);
      history.push({ month: format(monthStart, 'MMM yyyy'), spend: Math.round(spend * 100) / 100, units: Math.round(units * 10) / 10 });
    }
    return history;
  }, [logs]);

  const weeklyHistory = useMemo((): WeeklyTrend[] => {
    const history: WeeklyTrend[] = [];
    const now = new Date();
    const priceMap: Record<string, number> = { beer: 4, wine: 5, spirit: 8, cocktail: 12, cider: 5, other: 5 };

    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now); weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
      const weekEnd = new Date(now); weekEnd.setDate(weekEnd.getDate() - i * 7);
      const weekLogs = logs.filter((log: any) => {
        const logDate = new Date(log.timestamp);
        return logDate >= weekStart && logDate < weekEnd;
      });
      const spend = weekLogs.reduce((sum: number, log: any) => sum + (priceMap[log.drinkType] || 5) * (log.quantity || 1), 0);
      const units = weekLogs.reduce((sum: number, log: any) => sum + (log.units || 0), 0);
      history.push({ week: `S${4 - i}`, spend: Math.round(spend * 100) / 100, units: Math.round(units * 10) / 10 });
    }
    return history;
  }, [logs]);

  const currentStats = useMemo(() => calculateFinancialStats(logs), [logs]);
  const projections = useMemo(() => generateBudgetProjections(currentStats.monthlySpend, 6), [currentStats.monthlySpend]);

  return { monthlyHistory, weeklyHistory, projections, currentStats, isLoading, refresh: loadHistory };
};