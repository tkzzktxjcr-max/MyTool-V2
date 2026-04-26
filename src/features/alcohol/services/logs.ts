import { createDocument, deleteDocument, listDocuments, Query } from '@/lib/appwrite';
import { COLLECTIONS } from '@/lib/appwrite';
import { DRINK_TYPES, HEALTH_GUIDELINES, type DrinkType, type MoodType, type AlcoholLog, type AlcoholInsight, type AlcoholGoal } from '../types';
import { calculateUnitsWithQuantity } from '../utils/units';
import type { Drink } from './drinks';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

const DRINKS_BY_TIME: Record<TimeOfDay, DrinkType[]> = {
  morning: ['beer', 'cider', 'sparkling'],
  afternoon: ['wine', 'beer', 'cider', 'rose_wine'],
  evening: ['wine', 'beer', 'cocktail', 'aperol_spritz', 'rose_wine'],
  night: ['spirit', 'whisky', 'vodka', 'rum', 'cocktail', 'beer'],
};

export const getTimeOfDay = (): TimeOfDay => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

export const calculateDrinkPopularity = (drinks: Drink[], logs: AlcoholLog[]): Record<string, number> => {
  const popularity: Record<string, number> = {};
  logs.forEach(log => {
    const drink = drinks.find(d => d.id === log.drinkType || d.type === log.drinkType);
    if (drink) popularity[drink.id] = (popularity[drink.id] || 0) + (log.quantity || 1);
  });
  drinks.forEach(drink => { popularity[drink.id] = (popularity[drink.id] || 0) + (drink.usageCount || 0) * 2; });
  return popularity;
};

export const getSmartSuggestedFavorites = (drinks: Drink[], logs: AlcoholLog[], count: number = 3): Drink[] => {
  const timeOfDay = getTimeOfDay();
  const preferredTypes = DRINKS_BY_TIME[timeOfDay];
  const popularity = calculateDrinkPopularity(drinks, logs);
  const scoredDrinks = drinks.map(drink => {
    let score = popularity[drink.id] || 0;
    if (preferredTypes.includes(drink.type)) score += 10;
    if (drink.isFavorite) score += 5;
    if (drink.isGlobal) score += 2;
    return { drink, score };
  });
  return scoredDrinks.sort((a, b) => b.score - a.score).slice(0, count).map(s => s.drink);
};

export const getSmartDrinksForTime = (drinks: Drink[], timeOfDay: TimeOfDay): Drink[] => {
  const preferredTypes = DRINKS_BY_TIME[timeOfDay];
  return [...drinks].sort((a, b) => {
    const aPreferred = preferredTypes.includes(a.type);
    const bPreferred = preferredTypes.includes(b.type);
    if (aPreferred && !bPreferred) return -1;
    if (!aPreferred && bPreferred) return 1;
    return (b.usageCount || 0) - (a.usageCount || 0);
  });
};

