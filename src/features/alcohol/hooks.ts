import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/features/auth/context';
import { alcoholService } from './service';
import { drinksService, type Drink } from './services/drinks.service';
import { goalsService } from './services/goals.service';
import type { AlcoholLog, CreateDrinkForm, DrinkType, MoodType, AlcoholInsight, AlcoholGoal } from './types';
import { HEALTH_GUIDELINES } from './types';

export { type Drink } from './services/drinks.service';

export const useAlcohol = () => {
  const { user } = useAuth();
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [logs, setLogs] = useState<AlcoholLog[]>([]);
  const [goal, setGoal] = useState<AlcoholGoal | null>(null);
  const [loading, setLoading] = useState(false);
  const [recentlyUsed, setRecentlyUsed] = useState<Drink[]>([]);
  const [lastDeletedLog, setLastDeletedLog] = useState<AlcoholLog | null>(null);

  const loadData = useCallback(async () => {
    if (!user?.$id) return;
    setLoading(true);
    try {
      // Load drinks from database
      const drinksData = await drinksService.ensureUserHasDrinks(user.$id);
      setDrinks(drinksData);
      
      // Load logs from database
      const logsData = await alcoholService.getLogs(user.$id);
      setLogs(logsData);
      
      // Load goal
      const goalData = await goalsService.getGoal(user.$id);
      setGoal(goalData);
      
      // Get recently used (last 7 days)
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
    if (logToDelete) {
      setLastDeletedLog(logToDelete);
    }
    
    await alcoholService.deleteLog(logId);
    setLogs(prev => prev.filter(l => l.id !== logId));
    
    // Auto-remove undo state after 5 seconds
    setTimeout(() => {
      setLastDeletedLog(null);
    }, 5000);
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
    loading,
    insights,
    lastDeletedLog,
    loadData,
    createDrink,
    quickLog,
    deleteLog,
    undoDelete,
    deleteDrink,
    setWeeklyGoal,
    getTodayUnits,
    getWeeklyUnits,
  };
};