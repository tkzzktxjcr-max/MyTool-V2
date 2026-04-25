import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/features/auth/context';
import { alcoholService } from './service';
import { drinksService, type Drink } from './services/drinks.service';
import { goalsService } from './services/goals.service';
import { profileService } from './services/profile.service';
import type { UserProfile } from './services/profile.service';
import type { CreateDrinkForm, DrinkType, MoodType, AlcoholInsight, AlcoholGoal, AlcoholLog } from './types';
import {
  getBACAnalysis,
  checkLegalLimit,
  type SexType,
  type DrinkData,
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
  const [refreshKey, setRefreshKey] = useState(0);

  const loadData = useCallback(async () => {
    if (!user?.$id) return;
    setLoading(true);
    
    try {
      const drinksData = await drinksService.getAllDrinks();
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
      
      const seen = new Set<string>();
      const recent: Drink[] = [];
      
      for (const log of recentLogs) {
        const drink = drinksData.find(d => d.type === log.drinkType || d.name === log.drinkName);
        if (drink && !seen.has(drink.id)) {
          seen.add(drink.id);
          recent.push(drink);
        }
      }
      
      setRecentlyUsed(recent.slice(0, 4));
    } catch (err) {
      console.error('Error loading alcohol data:', err);
      setDrinks([]);
    } finally {
      setLoading(false);
    }
  }, [user?.$id]);

  const createDrink = useCallback(async (form: CreateDrinkForm, emoji?: string) => {
    if (!user?.$id) throw new Error('Not authenticated');
    const drink = await drinksService.createDrink({
      name: form.name,
      type: form.type,
      abv: form.abv,
      defaultServingSize: form.defaultServingSize,
      emoji: emoji || '🥤',
      country: form.country,
      userId: user.$id,
    });
    setDrinks(prev => [...prev, drink]);
    return drink;
  }, [user?.$id]);

  const quickLog = useCallback(async (
    drink: Drink, 
    mood?: MoodType, 
    quantity: number = 1,
    timestamp?: string
  ) => {
    if (!user?.$id) throw new Error('Not authenticated');
    
    const log = await alcoholService.createLog(user.$id, {
      drinkType: drink.type,
      servingSize: drink.defaultServingSize,
      abv: drink.abv,
      mood,
      drinkName: drink.name,
      drinkEmoji: drink.emoji,
      quantity,
      timestamp,
    });
    
    await drinksService.incrementUsage(drink.id);
    
    // Immediately update local state for instant feedback
    setLogs(prev => [log, ...prev]);
    setLastDeletedLog(null);
    setRefreshKey(prev => prev + 1);
    
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
      drinkName: lastDeletedLog.drinkName,
      drinkEmoji: lastDeletedLog.drinkEmoji,
      quantity: lastDeletedLog.quantity,
    });
    setLogs(prev => [restoredLog, ...prev]);
    setLastDeletedLog(null);
    setRefreshKey(prev => prev + 1);
  }, [lastDeletedLog, user?.$id]);

  const deleteDrink = useCallback(async (drinkId: string) => {
    await drinksService.deleteDrink(drinkId);
    setDrinks(prev => prev.filter(d => d.id !== drinkId));
  }, []);

  const toggleFavorite = useCallback(async (drinkId: string) => {
    await drinksService.toggleFavorite(drinkId);
    setDrinks(prev => prev.map(d => 
      d.id === drinkId 
        ? { 
            ...d, 
            isFavorite: !d.isFavorite, 
            favoriteRank: d.isFavorite ? undefined : (d.favoriteRank || 1) 
          }
        : d
    ));
  }, []);

  const setWeeklyGoal = useCallback(async (limit: number) => {
    if (!user?.$id) throw new Error('Not authenticated');
    const updatedGoal = await goalsService.createOrUpdateGoal(user.$id, {
      weeklyLimit: limit,
      isActive: true,
    });
    setGoal(updatedGoal);
  }, [user?.$id]);

  const updateUserProfile = useCallback(async (data: {
    weightKg?: number;
    sex?: 'male' | 'female' | 'unspecified';
  }) => {
    if (!user?.$id) throw new Error('Not authenticated');
    const updatedProfile = await profileService.createOrUpdateProfile(user.$id, data);
    setUserProfile(updatedProfile);
  }, [user?.$id]);

  // Derived states
  const libraryDrinks = useMemo(() => 
    drinks.filter(d => d.isGlobal).sort((a, b) => b.popularity - a.popularity),
    [drinks]
  );

  const userDrinks = useMemo(() => 
    drinks.filter(d => d.userId === user?.$id).sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0)),
    [drinks, user?.$id]
  );

  const favorites = useMemo(() => 
    drinks.filter(d => d.isFavorite).sort((a, b) => (a.favoriteRank || 5) - (b.favoriteRank || 5)),
    [drinks]
  );

  const bacState = useMemo(() => {
    const weightKg = userProfile?.weightKg || 70;
    const sex: SexType = userProfile?.sex || 'unspecified';
    const legalLimit = userProfile?.legalLimit || 0.5;
    
    const drinksData: DrinkData[] = logs.map(log => ({
      volumeCl: log.servingSize,
      abv: log.abv,
      timestamp: log.timestamp,
    }));
    
    const analysis = getBACAnalysis(drinksData, { weightKg, sex }, legalLimit);
    const { isAbove, isNear } = checkLegalLimit(analysis.currentBAC, legalLimit);
    
    return {
      currentBAC: analysis.currentBAC,
      peakBAC: analysis.peakBAC,
      peakTime: analysis.peakTime,
      zeroTime: analysis.zeroTime,
      safeToDriveTime: analysis.safeToDriveTime,
      timeline: analysis.timeline,
      isAboveLimit: isAbove,
      isNearLimit: isNear,
    };
  }, [logs, userProfile, refreshKey]);

  const insights = useMemo((): AlcoholInsight | null => {
    return alcoholService.calculateInsights(logs, goal);
  }, [logs, goal, refreshKey]);

  const getTodayUnits = useCallback((): number => {
    const today = new Date().toISOString().split('T')[0];
    return logs
      .filter(l => l.timestamp.split('T')[0] === today)
      .reduce((sum, l) => sum + l.units, 0);
  }, [logs, refreshKey]);

  const getWeeklyUnits = useCallback((): number => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return logs
      .filter(l => new Date(l.timestamp) >= weekAgo)
      .reduce((sum, l) => sum + l.units, 0);
  }, [logs, refreshKey]);

  const isSafeToDrive = useMemo(() => {
    const legalLimit = userProfile?.legalLimit || 0.5;
    return bacState.currentBAC <= legalLimit;
  }, [bacState.currentBAC, userProfile]);

  return {
    drinks,
    libraryDrinks,
    userDrinks,
    favorites,
    recentlyUsed,
    logs,
    goal,
    userProfile,
    loading,
    insights,
    lastDeletedLog,
    bacState,
    isSafeToDrive,
    loadData,
    createDrink,
    quickLog,
    deleteLog,
    undoDelete,
    deleteDrink,
    toggleFavorite,
    setWeeklyGoal,
    updateUserProfile,
    getTodayUnits,
    getWeeklyUnits,
  };
};