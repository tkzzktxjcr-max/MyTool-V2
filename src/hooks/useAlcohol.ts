"use client";

import { useState, useCallback, useMemo } from 'react';
import { 
  createDocument, 
  listDocuments, 
  updateDocument, 
  deleteDocument,
  COLLECTIONS,
} from '@/lib/appwrite';
import { useAuth } from '@/contexts/AuthContext';
import type { 
  AlcoholLog, 
  CreateAlcoholLogForm, 
  AlcoholInsight,
  DrinkType,
  AlcoholContext,
} from '@/types';
import { HEALTH_GUIDELINES, DRINK_TYPES } from '@/types';

export const useAlcohol = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AlcoholLog[]>([]);
  const [loading, setLoading] = useState(false);

  // Calcul des unités : (volume cl × % alc) / 10
  const calculateUnits = (volumeCl: number, abv: number): number => {
    return (volumeCl * abv) / 10;
  };

  const loadLogs = useCallback(async (days: number = 30) => {
    if (!user?.$id) return;

    setLoading(true);
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const response = await listDocuments(COLLECTIONS.ALCOHOL_LOGS, [
        `userId=${user.$id}`,
        `date>="${startDate.toISOString()}"`,
      ]);
      
      setLogs(
        response.documents.map(doc => ({
          id: doc.$id,
          userId: doc.userId,
          date: doc.date,
          drinkType: doc.drinkType as DrinkType,
          volumeCl: doc.volumeCl,
          abv: doc.abv,
          units: doc.units,
          context: doc.context as AlcoholContext | undefined,
          notes: doc.notes,
          mood: doc.mood,
        }))
      );
    } catch (error) {
      console.error('Error loading alcohol logs:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.$id]);

  const createLog = async (form: CreateAlcoholLogForm): Promise<AlcoholLog> => {
    if (!user?.$id) throw new Error('Not authenticated');

    const units = calculateUnits(form.volumeCl, form.abv);

    const doc = await createDocument(COLLECTIONS.ALCOHOL_LOGS, {
      userId: user.$id,
      date: new Date().toISOString(),
      drinkType: form.drinkType,
      volumeCl: form.volumeCl,
      abv: form.abv,
      units,
      context: form.context,
      notes: form.notes,
      mood: form.mood,
    });

    const log: AlcoholLog = {
      id: doc.$id,
      userId: doc.userId,
      date: doc.date,
      drinkType: doc.drinkType as DrinkType,
      volumeCl: doc.volumeCl,
      abv: doc.abv,
      units: doc.units,
      context: doc.context as AlcoholContext | undefined,
      notes: doc.notes,
      mood: doc.mood,
    };

    setLogs(prev => [log, ...prev]);
    return log;
  };

  const deleteLog = async (logId: string): Promise<void> => {
    await deleteDocument(COLLECTIONS.ALCOHOL_LOGS, logId);
    setLogs(prev => prev.filter(l => l.id !== logId));
  };

  // Insights
  const insights = useMemo((): AlcoholInsight | null => {
    if (logs.length === 0) return null;

    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(now);
    monthAgo.setDate(monthAgo.getDate() - 30);

    // Unités totales
    const totalUnits = logs.reduce((sum, l) => sum + l.units, 0);

    // Semaine en cours
    const weeklyLogs = logs.filter(l => new Date(l.date) >= weekAgo);
    const weeklyUnits = weeklyLogs.reduce((sum, l) => sum + l.units, 0);

    // Mois en cours
    const monthlyLogs = logs.filter(l => new Date(l.date) >= monthAgo);
    const monthlyUnits = monthlyLogs.reduce((sum, l) => sum + l.units, 0);

    // Moyenne par jour (semaine)
    const averagePerDay = weeklyLogs.length > 0 
      ? weeklyUnits / 7 
      : 0;

    // Jours au-dessus de la limite
    const daysOverLimit = weeklyLogs.filter(l => l.units > HEALTH_GUIDELINES.maxDailyUnits).length;

    // Tendance quotidienne (7 derniers jours)
    const dailyTrend = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];
      const dayUnits = logs
        .filter(l => l.date.split('T')[0] === dateStr)
        .reduce((sum, l) => sum + l.units, 0);
      return { date: dateStr, units: dayUnits };
    });

    // Tendance hebdomadaire (4 dernières semaines)
    const weeklyTrend = Array.from({ length: 4 }, (_, i) => {
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - (i * 7));
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 7);
      const weekLabel = `S${weekEnd.getWeek ? weekEnd.getWeek() : i + 1}`;
      const weekUnits = logs
        .filter(l => {
          const d = new Date(l.date);
          return d >= weekStart && d < weekEnd;
        })
        .reduce((sum, l) => sum + l.units, 0);
      return { week: weekLabel, units: weekUnits };
    }).reverse();

    // Boisson la plus courante
    const drinkCounts: Record<string, number> = {};
    logs.forEach(l => {
      drinkCounts[l.drinkType] = (drinkCounts[l.drinkType] || 0) + 1;
    });
    const mostCommonDrink = Object.entries(drinkCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] as DrinkType || 'beer';

    // Contexte le plus courant
    const contextCounts: Record<string, number> = {};
    logs.forEach(l => {
      if (l.context) {
        contextCounts[l.context] = (contextCounts[l.context] || 0) + 1;
      }
    });
    const mostCommonContext = Object.entries(contextCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] as AlcoholContext || 'other';

    // Niveau de risque
    let riskLevel: 'low' | 'moderate' | 'high' = 'low';
    if (weeklyUnits > HEALTH_GUIDELINES.maxWeeklyUnits * 1.5) {
      riskLevel = 'high';
    } else if (weeklyUnits > HEALTH_GUIDELINES.maxWeeklyUnits) {
      riskLevel = 'moderate';
    }

    // Recommandations
    const recommendations: string[] = [];
    if (weeklyUnits > HEALTH_GUIDELINES.maxWeeklyUnits) {
      recommendations.push('⚠️ Vous avez dépassé les recommandations de santé cette semaine (14 unités max)');
    }
    if (averagePerDay > HEALTH_GUIDELINES.maxDailyUnits) {
      recommendations.push('📊 Votre consommation quotidienne moyenne est élevée');
    }
    if (monthlyUnits > HEALTH_GUIDELINES.maxWeeklyUnits * 4) {
      recommendations.push('💡 Pensez à prendre des pauses dans votre consommation');
    }
    if (riskLevel === 'low') {
      recommendations.push('✅ Votre consommation est dans les limites recommandées');
    }

    return {
      totalWeeklyUnits: weeklyUnits,
      totalMonthlyUnits: monthlyUnits,
      averagePerDay,
      dailyTrend,
      weeklyTrend,
      isWithinGuidelines: weeklyUnits <= HEALTH_GUIDELINES.maxWeeklyUnits,
      riskLevel,
      daysOverLimit,
      mostCommonDrink,
      mostCommonContext,
      recommendations,
    };
  }, [logs]);

  const getTodayUnits = (): number => {
    const today = new Date().toISOString().split('T')[0];
    return logs
      .filter(l => l.date.split('T')[0] === today)
      .reduce((sum, l) => sum + l.units, 0);
  };

  const getTodaysLogs = (): AlcoholLog[] => {
    const today = new Date().toISOString().split('T')[0];
    return logs.filter(l => l.date.split('T')[0] === today);
  };

  return {
    logs,
    loading,
    insights,
    loadLogs,
    createLog,
    deleteLog,
    calculateUnits,
    getTodayUnits,
    getTodaysLogs,
  };
};