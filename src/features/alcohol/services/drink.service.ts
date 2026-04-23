import { databases, APPWRITE_CONFIG, COLLECTIONS, createDocument, listDocuments, updateDocument, deleteDocument, Query } from '@/lib/appwrite';
import type { CustomDrink, AlcoholLog, CreateDrinkForm, DrinkType, MoodType, ContextType } from './types';
import { DRINK_TYPES, HEALTH_GUIDELINES } from './types';

export const drinkService = {
  // Custom drinks
  async getCustomDrinks(userId: string): Promise<CustomDrink[]> {
    const response = await listDocuments(COLLECTIONS.CUSTOM_DRINKS, [
      Query.equal('userId', userId),
      Query.orderDesc('usageCount'),
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
      isFavorite: doc.isFavorite,
      usageCount: doc.usageCount || 0,
      createdAt: doc.$createdAt,
    };
  },

  async incrementUsageCount(drinkId: string): Promise<void> {
    const drinks = await listDocuments(COLLECTIONS.CUSTOM_DRINKS, []);
    const drink = drinks.documents.find((d: any) => d.$id === drinkId);
    if (drink) {
      await updateDocument(COLLECTIONS.CUSTOM_DRINKS, drinkId, {
        usageCount: (drink.usageCount || 0) + 1,
      });
    }
  },

  async deleteCustomDrink(drinkId: string): Promise<void> {
    await deleteDocument(COLLECTIONS.CUSTOM_DRINKS, drinkId);
  },

  // Drink logs
  async getLogs(userId: string, limit = 50): Promise<AlcoholLog[]> {
    const response = await listDocuments(COLLECTIONS.ALCOHOL_LOGS, [
      Query.equal('userId', userId),
      Query.orderDesc('timestamp'),
      Query.limit(limit),
    ]);
    
    return response.documents.map((doc: any) => ({
      id: doc.$id,
      userId: doc.userId,
      drinkId: doc.drinkId,
      drinkName: doc.drinkName,
      drinkEmoji: doc.drinkEmoji,
      drinkType: doc.drinkType,
      quantity: doc.quantity,
      servingSize: doc.servingSize,
      abv: doc.abv,
      units: doc.units,
      context: doc.context,
      mood: doc.mood,
      timestamp: doc.timestamp,
      notes: doc.notes,
    }));
  },

  async createLog(
    userId: string,
    data: {
      drinkId?: string;
      drinkName: string;
      drinkEmoji: string;
      drinkType: DrinkType;
      quantity: number;
      servingSize: number;
      abv: number;
      context?: ContextType;
      mood?: MoodType;
      notes?: string;
    }
  ): Promise<AlcoholLog> {
    const units = (data.quantity * data.servingSize * data.abv) / 10;
    
    const doc: any = await createDocument(COLLECTIONS.ALCOHOL_LOGS, {
      userId,
      drinkId: data.drinkId || null,
      drinkName: data.drinkName,
      drinkEmoji: data.drinkEmoji,
      drinkType: data.drinkType,
      quantity: data.quantity,
      servingSize: data.servingSize,
      abv: data.abv,
      units,
      context: data.context || null,
      mood: data.mood || null,
      timestamp: new Date().toISOString(),
      notes: data.notes || null,
    });

    // Increment usage count if custom drink
    if (data.drinkId) {
      await this.incrementUsageCount(data.drinkId);
    }

    return {
      id: doc.$id,
      userId: doc.userId,
      drinkId: doc.drinkId,
      drinkName: doc.drinkName,
      drinkEmoji: doc.drinkEmoji,
      drinkType: doc.drinkType,
      quantity: doc.quantity,
      servingSize: doc.servingSize,
      abv: doc.abv,
      units: doc.units,
      context: doc.context,
      mood: doc.mood,
      timestamp: doc.timestamp,
      notes: doc.notes,
    };
  },

  async deleteLog(logId: string): Promise<void> {
    await deleteDocument(COLLECTIONS.ALCOHOL_LOGS, logId);
  },

  // Goals
  async getGoals(userId: string) {
    const response = await listDocuments(COLLECTIONS.ALCOHOL_GOALS, [
      Query.equal('userId', userId),
    ]);
    
    if (response.documents.length === 0) {
      // Create default goals
      const doc: any = await createDocument(COLLECTIONS.ALCOHOL_GOALS, {
        userId,
        weeklyLimit: HEALTH_GUIDELINES.maxWeeklyUnits,
        reductionGoal: null,
        currentStreak: 0,
        longestStreak: 0,
        preferences: {
          showInsights: true,
          shareWithFamily: false,
          trackMood: true,
        },
      });
      return doc;
    }
    
    return response.documents[0];
  },

  async updateGoals(goalsId: string, data: any): Promise<void> {
    await updateDocument(COLLECTIONS.ALCOHOL_GOALS, goalsId, data);
  },

  // Insights calculation
  calculateInsights(logs: AlcoholLog[]) {
    if (logs.length === 0) {
      return null;
    }

    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(now);
    monthAgo.setDate(monthAgo.getDate() - 30);

    // Weekly stats
    const weeklyLogs = logs.filter(l => new Date(l.timestamp) >= weekAgo);
    const weeklyUnits = weeklyLogs.reduce((sum, l) => sum + l.units, 0);
    
    // Monthly stats
    const monthlyLogs = logs.filter(l => new Date(l.timestamp) >= monthAgo);
    const monthlyUnits = monthlyLogs.reduce((sum, l) => sum + l.units, 0);
    
    // Daily trend (last 7 days)
    const dailyTrend = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];
      const dayUnits = logs
        .filter(l => l.timestamp.split('T')[0] === dateStr)
        .reduce((sum, l) => sum + l.units, 0);
      return { date: dateStr, units: dayUnits };
    });

    // Weekly trend (last 4 weeks)
    const weeklyTrend = Array.from({ length: 4 }, (_, i) => {
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - (i * 7));
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 7);
      const weekLabel = `S${4 - i}`;
      const weekUnits = logs
        .filter(l => {
          const d = new Date(l.timestamp);
          return d >= weekStart && d < weekEnd;
        })
        .reduce((sum, l) => sum + l.units, 0);
      return { week: weekLabel, units: weekUnits };
    }).reverse();

    // Drink type breakdown
    const drinkTypeBreakdown = Object.keys(DRINK_TYPES).reduce((acc, type) => {
      acc[type as DrinkType] = {
        count: 0,
        units: 0,
      };
      return acc;
    }, {} as Record<DrinkType, { count: number; units: number }>);
    
    weeklyLogs.forEach(log => {
      drinkTypeBreakdown[log.drinkType].count++;
      drinkTypeBreakdown[log.drinkType].units += log.units;
    });

    // Mood breakdown
    const moodBreakdown = {} as Record<MoodType, number>;
    weeklyLogs.forEach(log => {
      if (log.mood) {
        moodBreakdown[log.mood] = (moodBreakdown[log.mood] || 0) + 1;
      }
    });

    // Context breakdown
    const contextBreakdown = {} as Record<ContextType, number>;
    weeklyLogs.forEach(log => {
      if (log.context) {
        contextBreakdown[log.context] = (contextBreakdown[log.context] || 0) + 1;
      }
    });

    // Pattern detection
    const patterns: string[] = [];
    
    // Weekend vs weekday
    const weekendUnits = weeklyLogs
      .filter(l => {
        const day = new Date(l.timestamp).getDay();
        return day === 0 || day === 6;
      })
      .reduce((sum, l) => sum + l.units, 0);
    
    const weekdayLogs = weeklyLogs.filter(l => {
      const day = new Date(l.timestamp).getDay();
      return day !== 0 && day !== 6;
    });
    const weekdayUnits = weekdayLogs.reduce((sum, l) => sum + l.units, 0);
    
    const weekendCount = weeklyLogs.filter(l => {
      const day = new Date(l.timestamp).getDay();
      return day === 0 || day === 6;
    }).length;
    
    if (weekendUnits > weekdayUnits * 1.5 && weekendCount > 2) {
      patterns.push('🍺 Consommation plus élevée le week-end');
    }
    
    // Most consumed type
    const typeEntries = Object.entries(drinkTypeBreakdown).sort((a, b) => b[1].units - a[1].units);
    if (typeEntries[0] && typeEntries[0][1].units > 0) {
      const typeName = DRINK_TYPES[typeEntries[0][0] as DrinkType]?.label || typeEntries[0][0];
      patterns.push(`🍷 ${typeName} est votre préféré cette semaine`);
    }
    
    // Mood correlation
    if (Object.keys(moodBreakdown).length > 0) {
      patterns.push(`😊 Vous êtes plutôt ${Object.keys(moodBreakdown).length} humeurs cette semaine`);
    }

    // Risk level
    let riskLevel: 'low' | 'moderate' | 'high' = 'low';
    if (weeklyUnits > HEALTH_GUIDELINES.maxWeeklyUnits * 1.5) {
      riskLevel = 'high';
    } else if (weeklyUnits > HEALTH_GUIDELINES.maxWeeklyUnits) {
      riskLevel = 'moderate';
    }

    // Recommendations
    const recommendations: string[] = [];
    if (weeklyUnits > HEALTH_GUIDELINES.maxWeeklyUnits) {
      recommendations.push('⚠️ Dépassement des recommandations de santé');
    }
    if (weeklyUnits <= HEALTH_GUIDELINES.maxWeeklyUnits) {
      recommendations.push('✨ Consommation dans les limites recommandées');
    }

    // Goal progress
    const weeklyGoalProgress = Math.min((weeklyUnits / HEALTH_GUIDELINES.maxWeeklyUnits) * 100, 100);

    return {
      totalWeeklyUnits: weeklyUnits,
      totalMonthlyUnits: monthlyUnits,
      averagePerDay: weeklyUnits / 7,
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