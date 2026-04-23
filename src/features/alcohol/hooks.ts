import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/features/auth/context';
import { alcoholService } from './service';
import type { AlcoholLog, CreateAlcoholLogForm, AlcoholInsight } from './types';
import { HEALTH_GUIDELINES } from './types';

export const useAlcohol = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AlcoholLog[]>([]);
  const [loading, setLoading] = useState(false);

  const loadLogs = useCallback(async () => {
    if (!user?.$id) return;
    setLoading(true);
    try { const data = await alcoholService.getLogs(user.$id); setLogs(data); }
    catch { console.error('Error loading logs:', error); }
    finally { setLoading(false); }
  }, [user?.$id]);

  const createLog = async (form: CreateAlcoholLogForm): Promise<AlcoholLog> => {
    if (!user?.$id) throw new Error('Not authenticated');
    const log = await alcoholService.createLog(user.$id, form);
    setLogs(prev => [log, ...prev]);
    return log;
  };

  const deleteLog = async (logId: string): Promise<void> => {
    const log = logs.find(l => l.id === logId);
    if (!log || log.userId !== user?.$id) throw new Error('Unauthorized');
    await alcoholService.deleteLog(logId);
    setLogs(prev => prev.filter(l => l.id !== logId));
  };

  const calculateUnits = (volumeCl: number, abv: number): number => (volumeCl * abv) / 10;
  const getTodayUnits = (): number => { const today = new Date().toISOString().split('T')[0]; return logs.filter(l => l.date.split('T')[0] === today).reduce((sum, l) => sum + l.units, 0); };

  const insights = useMemo((): AlcoholInsight | null => {
    if (logs.length === 0) return null;
    const now = new Date();
    const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(now); monthAgo.setDate(monthAgo.getDate() - 30);
    const weeklyLogs = logs.filter(l => new Date(l.date) >= weekAgo);
    const weeklyUnits = weeklyLogs.reduce((sum, l) => sum + l.units, 0);
    const monthlyUnits = logs.filter(l => new Date(l.date) >= monthAgo).reduce((sum, l) => sum + l.units, 0);
    const averagePerDay = weeklyLogs.length > 0 ? weeklyUnits / 7 : 0;
    const dailyTrend = Array.from({ length: 7 }, (_, i) => { const date = new Date(now); date.setDate(date.getDate() - (6 - i)); const dateStr = date.toISOString().split('T')[0]; const dayUnits = logs.filter(l => l.date.split('T')[0] === dateStr).reduce((sum, l) => sum + l.units, 0); return { date: dateStr, units: dayUnits }; });
    let riskLevel: 'low' | 'moderate' | 'high' = 'low';
    if (weeklyUnits > HEALTH_GUIDELINES.maxWeeklyUnits * 1.5) riskLevel = 'high';
    else if (weeklyUnits > HEALTH_GUIDELINES.maxWeeklyUnits) riskLevel = 'moderate';
    const recommendations: string[] = [];
    if (weeklyUnits > HEALTH_GUIDELINES.maxWeeklyUnits) recommendations.push('⚠️ Dépassement des recommandations');
    if (riskLevel === 'low') recommendations.push('✅ Consommation dans les limites');
    return { totalWeeklyUnits: weeklyUnits, totalMonthlyUnits: monthlyUnits, averagePerDay, dailyTrend, riskLevel, recommendations };
  }, [logs]);

  return { logs, loading, insights, loadLogs, createLog, deleteLog, calculateUnits, getTodayUnits };
};