import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/features/auth/context';
import { alcoholService } from './service';
import { drinksService, type Drink } from './services/drinks.service';
import { goalsService } from './services/goals.service';
import { profileService } from './services/profile.service';
import type { UserProfile } from './services/profile.service';
import type { AlcoholLog, CreateDrinkForm, DrinkType, MoodType, AlcoholInsight, AlcoholGoal } from './types';
import {
  getBACAnalysis,
  checkLegalLimit,
  type SexType,
  type DrinkData,
} from './utils/bac';

export { type Drink };

// Popular drinks that will be seeded into the database
export const POPULAR_DRINKS_TO_SEED = [
  // Bières internationales
  { name: 'Lager classique', type: 'lager' as DrinkType, abv: 5, servingSize: 33, emoji: '🍺' },
  { name: 'Pilsner', type: 'pilsner' as DrinkType, abv: 5, servingSize: 33, emoji: '🍺' },
  { name: 'Stout (Guinness)', type: 'stout' as DrinkType, abv: 7, servingSize: 44, emoji: '🖤' },
  { name: 'IPA', type: 'ipa' as DrinkType, abv: 6.5, servingSize: 33, emoji: '🍺' },
  { name: 'Blanche (Weissbier)', type: 'wheat_beer' as DrinkType, abv: 5, servingSize: 50, emoji: '🍺' },
  { name: 'Ale anglaise', type: 'ale' as DrinkType, abv: 5.5, servingSize: 33, emoji: '🍺' },
  { name: 'Bière blonde', type: 'beer' as DrinkType, abv: 5, servingSize: 33, emoji: '🍺' },
  { name: 'Bière ambrée', type: 'beer' as DrinkType, abv: 6, servingSize: 33, emoji: '🍺' },
  { name: 'Cidre', type: 'cider' as DrinkType, abv: 5, servingSize: 33, emoji: '🍎' },
  
  // Vins internationaux
  { name: 'Bordeaux', type: 'red_wine' as DrinkType, abv: 13, servingSize: 15, emoji: '🍷' },
  { name: 'Chianti', type: 'red_wine' as DrinkType, abv: 13, servingSize: 15, emoji: '🍷' },
  { name: 'Rioja', type: 'red_wine' as DrinkType, abv: 13.5, servingSize: 15, emoji: '🍷' },
  { name: 'Pinot Noir', type: 'red_wine' as DrinkType, abv: 12.5, servingSize: 15, emoji: '🍷' },
  { name: 'Chardonnay', type: 'white_wine' as DrinkType, abv: 12.5, servingSize: 15, emoji: '🥂' },
  { name: 'Sauvignon Blanc', type: 'white_wine' as DrinkType, abv: 12, servingSize: 15, emoji: '🥂' },
  { name: 'Vinho Verde', type: 'white_wine' as DrinkType, abv: 11, servingSize: 15, emoji: '🥂' },
  { name: 'Rosé de Provence', type: 'rose_wine' as DrinkType, abv: 12.5, servingSize: 15, emoji: '🌸' },
  { name: 'Champagne', type: 'champagne' as DrinkType, abv: 12, servingSize: 10, emoji: '🍾' },
  { name: 'Prosecco', type: 'sparkling' as DrinkType, abv: 11, servingSize: 10, emoji: '🥂' },
  
  // Spiritueux internationaux
  { name: 'Whisky Scotch', type: 'whisky' as DrinkType, abv: 40, servingSize: 4, emoji: '🥃' },
  { name: 'Bourbon', type: 'whisky' as DrinkType, abv: 45, servingSize: 4, emoji: '🥃' },
  { name: 'Irish Whiskey', type: 'whisky' as DrinkType, abv: 40, servingSize: 4, emoji: '🥃' },
  { name: 'Vodka', type: 'vodka' as DrinkType, abv: 40, servingSize: 4, emoji: '💧' },
  { name: 'Vodka Russo', type: 'vodka' as DrinkType, abv: 40, servingSize: 4, emoji: '💧' },
  { name: 'Rhum blanc', type: 'rum' as DrinkType, abv: 40, servingSize: 4, emoji: '🏝️' },
  { name: 'Rhum ambré', type: 'rum' as DrinkType, abv: 42, servingSize: 4, emoji: '🏝️' },
  { name: 'Tequila blanche', type: 'tequila' as DrinkType, abv: 38, servingSize: 4, emoji: '🌵' },
  { name: 'Tequila Reposado', type: 'tequila' as DrinkType, abv: 40, servingSize: 4, emoji: '🌵' },
  { name: 'Gin London Dry', type: 'gin' as DrinkType, abv: 40, servingSize: 4, emoji: '🌿' },
  { name: 'Gin Botanique', type: 'gin' as DrinkType, abv: 42, servingSize: 4, emoji: '🌿' },
  { name: 'Cognac', type: 'cognac' as DrinkType, abv: 40, servingSize: 4, emoji: '🏰' },
  { name: 'Armagnac', type: 'brandy' as DrinkType, abv: 40, servingSize: 4, emoji: '🥃' },
  { name: 'Calvados', type: 'calvados' as DrinkType, abv: 40, servingSize: 4, emoji: '🍎' },
  
  // Cocktails populaires
  { name: 'Mojito', type: 'mojito' as DrinkType, abv: 15, servingSize: 30, emoji: '🍹' },
  { name: 'Margarita', type: 'margarita' as DrinkType, abv: 20, servingSize: 25, emoji: '🍹' },
  { name: 'Old Fashioned', type: 'old_fashioned' as DrinkType, abv: 35, servingSize: 8, emoji: '🥃' },
  { name: 'Martini', type: 'martini' as DrinkType, abv: 25, servingSize: 10, emoji: '🍸' },
  { name: 'Cosmopolitan', type: 'cosmopolitan' as DrinkType, abv: 20, servingSize: 15, emoji: '🍸' },
  { name: 'Daiquiri', type: 'daiquiri' as DrinkType, abv: 15, servingSize: 15, emoji: '🍹' },
  { name: 'Piña Colada', type: 'pina_colada' as DrinkType, abv: 15, servingSize: 30, emoji: '🍍' },
  { name: 'Aperol Spritz', type: 'aperol_spritz' as DrinkType, abv: 11, servingSize: 20, emoji: '🍊' },
  { name: 'Negroni', type: 'cocktail' as DrinkType, abv: 28, servingSize: 10, emoji: '🍸' },
  { name: 'Manhattan', type: 'cocktail' as DrinkType, abv: 30, servingSize: 10, emoji: '🥃' },
  { name: 'Gin Tonic', type: 'cocktail' as DrinkType, abv: 15, servingSize: 25, emoji: '🌿' },
  { name: 'Whisky Coke', type: 'cocktail' as DrinkType, abv: 15, servingSize: 30, emoji: '🥃' },
  
  // Spécialités régionales
  { name: 'Saké', type: 'sake' as DrinkType, abv: 15, servingSize: 10, emoji: '🍶' },
  { name: 'Soju', type: 'soju' as DrinkType, abv: 20, servingSize: 4, emoji: '🥃' },
  { name: 'Sangria', type: 'sangria' as DrinkType, abv: 10, servingSize: 25, emoji: '🍷' },
  { name: 'Sherry', type: 'sherry' as DrinkType, abv: 17, servingSize: 8, emoji: '🍷' },
  { name: 'Porto', type: 'port' as DrinkType, abv: 20, servingSize: 8, emoji: '🍷' },
  { name: 'Ouzo', type: 'spirit' as DrinkType, abv: 40, servingSize: 4, emoji: '🏺' },
  { name: 'Grappa', type: 'spirit' as DrinkType, abv: 40, servingSize: 4, emoji: '🍇' },
  { name: 'Pisco', type: 'spirit' as DrinkType, abv: 40, servingSize: 4, emoji: '🦅' },
  { name: 'Mezcal', type: 'spirit' as DrinkType, abv: 40, servingSize: 4, emoji: '🌵' },
];

