import { databases, APPWRITE_CONFIG, COLLECTIONS, createDocument, listDocuments, updateDocument, deleteDocument, Query } from '@/lib/appwrite';
import type { CustomDrink, AlcoholLog, CreateDrinkForm, DrinkType, MoodType, ContextType, AlcoholInsight } from './types';
import { DRINK_TYPES, HEALTH_GUIDELINES } from './types';

export const alcoholService = {
  async getCustomDrinks(userId: string): Promise<CustomDrink[]> {
    const response = await listDocuments(COLLECTIONS.CUSTOM_DRINKS, [
      Query.equal('userId', userId),
    ]);
    
    return response.documents.map((doc: any) => ({
      id: doc.$id,
      userId: doc.userId,
      name: doc.name,
      type: doc.type as DrinkType,
      abv: doc.abv,
      defaultServingSize: doc.defaultServingSize,
      emoji: doc.emoji,
      isFavorite: doc.isFavorite || false,
      usageCount: doc.usageCount || 0,
      createdAt: doc.$createdAt,
    }));
  },

  async createCustomDrink(userId: string, form: CreateDrinkForm, emoji?: string): Promise<CustomDrink> {
    const doc: any = await createDocument(COLLECTIONS.CUSTOM_DRINKS, {
      userId,
      name: form.name,
      type: form.type,
      abv: form.abv,
      defaultServingSize: form.defaultServingSize,
      emoji: emoji || DRINK_TYPES[form.type].icon,
      isFavorite: false,
      usageCount: 0,
      createdAt: new Date().toISOString(),
    });
    
    return {
      id: doc.$id,
      userId: doc.userId,
      name: doc.name,
      type: doc.type as DrinkType,
      abv: doc.abv,
      defaultServingSize: doc.defaultServingSize,
      emoji: doc.emoji,
      isFavorite: doc.isFavorite || false,
      usageCount: doc.usageCount || 0,
      createdAt: doc.$createdAt,
    };
  },

  async deleteCustomDrink(drinkId: string): Promise<void> {
    await deleteDocument(COLLECTIONS.CUSTOM_DRINKS, drinkId);
  },

  async getLogs(userId: string): Promise<AlcoholLog[]> {
    const response = await listDocuments(COLLECTIONS.ALCOHOL_LOGS, [
      Query.equal('userId', userId),
    ]);
    
    return response.documents.map((doc: any) => ({
      id: doc.$id,
      userId: doc.userId,
      drinkName: DRINK_TYPES[doc.drinkType as DrinkType]?.label || doc.drinkType,
      drinkEmoji: DRINK_TYPES[doc.drinkType as DrinkType]?.icon || '🥤',
      drinkType: doc.drinkType as DrinkType,
      quantity: doc.quantity,
      servingSize: doc.volumeCl,
      abv: doc.abv,
      units: doc.units,
      context: doc.context,
      mood: doc.mood,
      timestamp: doc.date,
      notes: doc.notes,
    }));
  },

  async createLog(
    userId: string,
    data: {
      drinkType: DrinkType;
      quantity: number;
      servingSize: number;
      abv: number;
      mood?: MoodType;
      context?: ContextType;
      notes?: string;
    }
  ): Promise<AlcoholLog> {
    const units = (data.quantity * data.servingSize * data.abv) / 10;
    
    const doc: any = await createDocument(COLLECTIONS.ALCOHOL_LOGS, {
      userId,
      date: new Date().toISOString(),
      drinkType: data.drinkType,
      volumeCl: data.servingSize,
      abv: data.abv,
      units,
      quantity: data.quantity,
      context: data.context || null,
      mood: data.mood || null,
      notes: data.notes || null,
    });

    return {
      id: doc.$id,
      userId: doc.userId,
      drinkName: DRINK_TYPES[data.drinkType]?.label || data.drinkType,
      drinkEmoji: DRINK_TYPES[data.drinkType]?.icon || '🥤',
      drinkType: doc.drinkType as DrinkType,
      quantity: doc.quantity,
      servingSize: doc.volumeCl,
      abv: doc.abv,
      units: doc.units,
      context: doc.context,
      mood: doc.mood,
      timestamp: doc.date,
      notes: doc.notes,
    };
  },

  async deleteLog(logId: string): Promise<void> {
    await deleteDocument(COLLECTIONS.ALCOHOL_LOGS, logId);
  },

  calculateInsights(logs: AlcoholLog[]): AlcoholInsight | null {
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

    const contextBreakdown = {} as Record<ContextType, number>;
    weeklyLogs.forEach(log => {
      if (log.context) {
        contextBreakdown[log.context] = (contextBreakdown[log.context] || 0) + 1;
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
      patterns.push('🍺 Consommation plus élevée le week-end');
    }
    
    const typeEntries = Object.entries(drinkTypeBreakdown).sort((a, b) => b[1].units - a[1].units);
    if (typeEntries[0] && typeEntries[0][1].units > 0) {
      const typeName = DRINK_TYPES[typeEntries[0][0] as DrinkType]?.label || typeEntries[0][0];
      patterns.push(`🍷 ${typeName} est votre préféré cette semaine`);
    }

    let riskLevel: 'low' | 'moderate' | 'high' = 'low';
    if (weeklyUnits > HEALTH_GUIDELINES.maxWeeklyUnits * 1.5) {
      riskLevel = 'high';
    } else if (weeklyUnits > HEALTH_GUIDELINES.maxWeeklyUnits) {
      riskLevel = 'moderate';
    }

    const recommendations: string[] = [];
    if (weeklyUnits > HEALTH_GUIDELINES.maxWeeklyUnits) {
      recommendations.push('⚠️ Dépassement des recommandations de santé');
    }
    if (weeklyUnits <= HEALTH_GUIDELINES.maxWeeklyUnits) {
      recommendations.push('✅ Consommation dans les limites recommandées');
    }

    const weeklyGoalProgress = Math.min((weeklyUnits / HEALTH_GUIDELINES.maxWeeklyUnits) * 100, 100);

    return {
      totalWeeklyUnits: weeklyUnits,
      totalMonthlyUnits: monthlyUnits,
      averagePerDay,
      dailyTrend,
      weeklyTrend,
      drinkTypeBreakdown,
      moodBreakdown,
      contextBreakdown,
      patterns,
      riskLevel,
      recommendations,
      weeklyGoalProgress,
      streak: 0,
    };
  },
};