import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/features/auth/context';
import { alcoholService } from './service';
import { drinksService } from './services/drinks.service';
import { goalsService } from './services/goals.service';
import { profileService } from './services/profile.service';
import type { UserProfile } from './services/profile.service';
import type { AlcoholLog, CreateDrinkForm, DrinkType, MoodType, AlcoholInsight, AlcoholGoal } from './types';
import { HEALTH_GUIDELINES } from './types';
import type { Drink } from './services/drinks.service';

export { type Drink };

interface BACDataPoint {
  time: Date;
  bac: number;
  isPast: boolean;
}

interface BACState {
  currentBAC: number;
  peakBAC: number;
  peakTime: Date;
  zeroTime: Date;
  timeline: BACDataPoint[];
  isAboveLimit: boolean;
  isNearLimit: boolean;
}

const DEFAULT_USER_PROFILE = {
  id: '',
  userId: '',
  weightKg: 70,
  sex: 'unspecified' as const,
  legalLimit: 0.5,
  updatedAt: '',
};

// BAC calculation constants
const BODY_WATER_MALE = 0.58;
const BODY_WATER_FEMALE = 0.49;
const ALCOHOL_DENSITY = 0.789;
const METABOLISM_RATE = 0.15; // g/L per hour

// Calculate BAC for a single drink
const calculateDrinkBAC = (
  volumeMl: number,
  abv: number,
  weightKg: number,
  sex: 'male' | 'female' | 'unspecified',
  hoursAgo: number
): number => {
  const alcoholGrams = (volumeMl * abv / 100) * ALCOHOL_DENSITY;
  const bodyWater = sex === 'female' ? BODY_WATER_FEMALE : 
                    sex === 'male' ? BODY_WATER_MALE : 0.68;
  const peakBAC = alcoholGrams / (weightKg * bodyWater);
  const currentBAC = peakBAC - (METABOLISM_RATE * hoursAgo);
  return Math.max(0, currentBAC);
};

// Calculate total current BAC
const calculateCurrentBAC = (
  drinks: { servingSize: number; abv: number; timestamp: string }[],
  weightKg: number,
  sex: 'male' | 'female' | 'unspecified'
): number => {
  const now = Date.now();
  return drinks.reduce((total, drink) => {
    const hoursAgo = (now - new Date(drink.timestamp).getTime()) / (1000 * 60 * 60);
    if (hoursAgo < 0 || hoursAgo > 24) return total;
    return total + calculateDrinkBAC(drink.servingSize, drink.abv, weightKg, sex, hoursAgo);
  }, 0);
};

// Calculate peak info - peak is 45 min after last drink
const calculatePeakInfo = (
  drinks: { servingSize: number; abv: number; timestamp: string }[],
  weightKg: number,
  sex: 'male' | 'female' | 'unspecified'
): { peakTime: Date; peakBAC: number } => {
  if (drinks.length === 0) {
    return { peakTime: new Date(), peakBAC: 0 };
  }
  
  // Find the latest drink time
  let lastDrinkTime = new Date(0);
  drinks.forEach(drink => {
    const drinkTime = new Date(drink.timestamp);
    if (drinkTime > lastDrinkTime) {
      lastDrinkTime = drinkTime;
    }
  });
  
  // Peak is 45 minutes after last drink
  const peakTime = new Date(lastDrinkTime.getTime() + 45 * 60 * 1000);
  
  // Calculate BAC at peak time
  let peakBAC = 0;
  drinks.forEach(drink => {
    const drinkTime = new Date(drink.timestamp);
    const hoursToPeak = (peakTime.getTime() - drinkTime.getTime()) / (1000 * 60 * 60);
    if (hoursToPeak >= 0) {
      peakBAC += calculateDrinkBAC(drink.servingSize, drink.abv, weightKg, sex, hoursToPeak);
    }
  });
  
  return { peakTime, peakBAC };
};

