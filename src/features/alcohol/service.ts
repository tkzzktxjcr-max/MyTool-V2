import { createDocument, listDocuments, updateDocument, deleteDocument, Query } from '@/lib/appwrite';
import { COLLECTIONS } from '@/lib/appwrite';
import type { AlcoholLog, DrinkType, MoodType, AlcoholInsight, AlcoholGoal } from './types';
import { DRINK_TYPES, HEALTH_GUIDELINES } from './types';

// =============================================================================
// DRINK TYPE
// =============================================================================

export interface Drink {
  id: string;
  name: string;
  type: DrinkType;
  abv: number;
  defaultServingSize: number;
  emoji: string;
  country?: string;
  isFavorite: boolean;
  favoriteRank?: number;
  usageCount: number;
  userId?: string;
  isGlobal: boolean;
  popularity: number;
  category?: string;
  brand?: string;
  createdAt: string;
}

// =============================================================================
// USER PROFILE TYPE
// =============================================================================

export interface UserProfile {
  id: string;
  userId: string;
  weightKg: number;
  sex: 'male' | 'female' | 'unspecified';
  legalLimit: number;
  updatedAt: string;
}

// =============================================================================
// HELPERS
// =============================================================================

const calculateUnits = (volumeCl: number, abv: number): number => {
  return (volumeCl * abv / 100 * 0.789) / 10;
};

const mapDocToDrink = (doc: any): Drink => ({
  id: doc.$id,
  name: doc.name,
  type: doc.type as DrinkType,
  abv: doc.abv,
  defaultServingSize: doc.defaultServingSize || doc.servingSize || 33,
  emoji: doc.emoji,
  country: doc.country,
  isFavorite: doc.isFavorite || false,
  favoriteRank: doc.favoriteRank,
  usageCount: doc.usageCount || 0,
  userId: doc.userId,
  isGlobal: doc.isGlobal || false,
  popularity: doc.popularity || 0,
  category: doc.category,
  brand: doc.brand,
  createdAt: doc.$createdAt,
});

async function getAllDocuments(collectionId: string): Promise<any[]> {
  const allDocs: any[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const response = await listDocuments(collectionId, [
      Query.limit(limit),
      Query.offset(offset),
    ]);

    allDocs.push(...response.documents);

    if (response.documents.length < limit) break;

    offset += limit;

    if (allDocs.length >= 1000) {
      console.warn('[service] Stopped at 1000 documents');
      break;
    }
  }

  console.log(`[service] Fetched ${allDocs.length} total documents`);
  return allDocs;
}

// =============================================================================
// DRINKS SERVICE
// =============================================================================

