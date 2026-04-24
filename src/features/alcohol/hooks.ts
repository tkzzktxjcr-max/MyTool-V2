import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/features/auth/context';
import { alcoholService } from './service';
import { drinksService, type Drink } from './services/drinks.service';
import { goalsService } from './services/goals.service';
import { profileService } from './services/profile.service';
import type { UserProfile } from './services/profile.service';
import type { CountryCode, CreateDrinkForm, DrinkType, MoodType, AlcoholInsight, AlcoholGoal, AlcoholLog } from './types';
import {
  getBACAnalysis,
  checkLegalLimit,
  type SexType,
  type DrinkData,
} from './utils/bac';

export { type Drink };

// Popular drinks that will be seeded into the database
export const POPULAR_DRINKS_TO_SEED = [
  // France
  { name: 'Bordeaux', type: 'red_wine' as DrinkType, abv: 13, servingSize: 15, emoji: '🍷', country: 'FR' as CountryCode },
  { name: 'Chateau Margaux', type: 'red_wine' as DrinkType, abv: 13.5, servingSize: 15, emoji: '🍷', country: 'FR' as CountryCode },
  { name: 'Chianti', type: 'red_wine' as DrinkType, abv: 13, servingSize: 15, emoji: '🍷', country: 'FR' as CountryCode },
  { name: 'Champagne Veuve Clicquot', type: 'champagne' as DrinkType, abv: 12, servingSize: 10, emoji: '🍾', country: 'FR' as CountryCode },
  { name: 'Moet & Chandon', type: 'champagne' as DrinkType, abv: 12, servingSize: 10, emoji: '🍾', country: 'FR' as CountryCode },
  { name: 'Rose de Provence', type: 'rose_wine' as DrinkType, abv: 12.5, servingSize: 15, emoji: '🌸', country: 'FR' as CountryCode },
  { name: 'Chablis', type: 'white_wine' as DrinkType, abv: 12, servingSize: 15, emoji: '🥂', country: 'FR' as CountryCode },
  { name: 'Cognac Hennessy', type: 'cognac' as DrinkType, abv: 40, servingSize: 4, emoji: '🏰', country: 'FR' as CountryCode },
  { name: 'Remy Martin', type: 'cognac' as DrinkType, abv: 40, servingSize: 4, emoji: '🏰', country: 'FR' as CountryCode },
  { name: 'Calvados', type: 'calvados' as DrinkType, abv: 40, servingSize: 4, emoji: '🍎', country: 'FR' as CountryCode },
  { name: 'Armagnac', type: 'brandy' as DrinkType, abv: 40, servingSize: 4, emoji: '🥃', country: 'FR' as CountryCode },
  
  // United Kingdom
  { name: 'Whisky Scotch', type: 'whisky' as DrinkType, abv: 40, servingSize: 4, emoji: '🥃', country: 'GB' as CountryCode },
  { name: 'Glenfiddich', type: 'whisky' as DrinkType, abv: 43, servingSize: 4, emoji: '🥃', country: 'GB' as CountryCode },
  { name: 'Macallan', type: 'whisky' as DrinkType, abv: 43, servingSize: 4, emoji: '🥃', country: 'GB' as CountryCode },
  { name: 'Gin London Dry', type: 'gin' as DrinkType, abv: 40, servingSize: 4, emoji: '🌿', country: 'GB' as CountryCode },
  { name: 'Tanqueray', type: 'gin' as DrinkType, abv: 43.1, servingSize: 4, emoji: '🌿', country: 'GB' as CountryCode },
  { name: 'IPA Craft', type: 'ipa' as DrinkType, abv: 6.5, servingSize: 33, emoji: '🍺', country: 'GB' as CountryCode },
  { name: "Fuller's London Pride", type: 'ale' as DrinkType, abv: 5.2, servingSize: 33, emoji: '🍺', country: 'GB' as CountryCode },
  { name: 'Guinness', type: 'stout' as DrinkType, abv: 7, servingSize: 44, emoji: '🖤', country: 'IE' as CountryCode },
  
  // Germany
  { name: 'Weissbier', type: 'wheat_beer' as DrinkType, abv: 5, servingSize: 50, emoji: '🍺', country: 'DE' as CountryCode },
  { name: 'Paulaner', type: 'wheat_beer' as DrinkType, abv: 5.5, servingSize: 50, emoji: '🍺', country: 'DE' as CountryCode },
  { name: 'Hofbrauhaus', type: 'lager' as DrinkType, abv: 6, servingSize: 50, emoji: '🍺', country: 'DE' as CountryCode },
  { name: 'Pilsner German', type: 'pilsner' as DrinkType, abv: 5, servingSize: 33, emoji: '🍺', country: 'DE' as CountryCode },
  
  // Italy
  { name: 'Martini Bianco', type: 'martini' as DrinkType, abv: 15, servingSize: 10, emoji: '🍸', country: 'IT' as CountryCode },
  { name: 'Martini Rosso', type: 'martini' as DrinkType, abv: 15, servingSize: 10, emoji: '🍸', country: 'IT' as CountryCode },
  { name: 'Negroni', type: 'cocktail' as DrinkType, abv: 28, servingSize: 10, emoji: '🍸', country: 'IT' as CountryCode },
  { name: 'Aperol Spritz', type: 'aperol_spritz' as DrinkType, abv: 11, servingSize: 20, emoji: '🍊', country: 'IT' as CountryCode },
  { name: 'Campari Spritz', type: 'sparkling' as DrinkType, abv: 11, servingSize: 20, emoji: '🍊', country: 'IT' as CountryCode },
  { name: 'Prosecco', type: 'sparkling' as DrinkType, abv: 11, servingSize: 10, emoji: '🥂', country: 'IT' as CountryCode },
  { name: 'Grappa', type: 'spirit' as DrinkType, abv: 40, servingSize: 4, emoji: '🍇', country: 'IT' as CountryCode },
  
  // Spain
  { name: 'Sangria', type: 'sangria' as DrinkType, abv: 10, servingSize: 25, emoji: '🍷', country: 'ES' as CountryCode },
  { name: 'Rioja', type: 'red_wine' as DrinkType, abv: 13.5, servingSize: 15, emoji: '🍷', country: 'ES' as CountryCode },
  { name: 'Jerez (Sherry)', type: 'sherry' as DrinkType, abv: 17, servingSize: 8, emoji: '🍷', country: 'ES' as CountryCode },
  { name: 'Mahou', type: 'lager' as DrinkType, abv: 5.5, servingSize: 33, emoji: '🍺', country: 'ES' as CountryCode },
  { name: 'Estrella Damm', type: 'lager' as DrinkType, abv: 5.4, servingSize: 33, emoji: '🍺', country: 'ES' as CountryCode },
  
  // Portugal
  { name: 'Porto Vintage', type: 'port' as DrinkType, abv: 20, servingSize: 8, emoji: '🍷', country: 'PT' as CountryCode },
  { name: 'Porto Tawny', type: 'port' as DrinkType, abv: 19.5, servingSize: 8, emoji: '🍷', country: 'PT' as CountryCode },
  
  // Cuba
  { name: 'Mojito', type: 'mojito' as DrinkType, abv: 15, servingSize: 30, emoji: '🍹', country: 'CU' as CountryCode },
  { name: 'Daiquiri', type: 'daiquiri' as DrinkType, abv: 15, servingSize: 15, emoji: '🍹', country: 'CU' as CountryCode },
  { name: 'Cuba Libre', type: 'cocktail' as DrinkType, abv: 15, servingSize: 30, emoji: '🥤', country: 'CU' as CountryCode },
  { name: 'Havana Club', type: 'rum' as DrinkType, abv: 40, servingSize: 4, emoji: '🏝️', country: 'CU' as CountryCode },
  
  // Mexico
  { name: 'Margarita', type: 'margarita' as DrinkType, abv: 20, servingSize: 25, emoji: '🍹', country: 'MX' as CountryCode },
  { name: 'Tequila Don Julio', type: 'tequila' as DrinkType, abv: 38, servingSize: 4, emoji: '🌵', country: 'MX' as CountryCode },
  { name: 'Patron Silver', type: 'tequila' as DrinkType, abv: 40, servingSize: 4, emoji: '🌵', country: 'MX' as CountryCode },
  { name: 'Mezcal', type: 'spirit' as DrinkType, abv: 40, servingSize: 4, emoji: '🌵', country: 'MX' as CountryCode },
  
  // United States
  { name: 'Old Fashioned', type: 'old_fashioned' as DrinkType, abv: 35, servingSize: 8, emoji: '🥃', country: 'US' as CountryCode },
  { name: 'Manhattan', type: 'cocktail' as DrinkType, abv: 30, servingSize: 10, emoji: '🥃', country: 'US' as CountryCode },
  { name: 'Cosmopolitan', type: 'cosmopolitan' as DrinkType, abv: 20, servingSize: 15, emoji: '🍸', country: 'US' as CountryCode },
  { name: 'Whisky Sour', type: 'cocktail' as DrinkType, abv: 25, servingSize: 15, emoji: '🍋', country: 'US' as CountryCode },
  { name: "Bourbon Jack Daniel's", type: 'whisky' as DrinkType, abv: 40, servingSize: 4, emoji: '🥃', country: 'US' as CountryCode },
  { name: 'Jim Beam', type: 'whisky' as DrinkType, abv: 40, servingSize: 4, emoji: '🥃', country: 'US' as CountryCode },
  
  // Puerto Rico
  { name: 'Pina Colada', type: 'pina_colada' as DrinkType, abv: 15, servingSize: 30, emoji: '🍍', country: 'PR' as CountryCode },
  { name: 'Bacardi', type: 'rum' as DrinkType, abv: 40, servingSize: 4, emoji: '🏝️', country: 'PR' as CountryCode },
  
  // Russia
  { name: 'Vodka Stolichnaya', type: 'vodka' as DrinkType, abv: 40, servingSize: 4, emoji: '💧', country: 'RU' as CountryCode },
  { name: 'Vodka Beluga', type: 'vodka' as DrinkType, abv: 40, servingSize: 4, emoji: '💧', country: 'RU' as CountryCode },
  { name: 'Vodka Grey Goose', type: 'vodka' as DrinkType, abv: 40, servingSize: 4, emoji: '💧', country: 'FR' as CountryCode },
  
  // Japan
  { name: 'Sake Junmai', type: 'sake' as DrinkType, abv: 15, servingSize: 10, emoji: '🍶', country: 'JP' as CountryCode },
  { name: 'Sake Daiginjo', type: 'sake' as DrinkType, abv: 16, servingSize: 10, emoji: '🍶', country: 'JP' as CountryCode },
  { name: 'Japanese Highball', type: 'whisky' as DrinkType, abv: 40, servingSize: 4, emoji: '🥃', country: 'JP' as CountryCode },
  
  // South Korea
  { name: 'Soju', type: 'soju' as DrinkType, abv: 20, servingSize: 4, emoji: '🥃', country: 'KR' as CountryCode },
  { name: 'Choi Yun', type: 'soju' as DrinkType, abv: 17, servingSize: 4, emoji: '🥃', country: 'KR' as CountryCode },
  
  // Greece
  { name: 'Ouzo', type: 'spirit' as DrinkType, abv: 40, servingSize: 4, emoji: '🏺', country: 'GR' as CountryCode },
  { name: 'Mastiha', type: 'spirit' as DrinkType, abv: 40, servingSize: 4, emoji: '🌿', country: 'GR' as CountryCode },
  
  // Netherlands
  { name: 'Heineken', type: 'lager' as DrinkType, abv: 5, servingSize: 33, emoji: '🍺', country: 'NL' as CountryCode },
  { name: 'Amstel', type: 'lager' as DrinkType, abv: 5, servingSize: 33, emoji: '🍺', country: 'NL' as CountryCode },
  { name: 'Grolsch', type: 'lager' as DrinkType, abv: 5.8, servingSize: 45, emoji: '🍺', country: 'NL' as CountryCode },
  
  // China
  { name: 'Baijiu', type: 'spirit' as DrinkType, abv: 52, servingSize: 4, emoji: '🍶', country: 'CN' as CountryCode },
  { name: 'Moutai', type: 'spirit' as DrinkType, abv: 53, servingSize: 4, emoji: '🏺', country: 'CN' as CountryCode },
  
  // Generic
  { name: 'Biere blonde', type: 'beer' as DrinkType, abv: 5, servingSize: 33, emoji: '🍺' },
  { name: 'Biere ambre', type: 'beer' as DrinkType, abv: 6, servingSize: 33, emoji: '🍺' },
  { name: 'Cidre', type: 'cider' as DrinkType, abv: 5, servingSize: 33, emoji: '🍎' },
  { name: 'Vin rouge', type: 'red_wine' as DrinkType, abv: 13, servingSize: 15, emoji: '🍷' },
  { name: 'Vin blanc', type: 'white_wine' as DrinkType, abv: 12, servingSize: 15, emoji: '🥂' },
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
            country: drinkData.country,
            userId: undefined,
          });
          console.log(`[Seed] Created: ${drinkData.name} (${drinkData.country || 'International'})`);
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
      
      // Now load all drinks from database
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
      setDrinks([]);
    } finally {
      setLoading(false);
    }
  }, [user?.$id, seedDrinksToDatabase]);

  const resetDrinks = useCallback(async () => {
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
      country: form.country,
      userId: user.$id,
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
      country?: CountryCode;
    }
  ) => {
    if (!user?.$id) throw new Error('Not authenticated');
    const drink = await drinksService.setUserDrinkPreference(user.$id, {
      type: drinkType,
      ...data,
    });
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

  const getDrinksByCountry = useCallback(() => {
    const grouped: Record<string, Drink[]> = {};
    
    for (const drink of drinks) {
      const country = drink.country || 'INT';
      if (!grouped[country]) {
        grouped[country] = [];
      }
      grouped[country].push(drink);
    }
    
    return grouped;
  }, [drinks]);

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
    getDrinksByCountry,
  };
};