// Calculate when BAC reaches zero
const calculateZeroTime = (
  peakBAC: number,
  peakTime: Date
): Date => {
  if (peakBAC <= 0) return new Date();
  const hoursToZero = peakBAC / METABOLISM_RATE;
  return new Date(peakTime.getTime() + hoursToZero * 60 * 60 * 1000);
};

export const useAlcohol = () => {
  const { user } = useAuth();
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [logs, setLogs] = useState<AlcoholLog[]>([]);
  const [goal, setGoal] = useState<AlcoholGoal | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [recentlyUsed, setRecentlyUsed] = useState<Drink[]>([]);
  const [lastDeletedLog, setLastDeletedLog] = useState<AlcoholLog | null>(null);

  const loadData = useCallback(async () => {
    if (!user?.$id) return;
    setLoading(true);
    try {
      const drinksData = await drinksService.ensureUserHasDrinks(user.$id);
      setDrinks(drinksData);
      
      const logsData = await alcoholService.getLogs(user.$id);
      setLogs(logsData);
      
      const goalData = await goalsService.getGoal(user.$id);
      setGoal(goalData);
      
      const profileData = await profileService.getProfile(user.$id);
      setUserProfile(profileData);
      
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentLogs = logsData.filter(l => new Date(l.timestamp) >= weekAgo);
      
      const uniqueRecent = recentLogs
        .map(l => drinksData.find(d => d.type === l.drinkType))
        .filter(Boolean) as Drink[];
      
      const seen = new Set<string>();
      setRecentlyUsed(uniqueRecent.filter(d => {
        if (seen.has(d.id)) return false;
        seen.add(d.id);
        return true;
      }).slice(0, 4));
    } catch (err) {
      console.error('Error loading alcohol data:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.$id]);

  const createDrink = useCallback(async (form: CreateDrinkForm, emoji?: string, userId?: string) => {
    const drink = await drinksService.createDrink({
      name: form.name,
      type: form.type,
      abv: form.abv,
      defaultServingSize: form.defaultServingSize,
      emoji: emoji || '🥤',
      userId,
    });
    setDrinks(prev => [drink, ...prev]);
    return drink;
  }, []);

  const quickLog = useCallback(async (drink: Drink, mood?: MoodType) => {
    if (!user?.$id) throw new Error('Not authenticated');
    
    const log = await alcoholService.createLog(user.$id, {
      drinkType: drink.type,
      servingSize: drink.defaultServingSize,
      abv: drink.abv,
      mood,
    });
    
    await drinksService.incrementUsage(drink.id);
    
    setLogs(prev => [log, ...prev]);
    setLastDeletedLog(null);
    return log;
  }, [user?.$id]);

  const deleteLog = useCallback(async (logId: string) => {
    const logToDelete = logs.find(l => l.id === logId);
    if (logToDelete) setLastDeletedLog(logToDelete);
    
    await alcoholService.deleteLog(logId);
    setLogs(prev => prev.filter(l => l.id !== logId));
    setTimeout(() => setLastDeletedLog(null), 5000);
  }, [logs]);

  const undoDelete = useCallback(async () => {
    if (!lastDeletedLog || !user?.$id) return;
    
    const restoredLog = await alcoholService.createLog(user.$id, {
      drinkType: lastDeletedLog.drinkType,
      servingSize: lastDeletedLog.servingSize,
      abv: lastDeletedLog.abv,
      mood: lastDeletedLog.mood,
    });
    
    setLogs(prev => [restoredLog, ...prev]);
    setLastDeletedLog(null);
  }, [lastDeletedLog, user?.$id]);

  const deleteDrink = useCallback(async (drinkId: string) => {
    await drinksService.deleteDrink(drinkId);
    setDrinks(prev => prev.filter(d => d.id !== drinkId));
  }, []);

  const setWeeklyGoal = useCallback(async (limit: number, reductionGoal?: number) => {
    if (!user?.$id) throw new Error('Not authenticated');
    
    const updatedGoal = await goalsService.createOrUpdateGoal(user.$id, {
      weeklyLimit: limit,
      reductionGoal,
      isActive: true,
    });
    
    setGoal(updatedGoal);
    return updatedGoal;
  }, [user?.$id]);

  const updateUserProfile = useCallback(async (data: {
    weightKg?: number;
    sex?: 'male' | 'female' | 'unspecified';
    legalLimit?: number;
  }) => {
    if (!user?.$id) throw new Error('Not authenticated');
    
    const updatedProfile = await profileService.createOrUpdateProfile(user.$id, data);
    setUserProfile(updatedProfile);
    return updatedProfile;
  }, [user?.$id]);

  const getBACState = useMemo((): BACState => {
    const weightKg = userProfile?.weightKg || 70;
    const sex = userProfile?.sex || 'unspecified';
    const legalLimit = userProfile?.legalLimit || 0.5;
    
    // Get drinks from last 24 hours
    const now = Date.now();
    const activeDrinks = logs
      .filter(log => {
        const hoursAgo = (now - new Date(log.timestamp).getTime()) / (1000 * 60 * 60);
        return hoursAgo < 24;
      })
      .map(log => ({
        servingSize: log.servingSize,
        abv: log.abv,
        timestamp: log.timestamp,
      }));
    
    // Calculate current BAC
    const currentBAC = calculateCurrentBAC(activeDrinks, weightKg, sex);
    
    // Calculate peak info
    const { peakTime, peakBAC } = calculatePeakInfo(activeDrinks, weightKg, sex);
    
    // Calculate zero time
    const zeroTime = calculateZeroTime(peakBAC, peakTime);
    
    // Generate timeline
    const timeline: BACDataPoint[] = [];
    const nowDate = new Date();
    const startTime = new Date(nowDate.getTime() - 4 * 60 * 60 * 1000);
    const endTime = new Date(nowDate.getTime() + 12 * 60 * 60 * 1000);
    
    for (let time = startTime.getTime(); time <= endTime.getTime(); time += 15 * 60 * 1000) {
      const currentDate = new Date(time);
      let totalBAC = 0;
      
      activeDrinks.forEach(drink => {
        const drinkTime = new Date(drink.timestamp);
        const hoursAgo = (currentDate.getTime() - drinkTime.getTime()) / (1000 * 60 * 60);
        if (hoursAgo >= 0) {
          totalBAC += calculateDrinkBAC(drink.servingSize, drink.abv, weightKg, sex, hoursAgo);
        }
      });
      
      timeline.push({
        time: currentDate,
        bac: Math.round(totalBAC * 100) / 100,
        isPast: time < nowDate.getTime(),
      });
    }
    
    return {
      currentBAC,
      peakBAC,
      peakTime,
      zeroTime,
      timeline,
      isAboveLimit: currentBAC > legalLimit,
      isNearLimit: currentBAC > legalLimit * 0.8 && currentBAC <= legalLimit,
    };
  }, [logs, userProfile]);

  const insights = useMemo((): AlcoholInsight | null => {
    return alcoholService.calculateInsights(logs, goal);
  }, [logs, goal]);

  const getTodayUnits = useCallback((): number => {
    const today = new Date().toISOString().split('T')[0];
    return logs
      .filter(l => l.timestamp.split('T')[0] === today)
      .reduce((sum, l) => sum + l.units, 0);
  }, [logs]);

  const getWeeklyUnits = useCallback((): number => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return logs
      .filter(l => new Date(l.timestamp) >= weekAgo)
      .reduce((sum, l) => sum + l.units, 0);
  }, [logs]);

  return {
    drinks,
    allDrinks: drinks,
    recentlyUsed,
    logs,
    goal,
    userProfile,
    loading,
    insights,
    lastDeletedLog,
    bacState: getBACState,
    loadData,
    createDrink,
    quickLog,
    deleteLog,
    undoDelete,
    deleteDrink,
    setWeeklyGoal,
    updateUserProfile,
    getTodayUnits,
    getWeeklyUnits,
  };
};