export const drinksService = {
  async getAllDrinks(): Promise<Drink[]> {
    console.log('[drinksService] getAllDrinks called, collection:', COLLECTIONS.DRINKS);
    try {
      const allDocs = await getAllDocuments(COLLECTIONS.DRINKS);
      console.log('[drinksService] Success! Found', allDocs.length, 'drinks');
      return allDocs.map(mapDocToDrink);
    } catch (error: any) {
      console.error('[drinksService] Error loading drinks:', error?.message || error);
      return [];
    }
  },

  async getLibraryDrinks(): Promise<Drink[]> {
    console.log('[drinksService] getLibraryDrinks called');
    try {
      const response = await listDocuments(COLLECTIONS.DRINKS, [
        Query.equal('isGlobal', true),
      ]);
      console.log('[drinksService] Found', response.documents.length, 'library drinks');
      return response.documents.map(mapDocToDrink);
    } catch (error: any) {
      console.error('[drinksService] getLibraryDrinks failed:', error?.message || error);
      return [];
    }
  },

  async getUserDrinks(userId: string): Promise<Drink[]> {
    try {
      const response = await listDocuments(COLLECTIONS.DRINKS, [
        Query.equal('userId', userId),
      ]);
      return response.documents.map(mapDocToDrink);
    } catch (error) {
      console.warn('[drinksService] getUserDrinks failed:', error);
      return [];
    }
  },

  async getDrinksByUser(userId: string): Promise<Drink[]> {
    return this.getUserDrinks(userId);
  },

  async getUserDrinkPreference(userId: string, drinkType: DrinkType): Promise<Drink | null> {
    try {
      const response = await listDocuments(COLLECTIONS.DRINKS, [
        Query.equal('userId', userId),
        Query.equal('type', drinkType),
      ]);

      if (response.documents.length > 0) {
        return mapDocToDrink(response.documents[0]);
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  async createDrink(data: {
    name: string;
    type: DrinkType;
    abv: number;
    defaultServingSize: number;
    emoji: string;
    country?: string;
    userId?: string;
    isGlobal?: boolean;
    category?: string;
    brand?: string;
  }): Promise<Drink> {
    const doc: any = await createDocument(COLLECTIONS.DRINKS, {
      name: data.name,
      type: data.type,
      abv: data.abv,
      defaultServingSize: data.defaultServingSize,
      emoji: data.emoji,
      country: data.country || null,
      isFavorite: false,
      favoriteRank: null,
      usageCount: 0,
      userId: data.userId || null,
      isGlobal: data.isGlobal || false,
      popularity: 0,
      category: data.category || null,
      brand: data.brand || null,
    });

    return mapDocToDrink(doc);
  },

  async setUserDrinkPreference(
    userId: string,
    data: {
      type: DrinkType;
      name: string;
      abv: number;
      defaultServingSize: number;
      emoji: string;
      country?: string;
    }
  ): Promise<Drink> {
    const existing = await this.getUserDrinkPreference(userId, data.type);

    if (existing) {
      const doc: any = await updateDocument(COLLECTIONS.DRINKS, existing.id, {
        name: data.name,
        abv: data.abv,
        defaultServingSize: data.defaultServingSize,
        emoji: data.emoji,
        country: data.country || null,
      });

      return mapDocToDrink(doc);
    }

    return this.createDrink({ ...data, userId });
  },

  async toggleFavorite(drinkId: string, rank?: number): Promise<void> {
    try {
      const currentDoc = await listDocuments(COLLECTIONS.DRINKS, [
        Query.equal('$id', drinkId),
      ]);

      if (currentDoc.documents.length === 0) return;

      const doc = currentDoc.documents[0];
      const currentlyFavorite = doc.isFavorite || false;

      if (currentlyFavorite) {
        await updateDocument(COLLECTIONS.DRINKS, drinkId, {
          isFavorite: false,
          favoriteRank: null,
        });
      } else {
        await updateDocument(COLLECTIONS.DRINKS, drinkId, {
          isFavorite: true,
          favoriteRank: rank || 1,
        });
      }
    } catch (error) {
      console.warn('[drinksService] toggleFavorite failed:', error);
    }
  },

  async incrementUsage(drinkId: string): Promise<void> {
    try {
      await updateDocument(COLLECTIONS.DRINKS, drinkId, {
        usageCount: { increment: 1 },
      });
    } catch (error) {
      console.warn('[drinksService] incrementUsage failed:', error);
    }
  },

  async updateDrink(drinkId: string, data: Partial<{
    name: string;
    abv: number;
    defaultServingSize: number;
    emoji: string;
    country?: string;
  }>): Promise<void> {
    try {
      await updateDocument(COLLECTIONS.DRINKS, drinkId, data);
    } catch (error) {
      console.warn('[drinksService] updateDrink failed:', error);
    }
  },

  async deleteDrink(drinkId: string): Promise<void> {
    try {
      await deleteDocument(COLLECTIONS.DRINKS, drinkId);
    } catch (error) {
      console.warn('[drinksService] deleteDrink failed:', error);
    }
  },
};

// =============================================================================
// GOALS SERVICE
// =============================================================================

export const goalsService = {
  async getGoal(userId: string): Promise<AlcoholGoal | null> {
    try {
      const response = await listDocuments(COLLECTIONS.GOALS, [Query.equal('userId', userId)]);

      if (response.documents.length === 0) return null;

      const doc = response.documents[0];
      return {
        id: doc.$id,
        userId: doc.userId,
        weeklyLimit: doc.weeklyLimit || 14,
        reductionGoal: doc.reductionGoal,
        isActive: doc.isActive ?? true,
        createdAt: doc.$createdAt,
      };
    } catch (error) {
      console.warn('[goalsService] getGoal failed', error);
      return null;
    }
  },

  async createOrUpdateGoal(userId: string, data: {
    weeklyLimit: number;
    reductionGoal?: number;
    isActive?: boolean;
  }): Promise<AlcoholGoal> {
    try {
      const existing = await this.getGoal(userId);

      if (existing) {
        const doc: any = await updateDocument(COLLECTIONS.GOALS, existing.id, {
          weeklyLimit: data.weeklyLimit,
          reductionGoal: data.reductionGoal ?? null,
          isActive: data.isActive ?? true,
        });

        return {
          id: doc.$id,
          userId: doc.userId,
          weeklyLimit: doc.weeklyLimit,
          reductionGoal: doc.reductionGoal,
          isActive: doc.isActive,
          createdAt: doc.$createdAt,
        };
      }

      const doc: any = await createDocument(COLLECTIONS.GOALS, {
        userId,
        weeklyLimit: data.weeklyLimit,
        reductionGoal: data.reductionGoal ?? null,
        isActive: data.isActive ?? true,
      });

      return {
        id: doc.$id,
        userId: doc.userId,
        weeklyLimit: doc.weeklyLimit,
        reductionGoal: doc.reductionGoal,
        isActive: doc.isActive,
        createdAt: doc.$createdAt,
      };
    } catch (error) {
      console.warn('[goalsService] createOrUpdateGoal failed', error);
      return {
        id: 'local-goal',
        userId,
        weeklyLimit: data.weeklyLimit,
        reductionGoal: data.reductionGoal,
        isActive: data.isActive ?? true,
        createdAt: new Date().toISOString(),
      };
    }
  },
};

// =============================================================================
// PROFILE SERVICE
// =============================================================================

export const profileService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const response = await listDocuments(COLLECTIONS.USER_PROFILES, [
        Query.equal('userId', userId),
      ]);

      if (response.documents.length === 0) return null;

      const doc = response.documents[0];
      return {
        id: doc.$id,
        userId: doc.userId,
        weightKg: doc.weightKg || 70,
        sex: doc.sex || 'unspecified',
        legalLimit: doc.legalLimit || 0.5,
        updatedAt: doc.$updatedAt,
      };
    } catch (error) {
      console.warn('[profileService] getProfile failed', error);
      return null;
    }
  },

  async createOrUpdateProfile(userId: string, data: {
    weightKg?: number;
    sex?: 'male' | 'female' | 'unspecified';
    legalLimit?: number;
  }): Promise<UserProfile> {
    try {
      const existing = await this.getProfile(userId);

      if (existing) {
        const doc: any = await updateDocument(COLLECTIONS.USER_PROFILES, existing.id, {
          weightKg: data.weightKg ?? existing.weightKg,
          sex: data.sex ?? existing.sex,
          legalLimit: data.legalLimit ?? existing.legalLimit,
        });

        return {
          id: doc.$id,
          userId: doc.userId,
          weightKg: doc.weightKg,
          sex: doc.sex,
          legalLimit: doc.legalLimit,
          updatedAt: doc.$updatedAt,
        };
      }

      const doc: any = await createDocument(COLLECTIONS.USER_PROFILES, {
        userId,
        weightKg: data.weightKg || 70,
        sex: data.sex || 'unspecified',
        legalLimit: data.legalLimit || 0.5,
      });

      return {
        id: doc.$id,
        userId: doc.userId,
        weightKg: doc.weightKg,
        sex: doc.sex,
        legalLimit: doc.legalLimit,
        updatedAt: doc.$createdAt,
      };
    } catch (error) {
      console.warn('[profileService] createOrUpdateProfile failed', error);
      return {
        id: 'local-profile',
        userId,
        weightKg: data.weightKg || 70,
        sex: data.sex || 'unspecified',
        legalLimit: data.legalLimit || 0.5,
        updatedAt: new Date().toISOString(),
      };
    }
  },
};

