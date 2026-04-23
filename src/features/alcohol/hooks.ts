import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/features/auth/context';
import { alcoholService } from './service';
import { drinksService, type Drink } from './services/drinks.service';
import { goalsService } from './services/goals.service';
import { profileService } from './services/profile.service';
import type { UserProfile } from './services/profile.service';
import type { AlcoholLog, CreateDrinkForm, DrinkType, MoodType, AlcoholInsight, AlcoholGoal } from './types';
import { HEALTH_GUIDELINES } from './types';
import {
  getBACAnalysis,
  checkLegalLimit,
  type SexType,
} from './utils/bac';

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

  const resetDrinks = useCallback(async () => {
    if (!user?.$id) return;
    const newDrinks = await drinksService.resetToDefaults(user.$id);
    setDrinks(newDrinks);
  }, [user?.$id]);

  const createDrink = useCallback(async (form: CreateDrinkForm, emoji?: string) => {
    if (!user?.$id) throw new Error('Not authenticated');
    const drink = await drinksService.createDrink({
      name: form.name,
      type: form.type,
      abv: form.abv,
      defaultServingSize: form.defaultServingSize,
      emoji: emoji || '🥤',
      userId: user.$id,
    });
    setDrinks(prev => [drink, ...prev]);
    return drink;
  }, [user?.$id]);

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

  // Calculate BAC state using centralized utility
  const bacState = useMemo(() => {
    const weightKg = userProfile?.weightKg || 70;
    const sex: SexType = userProfile?.sex || 'unspecified';
    const legalLimit = userProfile?.legalLimit || 0.5;
    
    // Convert logs to drink data format (servingSize is in cl from DB)
    const drinksData = logs.map(log => ({
      volumeCl: log.servingSize, // Already in cl
      abv: log.abv,
      timestamp: log.timestamp,
    }));
    
    const userProfileForBAC = { weightKg, sex };
    const analysis = getBACAnalysis(drinksData, userProfileForBAC);
    const { isAbove, isNear } = checkLegalLimit(analysis.currentBAC, legalLimit);
    
    return {
      currentBAC: analysis.currentBAC,
      peakBAC: analysis.peakBAC,
      peakTime: analysis.peakTime,
      zeroTime: analysis.zeroTime,
      timeline: analysis.timeline,
      isAboveLimit: isAbove,
      isNearLimit: isNear,
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
    bacState,
    loadData,
    resetDrinks,
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