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

const calculateSingleDrinkBAC = (
  volumeMl: number,
  abv: number,
  weightKg: number,
  sex: 'male' | 'female' | 'unspecified',
  hoursSinceDrink: number
): number => {
  const alcoholGrams = (volumeMl * abv / 100) * ALCOHOL_DENSITY;
  const bodyWater = sex === 'female' ? BODY_WATER_FEMALE : 
                    sex === 'male' ? BODY_WATER_MALE : 0.68;
  const peakBAC = (alcoholGrams / (weightKg * bodyWater));
  return Math.max(0, peakBAC - (METABOLISM_RATE * hoursSinceDrink));
};

const calculateTotalBAC = (
  drinks: { servingSize: number; abv: number; timestamp: string }[],
  weightKg: number,
  sex: 'male' | 'female' | 'unspecified'
): number => {
  const now = new Date();
  return drinks.reduce((total, drink) => {
    const hoursSince = (now.getTime() - new Date(drink.timestamp).getTime()) / (1000 * 60 * 60);
    if (hoursSince < 0 || hoursSince > 24) return total;
    return total + calculateSingleDrinkBAC(drink.servingSize, drink.abv, weightKg, sex, hoursSince);
  }, 0);
};

// Find the real peak time - 45 min after the last drink
const findPeakInfo = (
  drinks: { servingSize: number; abv: number; timestamp: string }[],
  weightKg: number,
  sex: 'male' | 'female' | 'unspecified'
): { peakTime: Date; peakBAC: number } => {
  if (drinks.length === 0) return { peakTime: new Date(), peakBAC: 0 };
  
  // Get the latest drink time
  const lastDrinkTime = drinks.reduce((latest, drink) => {
    const drinkTime = new Date(drink.timestamp);
    return drinkTime > latest ? drinkTime : latest;
  }, new Date(0));
  
  // Peak is about 45 min after last drink
  const peakTime = new Date(lastDrinkTime.getTime() + 45 * 60 * 1000);
  
  // Calculate BAC at peak time
  let peakBAC = 0;
  drinks.forEach(drink => {
    const drinkTime = new Date(drink.timestamp);
    const hoursToPeak = (peakTime.getTime() - drinkTime.getTime()) / (1000 * 60 * 60);
    if (hoursToPeak >= 0) {
      peakBAC += calculateSingleDrinkBAC(drink.servingSize, drink.abv, weightKg, sex, hoursToPeak);
    }
  });
  
  return { peakTime, peakBAC };
};

// Find when BAC reaches zero
const findZeroTime = (
  drinks: { servingSize: number; abv: number; timestamp: string }[],
  weightKg: number,
  sex: 'male' | 'female' | 'unspecified'
): Date => {
  const { peakBAC, peakTime } = findPeakInfo(drinks, weightKg, sex);
  if (peakBAC === 0) return new Date();
  
  // Time to return to 0 from peak
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
      
      const seen = new Set();
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
    const activeDrinks = logs
      .filter(log => {
        const hoursAgo = (Date.now() - new Date(log.timestamp).getTime()) / (1000 * 60 * 60);
        return hoursAgo < 24;
      })
      .map(log => ({
        servingSize: log.servingSize,
        abv: log.abv,
        timestamp: log.timestamp,
      }));
    
    const now = new Date();
    const timeline: BACDataPoint[] = [];
    
    // Generate timeline from 4 hours ago to 12 hours in future
    const startTime = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    const intervalMs = 15 * 60 * 1000;
    const endTime = new Date(now.getTime() + 12 * 60 * 60 * 1000);
    
    let peakBAC = 0;
    let peakTime = now;
    
    // Calculate peak time and BAC
    const peakInfo = findPeakInfo(activeDrinks, weightKg, sex);
    peakTime = peakInfo.peakTime;
    peakBAC = peakInfo.peakBAC;
    
    // Generate timeline points
    for (let time = startTime.getTime(); time <= endTime.getTime(); time += intervalMs) {
      const currentDate = new Date(time);
      let totalBAC = 0;
      
      activeDrinks.forEach(drink => {
        const drinkTime = new Date(drink.timestamp);
        const hoursSince = (currentDate.getTime() - drinkTime.getTime()) / (1000 * 60 * 60);
        
        // Only calculate for drinks that have been consumed
        if (hoursSince >= 0) {
          totalBAC += calculateSingleDrinkBAC(drink.servingSize, drink.abv, weightKg, sex, hoursSince);
        }
      });
      
      timeline.push({
        time: currentDate,
        bac: Math.round(totalBAC * 100) / 100,
        isPast: time < now.getTime(),
      });
    }
    
    // Calculate zero time
    const zeroTime = findZeroTime(activeDrinks, weightKg, sex);
    
    const currentBAC = calculateTotalBAC(activeDrinks, weightKg, sex);
    
    return {
      currentBAC,
      peakBAC: Math.round(peakBAC * 100) / 100,
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