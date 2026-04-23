import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/features/auth/context';
import { alcoholService } from './service';
import { drinksService, type Drink } from './services/drinks.service';
import type { AlcoholLog, CreateDrinkForm, DrinkType, MoodType, AlcoholInsight } from './types';

export { type Drink } from './services/drinks.service';

export const useAlcohol = () => {
  const { user } = useAuth();
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [logs, setLogs] = useState<AlcoholLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentlyUsed, setRecentlyUsed] = useState<Drink[]>([]);

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

  const quickLog = useCallback(async (
    drink: Drink,
    mood?: MoodType,
    context?: string
  ) => {
    if (!user?.$id) throw new Error('Not authenticated');
    
    const log = await alcoholService.createLog(user.$id, {
      drinkType: drink.type,
      servingSize: drink.defaultServingSize,
      abv: drink.abv,
      mood,
      context: context as any,
    });
    
    // Increment usage count
    await drinksService.incrementUsage(drink.id);
    
    setLogs(prev => [log, ...prev]);
    return log;
  }, [user?.$id]);

  const deleteLog = useCallback(async (logId: string) => {
    await alcoholService.deleteLog(logId);
    setLogs(prev => prev.filter(l => l.id !== logId));
  }, []);

  const deleteDrink = useCallback(async (drinkId: string) => {
    await drinksService.deleteDrink(drinkId);
    setDrinks(prev => prev.filter(d => d.id !== drinkId));
  }, []);

  const insights = useMemo((): AlcoholInsight | null => {
    return alcoholService.calculateInsights(logs);
  }, [logs]);

  const getTodayUnits = useCallback((): number => {
    const today = new Date().toISOString().split('T')[0];
    return logs
      .filter(l => l.timestamp.split('T')[0] === today)
      .reduce((sum, l) => sum + l.units, 0);
  }, [logs]);

  return {
    drinks,
    allDrinks: drinks,
    recentlyUsed,
    logs,
    loading,
    insights,
    loadData,
    createDrink,
    quickLog,
    deleteLog,
    deleteDrink,
    getTodayUnits,
  };
};