export const alcoholService = {
  async getLogs(userId: string): Promise<AlcoholLog[]> {
    try {
      const response = await listDocuments(COLLECTIONS.ALCOHOL_LOGS, [Query.equal('userId', userId)]);
      return response.documents.map((doc: any) => ({
        id: doc.$id, userId: doc.userId,
        drinkName: doc.drinkName || DRINK_TYPES[doc.drinkType as DrinkType]?.label || doc.drinkType,
        drinkEmoji: doc.drinkEmoji || DRINK_TYPES[doc.drinkType as DrinkType]?.icon || '🥤',
        drinkType: doc.drinkType as DrinkType, quantity: doc.quantity || 1,
        servingSize: doc.volumeCl || doc.servingSize || 33, abv: doc.abv, units: doc.units,
        mood: doc.mood, timestamp: doc.date || doc.timestamp, notes: doc.notes,
      }));
    } catch { return []; }
  },

  async createLog(userId: string, data: {
    drinkType: DrinkType; servingSize: number; abv: number; mood?: MoodType;
    notes?: string; drinkName?: string; drinkEmoji?: string; quantity?: number; timestamp?: string;
  }): Promise<AlcoholLog> {
    const quantity = data.quantity || 1;
    const units = calculateUnitsWithQuantity(data.servingSize, data.abv, quantity);
    const doc: any = await createDocument(COLLECTIONS.ALCOHOL_LOGS, {
      userId, date: data.timestamp || new Date().toISOString(), drinkType: data.drinkType,
      volumeCl: data.servingSize, abv: data.abv, units, quantity, mood: data.mood || null,
      notes: data.notes || null, drinkName: data.drinkName || DRINK_TYPES[data.drinkType]?.label,
      drinkEmoji: data.drinkEmoji || DRINK_TYPES[data.drinkType]?.icon,
    });
    return { id: doc.$id, userId: doc.userId, drinkName: doc.drinkName, drinkEmoji: doc.drinkEmoji,
      drinkType: doc.drinkType as DrinkType, quantity: doc.quantity || 1, servingSize: doc.volumeCl || 33,
      abv: doc.abv, units: doc.units, mood: doc.mood, timestamp: doc.date, notes: doc.notes };
  },

  async deleteLog(logId: string): Promise<void> {
    await deleteDocument(COLLECTIONS.ALCOHOL_LOGS, logId);
  },

  calculateInsights(logs: AlcoholLog[], goal: AlcoholGoal | null): AlcoholInsight | null {
    if (logs.length === 0) {
      const now = new Date();
      return {
        totalWeeklyUnits: 0, totalMonthlyUnits: 0, averagePerDay: 0,
        dailyTrend: Array.from({ length: 7 }, (_, i) => {
          const date = new Date(now); date.setDate(date.getDate() - (6 - i));
          return { date: date.toISOString().split('T')[0], units: 0 };
        }),
        weeklyTrend: [], drinkTypeBreakdown: Object.keys(DRINK_TYPES).reduce((acc, type) => {
          acc[type as DrinkType] = { count: 0, units: 0 }; return acc;
        }, {} as Record<DrinkType, { count: number; units: number }>),
        moodBreakdown: {} as Record<MoodType, number>, contextBreakdown: {}, patterns: [],
        riskLevel: 'low' as const, recommendations: [], weeklyGoalProgress: 0, streak: 0,
      };
    }

    const now = new Date();
    const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(now); monthAgo.setDate(monthAgo.getDate() - 30);
    const weeklyLogs = logs.filter(l => new Date(l.timestamp) >= weekAgo);
    const weeklyUnits = weeklyLogs.reduce((sum, l) => sum + (l.units || 0), 0);
    const monthlyUnits = logs.filter(l => new Date(l.timestamp) >= monthAgo).reduce((sum, l) => sum + (l.units || 0), 0);
    const averagePerDay = weeklyLogs.length > 0 ? weeklyUnits / 7 : 0;

    const dailyTrend = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now); date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];
      return { date: dateStr, units: Math.round(weeklyLogs.filter(l => l.timestamp.split('T')[0] === dateStr).reduce((sum, l) => sum + (l.units || 0), 0) * 10) / 10 };
    });

    const weeklyTrend = Array.from({ length: 4 }, (_, i) => {
      const weekEnd = new Date(now); weekEnd.setDate(weekEnd.getDate() - (i * 7));
      const weekStart = new Date(weekEnd); weekStart.setDate(weekStart.getDate() - 7);
      const weekUnits = logs.filter(l => { const d = new Date(l.timestamp); return d >= weekStart && d < weekEnd; }).reduce((sum, l) => sum + (l.units || 0), 0);
      return { week: `S${4 - i}`, units: Math.round(weekUnits * 10) / 10 };
    }).reverse();

    const drinkTypeBreakdown = Object.keys(DRINK_TYPES).reduce((acc, type) => {
      acc[type as DrinkType] = { count: 0, units: 0 }; return acc;
    }, {} as Record<DrinkType, { count: number; units: number }>);
    weeklyLogs.forEach(log => {
      if (drinkTypeBreakdown[log.drinkType]) {
        drinkTypeBreakdown[log.drinkType].count += log.quantity || 1;
        drinkTypeBreakdown[log.drinkType].units += log.units || 0;
      }
    });

    const moodBreakdown = {} as Record<MoodType, number>;
    weeklyLogs.forEach(log => { if (log.mood) moodBreakdown[log.mood] = (moodBreakdown[log.mood] || 0) + 1; });

    const patterns: string[] = [];
    const weekendUnits = weeklyLogs.filter(l => { const day = new Date(l.timestamp).getDay(); return day === 0 || day === 6; }).reduce((sum, l) => sum + (l.units || 0), 0);
    const weekdayUnits = weeklyLogs.filter(l => { const day = new Date(l.timestamp).getDay(); return day !== 0 && day !== 6; }).reduce((sum, l) => sum + (l.units || 0), 0);
    if (weekendUnits > weekdayUnits * 1.5 && weekendUnits > 5) patterns.push('Boire surtout le week-end est courant');
    const typeEntries = Object.entries(drinkTypeBreakdown).sort((a, b) => b[1].units - a[1].units);
    if (typeEntries[0] && typeEntries[0][1].units > 0) {
      const typeName = DRINK_TYPES[typeEntries[0][0] as DrinkType]?.label || typeEntries[0][0];
      patterns.push(`${typeName} est ton choix prefere`);
    }

    const recommendations: string[] = [];
    const effectiveLimit = goal?.weeklyLimit || HEALTH_GUIDELINES.maxWeeklyUnits;
    if (weeklyUnits === 0) recommendations.push('Semaine sobre - Excellent !');
    else if (weeklyUnits <= effectiveLimit * 0.8) recommendations.push('Tu es sous ton objectif hebdomadaire');
    else if (weeklyUnits <= effectiveLimit) recommendations.push('Tu es dans les limites de ton objectif');
    else if (weeklyUnits <= effectiveLimit * 1.2) recommendations.push('Legerement au-dessus - tu approches de ton objectif');
    else recommendations.push('Au-dessus de ton objectif cette semaine');

    const riskLevel: 'low' | 'moderate' | 'high' = weeklyUnits > effectiveLimit * 1.5 ? 'moderate' : weeklyUnits > effectiveLimit ? 'low' : 'low';
    const weeklyGoalProgress = effectiveLimit > 0 ? Math.min(Math.round((weeklyUnits / effectiveLimit) * 100), 150) : 0;

    let streak = 0;
    for (let i = 0; i <= 30; i++) {
      const checkDate = new Date(now); checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      if (!logs.some(l => l.timestamp.split('T')[0] === dateStr && (l.units || 0) > 0)) streak++;
      else if (i > 0) break;
    }

    return { totalWeeklyUnits: Math.round(weeklyUnits * 10) / 10, totalMonthlyUnits: Math.round(monthlyUnits * 10) / 10, averagePerDay: Math.round(averagePerDay * 10) / 10, dailyTrend, weeklyTrend, drinkTypeBreakdown, moodBreakdown, contextBreakdown: {}, patterns, riskLevel, recommendations, weeklyGoalProgress, streak };
  },
};
