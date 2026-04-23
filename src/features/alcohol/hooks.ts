import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/features/auth/context';
import { alcoholService } from './service';
import type { CustomDrink, AlcoholLog, CreateDrinkForm, DrinkType, MoodType, AlcoholInsight } from './types';
import { DRINK_TYPES, HEALTH_GUIDELINES } from './types';

export const useAlcohol = () => {
  const { user } = useAuth();
  const [customDrinks, setCustomDrinks] = useState<CustomDrink[]>([]);
  const [logs, setLogs] = useState<AlcoholLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentlyUsed, setRecentlyUsed] = useState<CustomDrink[]>([]);

  // Default drinks (preset)
  const defaultDrinks = useMemo(() => {
    return Object.entries(DRINK_TYPES).map(([type, data]) => ({
      id: `default-${type}`,
      userId: '',
      name: data.label,
      type: type as DrinkType,
      abv: data.defaultAbv,
      defaultServingSize: 50,
      emoji: data.icon,
      isFavorite: false,
      usageCount: 0,
      createdAt: '',
    }));
  }, []);

  // Combine custom drinks with defaults
  const allDrinks = useMemo(() => {
    const combined = [...customDrinks, ...defaultDrinks];
    return combined.sort((a, b) => b.usageCount - a.usageCount);
  }, [customDrinks, defaultDrinks]);

  // Load data
  const loadData = useCallback(async () => {
    if (!user?.$id) return;
    setLoading(true);
    try {
      const [drinksData, logsData] = await Promise.all([
        alcoholService.getCustomDrinks(user.$id),
        alcoholService.getLogs(user.$id),
      ]);
      setCustomDrinks(drinksData);
      setLogs(logsData);
      
      // Get recently used (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentDrinks = logsData
        .filter(l => l.drinkId && new Date(l.timestamp) >= weekAgo)
        .map(l => drinksData.find(d => d.id === l.drinkId))
        .filter(Boolean) as CustomDrink[];
      
      const uniqueRecent = recentDrinks.filter((d, i, arr) => arr.findIndex(r => r.id === d.id) === i).slice(0, 4);
      setRecentlyUsed(uniqueRecent);
    } catch (err) {
      console.error('Error loading alcohol data:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.$id]);

  // Create custom drink
  const createDrink = useCallback(async (form: CreateDrinkForm, emoji?: string) => {
    if (!user?.$id) throw new Error('Not authenticated');
    const drink = await alcoholService.createCustomDrink(user.$id, form, emoji);
    setCustomDrinks(prev => [drink, ...prev]);
    return drink;
  }, [user?.$id]);

  // Quick log (one-tap)
  const quickLog = useCallback(async (
    drink: CustomDrink,
    quantity = 1,
    mood?: MoodType,
    context?: string
  ) => {
    if (!user?.$id) throw new Error('Not authenticated');
    
    const log = await alcoholService.createLog(user.$id, {
      drinkId: drink.id.startsWith('default-') ? undefined : drink.id,
      drinkName: drink.name,
      drinkEmoji: drink.emoji || DRINK_TYPES[drink.type]?.icon || '🥤',
      drinkType: drink.type,
      quantity,
      servingSize: drink.defaultServingSize,
      abv: drink.abv,
      mood,
      context: context as any,
    });
    
    setLogs(prev => [log, ...prev]);
    
    if (!drink.id.startsWith('default-')) {
      setCustomDrinks(prev => prev.map(d => 
        d.id === drink.id ? { ...d, usageCount: d.usageCount + 1 } : d
      ));
    }
    
    return log;
  }, [user?.$id]);

  // Delete log
  const deleteLog = useCallback(async (logId: string) => {
    await alcoholService.deleteLog(logId);
    setLogs(prev => prev.filter(l => l.id !== logId));
  }, []);

  // Delete custom drink
  const deleteDrink = useCallback(async (drinkId: string) => {
    await alcoholService.deleteCustomDrink(drinkId);
    setCustomDrinks(prev => prev.filter(d => d.id !== drinkId));
  }, []);

  // Insights
  const insights = useMemo((): AlcoholInsight | null => {
    return alcoholService.calculateInsights(logs);
  }, [logs]);

  // Today's units
  const getTodayUnits = useCallback((): number => {
    const today = new Date().toISOString().split('T')[0];
    return logs
      .filter(l => l.timestamp.split('T')[0] === today)
      .reduce((sum, l) => sum + l.units, 0);
  }, [logs]);

  // Calculate units for a drink
  const calculateUnits = useCallback((servingSize: number, abv: number): number => {
    return (servingSize * abv) / 10;
  }, []);

  return {
    customDrinks,
    allDrinks,
    defaultDrinks,
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
    calculateUnits,
  };
};