// =============================================================================
// ALCOHOL LOGS SERVICE
// =============================================================================

export const alcoholService = {
  async getLogs(userId: string): Promise<AlcoholLog[]> {
    try {
      const response = await listDocuments(COLLECTIONS.ALCOHOL_LOGS, [
        Query.equal('userId', userId),
      ]);

      console.log('[alcoholService.getLogs] Found logs:', response.documents.length);

      return response.documents.map((doc: any) => ({
        id: doc.$id,
        userId: doc.userId,
        drinkName: doc.drinkName || DRINK_TYPES[doc.drinkType as DrinkType]?.label || doc.drinkType,
        drinkEmoji: doc.drinkEmoji || DRINK_TYPES[doc.drinkType as DrinkType]?.icon || '🥤',
        drinkType: doc.drinkType as DrinkType,
        quantity: doc.quantity || 1,
        servingSize: doc.volumeCl || doc.servingSize || 33,
        abv: doc.abv,
        units: doc.units,
        mood: doc.mood,
        timestamp: doc.date || doc.timestamp,
        notes: doc.notes,
      }));
    } catch (error) {
      console.warn('[alcoholService.getLogs] Error:', error);
      return [];
    }
  },

  async createLog(
    userId: string,
    data: {
      drinkType: DrinkType;
      servingSize: number;
      abv: number;
      mood?: MoodType;
      notes?: string;
      drinkName?: string;
      drinkEmoji?: string;
      quantity?: number;
      timestamp?: string;
    }
  ): Promise<AlcoholLog> {
    const quantity = data.quantity || 1;
    const units = calculateUnits(data.servingSize, data.abv) * quantity;
    const timestamp = data.timestamp || new Date().toISOString();

    const doc: any = await createDocument(COLLECTIONS.ALCOHOL_LOGS, {
      userId,
      date: timestamp,
      drinkType: data.drinkType,
      volumeCl: data.servingSize,
      abv: data.abv,
      units,
      quantity,
      mood: data.mood || null,
      notes: data.notes || null,
      drinkName: data.drinkName || DRINK_TYPES[data.drinkType]?.label,
      drinkEmoji: data.drinkEmoji || DRINK_TYPES[data.drinkType]?.icon,
    });

    return {
      id: doc.$id,
      userId: doc.userId,
      drinkName: doc.drinkName,
      drinkEmoji: doc.drinkEmoji,
      drinkType: doc.drinkType as DrinkType,
      quantity: doc.quantity || 1,
      servingSize: doc.volumeCl || 33,
      abv: doc.abv,
      units: doc.units,
      mood: doc.mood,
      timestamp: doc.date,
      notes: doc.notes,
    };
  },

  async deleteLog(logId: string): Promise<void> {
    try {
      await deleteDocument(COLLECTIONS.ALCOHOL_LOGS, logId);
    } catch (error) {
      console.warn('[alcoholService.deleteLog] Error:', error);
    }
  },

  calculateInsights(logs: AlcoholLog[], goal: AlcoholGoal | null): AlcoholInsight | null {
    console.log('[alcoholService.calculateInsights] Called with:', {
      logsCount: logs.length,
      goal: goal ? 'exists' : 'null'
    });

    if (logs.length === 0) {
      const now = new Date();
      const dailyTrend = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - (6 - i));
        return { date: date.toISOString().split('T')[0], units: 0 };
      });

      const emptyInsight = {
        totalWeeklyUnits: 0,
        totalMonthlyUnits: 0,
        averagePerDay: 0,
        dailyTrend,
        weeklyTrend: [],
        drinkTypeBreakdown: Object.keys(DRINK_TYPES).reduce((acc, type) => {
          acc[type as DrinkType] = { count: 0, units: 0 };
          return acc;
        }, {} as Record<DrinkType, { count: number; units: number }>),
        moodBreakdown: {} as Record<MoodType, number>,
        contextBreakdown: {},
        patterns: [],
        riskLevel: 'low' as const,
        recommendations: ['✅ Aucune donnée pour le moment'],
        weeklyGoalProgress: 0,
        streak: 0,
      };

      console.log('[alcoholService.calculateInsights] Returning empty insight');
      return emptyInsight;
    }

    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(now);
    monthAgo.setDate(monthAgo.getDate() - 30);

    const weeklyLogs = logs.filter(l => new Date(l.timestamp) >= weekAgo);
    const weeklyUnits = weeklyLogs.reduce((sum, l) => sum + l.units, 0);
    const monthlyUnits = logs.filter(l => new Date(l.timestamp) >= monthAgo).reduce((sum, l) => sum + l.units, 0);
    const averagePerDay = weeklyLogs.length > 0 ? weeklyUnits / 7 : 0;

    console.log('[alcoholService.calculateInsights] Calculated:', { weeklyUnits, monthlyUnits, averagePerDay });

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
      if (drinkTypeBreakdown[log.drinkType]) {
        drinkTypeBreakdown[log.drinkType].count += log.quantity || 1;
        drinkTypeBreakdown[log.drinkType].units += log.units;
      }
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

    if (weekendUnits > weekdayUnits * 1.5 && weekendUnits > 5) {
      patterns.push('🍺 +50% le week-end');
    }

    const typeEntries = Object.entries(drinkTypeBreakdown).sort((a, b) => b[1].units - a[1].units);
    if (typeEntries[0] && typeEntries[0][1].units > 0) {
      const typeName = DRINK_TYPES[typeEntries[0][0] as DrinkType]?.label || typeEntries[0][0];
      patterns.push(`🍷 ${typeName} favorit${typeEntries[0][0] === 'wine' ? 'e' : ''}`);
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
    } else if (weeklyUnits > 0) {
      recommendations.push('✅ Dans les limites');
    }

    const weeklyGoalProgress = Math.min((weeklyUnits / effectiveLimit) * 100, 100);

    let streak = 0;
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

    const insight = {
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

    console.log('[alcoholService.calculateInsights] Returning insight:', insight);
    return insight;
  },
};