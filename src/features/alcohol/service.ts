import { databases, APPWRITE_CONFIG, COLLECTIONS, createDocument, listDocuments, deleteDocument, Query } from '@/lib/appwrite';
import type { AlcoholLog, DrinkType, MoodType, AlcoholInsight, AlcoholGoal } from './types';
import { DRINK_TYPES, HEALTH_GUIDELINES } from './types';

const calculateUnits = (volumeCl: number, abv: number): number => {
  return (volumeCl * abv / 100 * 0.789) / 10;
};

export const alcoholService = {
  async getLogs(userId: string): Promise<AlcoholLog[]> {
    const response = await listDocuments(COLLECTIONS.ALCOHOL_LOGS, [
      Query.equal('userId', userId),
    ]);
    
    return response.documents.map((doc: any) => ({
      id: doc.$id,
      userId: doc.userId,
      // Utiliser le nom stocké, sinon le default
      drinkName: doc.drinkName || DRINK_TYPES[doc.drinkType as DrinkType]?.label || doc.drinkType,
      drinkEmoji: doc.drinkEmoji || DRINK_TYPES[doc.drinkType as DrinkType]?.icon || '🥤',
      drinkType: doc.drinkType as DrinkType,
      quantity: 1,
      servingSize: doc.volumeCl,
      abv: doc.abv,
      units: doc.units,
      mood: doc.mood,
      timestamp: doc.date,
      notes: doc.notes,
    }));
  },

  async createLog(
    userId: string,
    data: {
      drinkType: DrinkType;
      servingSize: number;
      abv: number;
      mood?: MoodType;
      notes?: string;
      drinkName?: string;   // ← AJOUTÉ
      drinkEmoji?: string;  // ← AJOUTÉ
    }
  ): Promise<AlcoholLog> {
    const units = calculateUnits(data.servingSize, data.abv);
    
    const doc: any = await createDocument(COLLECTIONS.ALCOHOL_LOGS, {
      userId,
      date: new Date().toISOString(),
      drinkType: data.drinkType,
      volumeCl: data.servingSize,
      abv: data.abv,
      units,
      mood: data.mood || null,
      notes: data.notes || null,
      // Stocker le nom et emoji personnalisé
      drinkName: data.drinkName || DRINK_TYPES[data.drinkType]?.label,
      drinkEmoji: data.drinkEmoji || DRINK_TYPES[data.drinkType]?.icon,
    });

    return {
      id: doc.$id,
      userId: doc.userId,
      drinkName: doc.drinkName,
      drinkEmoji: doc.drinkEmoji,
      drinkType: doc.drinkType as DrinkType,
      quantity: 1,
      servingSize: doc.volumeCl,
      abv: doc.abv,
      units: doc.units,
      mood: doc.mood,
      timestamp: doc.date,
      notes: doc.notes,
    };
  },

  async deleteLog(logId: string): Promise<void> {
    await deleteDocument(COLLECTIONS.ALCOHOL_LOGS, logId);
  },

  calculateInsights(logs: AlcoholLog[], goal: AlcoholGoal | null): AlcoholInsight | null {
    if (logs.length === 0) return null;

    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(now);
    monthAgo.setDate(monthAgo.getDate() - 30);

    const weeklyLogs = logs.filter(l => new Date(l.timestamp) >= weekAgo);
    const weeklyUnits = weeklyLogs.reduce((sum, l) => sum + l.units, 0);
    const monthlyUnits = logs.filter(l => new Date(l.timestamp) >= monthAgo).reduce((sum, l) => sum + l.units, 0);
    const averagePerDay = weeklyLogs.length > 0 ? weeklyUnits / 7 : 0;

    const dailyTrend = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];
      const dayUnits = logs.filter(l => l.timestamp.split('T')[0] === dateStr).reduce((sum, l) => sum + l.units, 0);
      return { date: dateStr, units: dayUnits };
    });

    const weeklyTrend = Array.from({ length: 4 }, (_, i) => {
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - (i * 7));
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 7);
      const weekLabel = `S${4 - i}`;
      const weekUnits = logs.filter(l => {
        const d = new Date(l.timestamp);
        return d >= weekStart && d < weekEnd;
      }).reduce((sum, l) => sum + l.units, 0);
      return { week: weekLabel, units: weekUnits };
    }).reverse();

    const drinkTypeBreakdown = Object.keys(DRINK_TYPES).reduce((acc, type) => {
      acc[type as DrinkType] = { count: 0, units: 0 };
      return acc;
    }, {} as Record<DrinkType, { count: number; units: number }>);
    
    weeklyLogs.forEach(log => {
      drinkTypeBreakdown[log.drinkType].count++;
      drinkTypeBreakdown[log.drinkType].units += log.units;
    });

    const moodBreakdown = {} as Record<MoodType, number>;
    weeklyLogs.forEach(log => {
      if (log.mood) {
        moodBreakdown[log.mood] = (moodBreakdown[log.mood] || 0) + 1;
      }
    });

    const patterns: string[] = [];
    
    const weekendUnits = weeklyLogs.filter(l => {
      const day = new Date(l.timestamp).getDay();
      return day === 0 || day === 6;
    }).reduce((sum, l) => sum + l.units, 0);
    
    const weekdayUnits = weeklyLogs.filter(l => {
      const day = new Date(l.timestamp).getDay();
      return day !== 0 && day !== 6;
    }).reduce((sum, l) => sum + l.units, 0);
    
    const weekendCount = weeklyLogs.filter(l => {
      const day = new Date(l.timestamp).getDay();
      return day === 0 || day === 6;
    }).length;
    
    if (weekendUnits > weekdayUnits * 1.5 && weekendCount > 2) {
      patterns.push('🍺 +50% le week-end');
    }
    
    const typeEntries = Object.entries(drinkTypeBreakdown).sort((a, b) => b[1].units - a[1].units);
    if (typeEntries[0] && typeEntries[0][1].units > 0) {
      const typeName = DRINK_TYPES[typeEntries[0][0] as DrinkType]?.label || typeEntries[0][0];
      patterns.push(`🍷 ${typeName} favorit${typeEntries[0][0] === 'wine' ? 'e' : ''}`);
    }

    if (Object.keys(moodBreakdown).length > 0) {
      const topMood = Object.entries(moodBreakdown).sort((a, b) => b[1] - a[1])[0];
      if (topMood) {
        patterns.push(`😊 Principalement ${topMood[0]}`);
      }
    }

    const effectiveLimit = goal?.weeklyLimit || HEALTH_GUIDELINES.maxWeeklyUnits;
    let riskLevel: 'low' | 'moderate' | 'high' = 'low';
    if (weeklyUnits > effectiveLimit * 1.5) {
      riskLevel = 'high';
    } else if (weeklyUnits > effectiveLimit) {
      riskLevel = 'moderate';
    }

    const recommendations: string[] = [];
    if (weeklyUnits > effectiveLimit) {
      recommendations.push('⚠️ Au-delà de votre objectif');
    } else {
      recommendations.push('✅ Dans les limites');
    }
    
    if (weeklyUnits <= effectiveLimit * 0.5) {
      recommendations.push('✨ Consommation modérée');
    }

    const weeklyGoalProgress = Math.min((weeklyUnits / effectiveLimit) * 100, 100);

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    for (let i = 0; i <= 30; i++) {
      const checkDate = new Date(now);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      const hasDrinks = logs.some(l => l.timestamp.split('T')[0] === dateStr);
      if (!hasDrinks) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return {
      totalWeeklyUnits: weeklyUnits,
      totalMonthlyUnits: monthlyUnits,
      averagePerDay,
      dailyTrend,
      weeklyTrend,
      drinkTypeBreakdown,
      moodBreakdown,
      contextBreakdown: {},
      patterns,
      riskLevel,
      recommendations,
      weeklyGoalProgress,
      streak,
    };
  },
};