export const useAlcohol = () => {
  const { user } = useAuth();
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [logs, setLogs] = useState<AlcoholLog[]>([]);
  const [goal, setGoal] = useState<AlcoholGoal | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [recentlyUsed, setRecentlyUsed] = useState<Drink[]>([]);
  const [lastDeletedLog, setLastDeletedLog] = useState<AlcoholLog | null>(null);
  const [seedsInProgress, setSeedsInProgress] = useState(false);

  // Seed drinks into the database (only runs once)
  const seedDrinksToDatabase = useCallback(async (): Promise<void> => {
    if (seedsInProgress) return;
    setSeedsInProgress(true);
    
    try {
      const existingDrinks = await drinksService.getAllDrinks();
      
      // If drinks already exist, don't seed again
      if (existingDrinks.length > 0) {
        console.log('[Seed] Drinks already exist in database');
        return;
      }
      
      console.log('[Seed] Seeding drinks into database...');
      
      // Create all drinks in the database
      for (const drinkData of POPULAR_DRINKS_TO_SEED) {
        try {
          await drinksService.createDrink({
            name: drinkData.name,
            type: drinkData.type,
            abv: drinkData.abv,
            defaultServingSize: drinkData.servingSize,
            emoji: drinkData.emoji,
            userId: undefined, // Global drinks have no userId
          });
          console.log(`[Seed] Created: ${drinkData.name}`);
        } catch (error) {
          console.error(`[Seed] Failed to create ${drinkData.name}:`, error);
        }
      }
    } catch (error) {
      console.error('[Seed] Error seeding drinks:', error);
    } finally {
      setSeedsInProgress(false);
    }
  }, [seedsInProgress]);

  const loadData = useCallback(async () => {
    if (!user?.$id) return;
    setLoading(true);
    
    try {
      // First, ensure drinks are seeded
      await seedDrinksToDatabase();
      
      // Now load all drinks from database (only from database!)
      const drinksData = await drinksService.getAllDrinks();
      setDrinks(drinksData);
      console.log(`[Alcohol] Loaded ${drinksData.length} drinks from database`);
      
      const logsData = await alcoholService.getLogs(user.$id);
      setLogs(logsData);
      
      const goalData = await goalsService.getGoal(user.$id);
      setGoal(goalData);
      
      const profileData = await profileService.getProfile(user.$id);
      setUserProfile(profileData);
      
      // Build recently used from logs
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentLogs = logsData.filter(l => new Date(l.timestamp) >= weekAgo);
      
      const seen = new Set<string>();
      const recentDrinks: Drink[] = [];
      
      for (const log of recentLogs) {
        const drink = drinksData.find(d => d.type === log.drinkType || d.name === log.drinkName);
        if (drink && !seen.has(drink.id)) {
          seen.add(drink.id);
          recentDrinks.push(drink);
        }
      }
      
      setRecentlyUsed(recentDrinks.slice(0, 4));
    } catch (err) {
      console.error('Error loading alcohol data:', err);
      // No fallback - drinks will be empty until database is ready
      setDrinks([]);
    } finally {
      setLoading(false);
    }
  }, [user?.$id, seedDrinksToDatabase]);

  const resetDrinks = useCallback(async () => {
    // Just reload from database - no local fallback
    const allDrinks = await drinksService.getAllDrinks();
    setDrinks(allDrinks);
  }, []);

  const createDrink = useCallback(async (form: CreateDrinkForm, emoji?: string) => {
    if (!user?.$id) throw new Error('Not authenticated');
    const drink = await drinksService.createDrink({
      name: form.name,
      type: form.type,
      abv: form.abv,
      defaultServingSize: form.defaultServingSize,
      emoji: emoji || '🥤',
      userId: user.$id, // User-specific drink
    });
    setDrinks(prev => [...prev, drink]);
    return drink;
  }, [user?.$id]);

  const customizeDrink = useCallback(async (
    drinkType: DrinkType,
    data: {
      name: string;
      abv: number;
      defaultServingSize: number;
      emoji: string;
    }
  ) => {
    if (!user?.$id) throw new Error('Not authenticated');
    const drink = await drinksService.setUserDrinkPreference(user.$id, {
      type: drinkType,
      ...data,
    });
    // Refresh all drinks from database
    const allDrinks = await drinksService.getAllDrinks();
    setDrinks(allDrinks);
    return drink;
  }, [user?.$id]);

  const quickLog = useCallback(async (drink: Drink, mood?: MoodType) => {
    if (!user?.$id) throw new Error('Not authenticated');
    if (!drink.id || drink.id.startsWith('local-')) {
      throw new Error('Cannot log a drink that does not exist in database');
    }
    
    const log = await alcoholService.createLog(user.$id, {
      drinkType: drink.type,
      servingSize: drink.defaultServingSize,
      abv: drink.abv,
      mood,
      drinkName: drink.name,
      drinkEmoji: drink.emoji,
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
      drinkName: lastDeletedLog.drinkName,
      drinkEmoji: lastDeletedLog.drinkEmoji,
    });
    setLogs(prev => [restoredLog, ...prev]);
    setLastDeletedLog(null);
  }, [lastDeletedLog, user?.$id]);

  const deleteDrink = useCallback(async (drinkId: string) => {
    if (drinkId.startsWith('default-') || drinkId.startsWith('local-')) {
      throw new Error('Cannot delete default drinks');
    }
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

  const bacState = useMemo(() => {
    const weightKg = userProfile?.weightKg || 70;
    const sex: SexType = userProfile?.sex || 'unspecified';
    const legalLimit = userProfile?.legalLimit || 0.5;
    
    const drinksData: DrinkData[] = logs.map(log => ({
      volumeCl: log.servingSize,
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
    customizeDrink,
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