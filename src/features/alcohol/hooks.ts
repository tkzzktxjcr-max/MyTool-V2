import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/features/auth/context';
import { alcoholService } from './service';
import { drinksService } from './services/drinks.service';
import { goalsService } from './services/goals.service';
import { profileService } from './services/profile.service';
import type { AlcoholLog, CreateDrinkForm, DrinkType, MoodType, AlcoholInsight, AlcoholGoal } from './types';
import { HEALTH_GUIDELINES } from './types';
import type { Drink } from './services/drinks.service';
import type { UserProfile } from './services/profile.service';

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

const DEFAULT_USER_PROFILE: UserProfile = {
  weightKg: 70,
  sex: 'unspecified',
};

const calculateAlcoholGrams = (servingSizeMl: number, abv: number): number => {
  return (servingSizeMl * abv / 100) * 0.789;
};

const calculateTotalBAC = (
  drinks: { servingSize: number; abv: number; timestamp: string }[],
  profile: { weightKg: number; sex: 'male' | 'female' | 'unspecified' }
): number => {
  const now = new Date();
  const BODY_WATER_MALE = 0.58;
  const BODY_WATER_FEMALE = 0.49;
  
  return drinks.reduce((total, drink) => {
    const hoursSince = (now.getTime() - new Date(drink.timestamp).getTime()) / (1000 * 60 * 60);
    if (hoursSince < 0) return total;
    
    const alcoholGrams = calculateAlcoholGrams(drink.servingSize, drink.abv);
    const bodyWater = profile.sex === 'female' ? BODY_WATER_FEMALE : 
                     profile.sex === 'male' ? BODY_WATER_MALE : 0.68;
    const peakBAC = (alcoholGrams / (profile.weightKg * bodyWater)) * 10;
    const currentBAC = Math.max(0, peakBAC - (0.015 * hoursSince));
    
    return total + currentBAC;
  }, 0);
};

export { type Drink };

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
    const profile = userProfile ? {
      weightKg: userProfile.weightKg,
      sex: userProfile.sex,
    } : DEFAULT_USER_PROFILE;
    
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
    const BODY_WATER_MALE = 0.58;
    const BODY_WATER_FEMALE = 0.49;
    
    const timeline: BACDataPoint[] = [];
    const startTime = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const intervalMs = 15 * 60 * 1000;
    const endTime = new Date(now.getTime() + 12 * 60 * 60 * 1000);
    
    let peakBAC = 0;
    let peakTime = now;
    
    for (let time = startTime.getTime(); time <= endTime.getTime(); time += intervalMs) {
      const currentDate = new Date(time);
      let totalBAC = 0;
      
      activeDrinks.forEach(drink => {
        const drinkHoursSince = (currentDate.getTime() - new Date(drink.timestamp).getTime()) / (1000 * 60 * 60);
        if (drinkHoursSince >= 0) {
          const alcoholGrams = calculateAlcoholGrams(drink.servingSize, drink.abv);
          const bodyWater = profile.sex === 'female' ? BODY_WATER_FEMALE : profile.sex === 'male' ? BODY_WATER_MALE : 0.68;
          const bAC = (alcoholGrams / (profile.weightKg * bodyWater)) * 10;
          const current = Math.max(0, bAC - (0.015 * drinkHoursSince));
          totalBAC += current;
        }
      });
      
      if (totalBAC > peakBAC) {
        peakBAC = totalBAC;
        peakTime = currentDate;
      }
      
      timeline.push({
        time: currentDate,
        bac: Math.round(totalBAC * 1000) / 1000,
        isPast: time < now.getTime(),
      });
    }
    
    let zeroTime = now;
    for (let i = timeline.length - 1; i >= 0; i--) {
      if (timeline[i].bac > 0) {
        zeroTime = timeline[i + 1]?.time || timeline[i].time;
        break;
      }
    }
    
    const currentBAC = calculateTotalBAC(activeDrinks, profile);
    const legalLimit = userProfile?.legalLimit || 0.05;
    
    return {
      currentBAC,
      peakBAC: Math.round(peakBAC * 1000) / 1000,
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