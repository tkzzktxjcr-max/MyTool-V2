import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context';
import { drinksService, alcoholService, goalsService, profileService, getSmartSuggestedFavorites, getTimeOfDay, getSmartDrinksForTime, type Drink, type UserProfile } from './services';
import type { CreateDrinkForm, DrinkType, MoodType, AlcoholInsight, AlcoholGoal, AlcoholLog } from './types';
import { getBACAnalysis, checkLegalLimit, getUserStatus, type SexType, type DrinkData } from './utils/bac';
import { calculateUnits, calculateUnitsWithQuantity } from './utils/units';
import { deduplicateDrinks } from './utils/dedup';
import { alertService } from '@/features/circle/services';
import { toast } from 'sonner';

export { type Drink };

const STALE_TIME = 2 * 60 * 1000; // 2 minutes

export const useAlcohol = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.$id;
  const userName = user?.name;

  // Last deleted log for undo functionality
  const [lastDeletedLog, setLastDeletedLog] = useState<AlcoholLog | null>(null);

  // ── Queries ──────────────────────────────────────────────────────────
  const drinksQuery = useQuery({
    queryKey: ['drinks'],
    queryFn: () => drinksService.getAllDrinks(),
    staleTime: STALE_TIME,
  });

  const logsQuery = useQuery({
    queryKey: ['alcohol-logs', userId],
    queryFn: () => alcoholService.getLogs(userId!),
    enabled: !!userId,
    staleTime: STALE_TIME,
  });

  const goalQuery = useQuery({
    queryKey: ['alcohol-goal', userId],
    queryFn: () => goalsService.getGoal(userId!),
    enabled: !!userId,
    staleTime: STALE_TIME,
  });

  const profileQuery = useQuery({
    queryKey: ['alcohol-profile', userId],
    queryFn: () => profileService.getProfile(userId!),
    enabled: !!userId,
    staleTime: STALE_TIME,
  });

  // ── Derived data ──────────────────────────────────────────────────────
  const rawDrinks = drinksQuery.data ?? [];
  const drinks = useMemo(() => deduplicateDrinks(rawDrinks, userId), [rawDrinks, userId]);

  const logs = logsQuery.data ?? [];
  const goal = goalQuery.data ?? null;
  const userProfile = profileQuery.data ?? null;

  const libraryDrinks = useMemo(() => 
    drinks.filter(d => !d.userId).sort((a, b) => (b.popularity || 0) - (a.popularity || 0)), 
    [drinks]
  );

  const userDrinks = useMemo(() => 
    drinks.filter(d => d.userId === userId).sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0)), 
    [drinks, userId]
  );

  const favorites = useMemo(() => 
    drinks.filter(d => d.isFavorite).sort((a, b) => (a.favoriteRank || 5) - (b.favoriteRank || 5)), 
    [drinks]
  );

  const suggestedFavorites = useMemo(() => 
    drinks.length > 0 ? getSmartSuggestedFavorites(drinks, logs, 3) : [], 
    [drinks, logs]
  );

  const smartDrinks = useMemo(() => 
    getSmartDrinksForTime(drinks, getTimeOfDay()), 
    [drinks]
  );

  const currentTimeOfDay = useMemo(() => getTimeOfDay(), []);

  const recentlyUsed = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentLogs = logs.filter(l => new Date(l.timestamp) >= weekAgo);
    const seen = new Set<string>();
    const recent: Drink[] = [];
    for (const log of recentLogs) {
      const drink = drinks.find(d => d.type === log.drinkType || d.name === log.drinkName);
      if (drink && !seen.has(drink.id)) { seen.add(drink.id); recent.push(drink); }
    }
    return recent.slice(0, 4);
  }, [drinks, logs]);

  const bacState = useMemo(() => {
    const weightKg = userProfile?.weightKg || 70;
    const sex: SexType = userProfile?.sex || 'unspecified';
    const legalLimit = userProfile?.legalLimit || 0.5;
    const drinksData: DrinkData[] = logs.map(log => ({ volumeCl: log.servingSize, abv: log.abv, timestamp: log.timestamp }));
    const analysis = getBACAnalysis(drinksData, { weightKg, sex }, legalLimit);
    const { isAbove, isNear } = checkLegalLimit(analysis.currentBAC, legalLimit);
    return { 
      currentBAC: analysis.currentBAC, peakBAC: analysis.peakBAC, peakTime: analysis.peakTime, 
      zeroTime: analysis.zeroTime, safeToDriveTime: analysis.safeToDriveTime, timeline: analysis.timeline, 
      isAboveLimit: isAbove, isNearLimit: isNear 
    };
  }, [logs, userProfile]);

  const insights = useMemo((): AlcoholInsight | null => 
    alcoholService.calculateInsights(logs, goal), 
    [logs, goal]
  );

  const getTodayUnits = useCallback((): number => {
    const today = new Date().toISOString().split('T')[0];
    return logs.filter(l => l.timestamp.split('T')[0] === today).reduce((sum, l) => sum + l.units, 0);
  }, [logs]);

  const getWeeklyUnits = useCallback((): number => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return logs.filter(l => new Date(l.timestamp) >= weekAgo).reduce((sum, l) => sum + l.units, 0);
  }, [logs]);

  const isSafeToDrive = useMemo(() => 
    (userProfile?.legalLimit || 0.5) >= bacState.currentBAC, 
    [bacState.currentBAC, userProfile]
  );

  // ── Alert triggering ─────────────────────────────────────────────────
  const triggerCircleAlert = useCallback(async (
    currentBAC: number,
    weeklyUnits: number,
    weeklyLimit: number
  ) => {
    if (!userId || !userName) return;
    
    const status = getUserStatus(currentBAC, bacState.isAboveLimit, weeklyUnits, weeklyLimit);
    
    if (status === 'at_risk') {
      try {
        await alertService.createAlert({
          userId,
          userName,
          alertType: 'risk_detected',
          severity: 'warning',
          message: `${userName} a dépassé son seuil de consommation. Vérifiez qu'il/elle va bien.`,
        });
      } catch {
        // Silent fail - alerts are non-critical
      }
    } else if (currentBAC > 0.8) {
      try {
        await alertService.createAlert({
          userId,
          userName,
          alertType: 'threshold_exceeded',
          severity: 'urgent',
          message: `${userName} a un taux d'alcoolémie élevé (${currentBAC.toFixed(2)} g/L).`,
        });
      } catch {
        // Silent fail
      }
    }
  }, [userId, userName, bacState.isAboveLimit]);

  // ── Mutations ─────────────────────────────────────────────────────────
  const createDrinkMutation = useMutation({
    mutationFn: async ({ form, emoji }: { form: CreateDrinkForm; emoji?: string }) => {
      if (!userId) throw new Error('Not authenticated');
      
      // Check if a drink with same name+type already exists
      const existing = await drinksService.findExistingDrink(form.name, form.type);
      if (existing) {
        // Return existing drink instead of creating a duplicate
        return existing;
      }
      
      return drinksService.createDrink({ 
        name: form.name, type: form.type, abv: form.abv, 
        defaultServingSize: form.defaultServingSize, emoji: emoji || '🥤', 
        country: form.country, userId 
      });
    },
    onSuccess: (drink) => {
      queryClient.invalidateQueries({ queryKey: ['drinks'] });
      // If the drink already existed, inform the user
      if (!drink.userId || drink.isGlobal) {
        toast.info('Boisson déjà existante', {
          description: `"${drink.name}" existe déjà dans la bibliothèque.`,
        });
      }
    },
  });

  const quickLogMutation = useMutation({
    mutationFn: ({ drink, mood, quantity, timestamp }: { 
      drink: Drink; mood?: MoodType; quantity: number; timestamp?: string 
    }) => {
      if (!userId) throw new Error('Not authenticated');
      return alcoholService.createLog(userId, { 
        drinkType: drink.type, servingSize: drink.defaultServingSize, 
        abv: drink.abv, mood, drinkName: drink.name, drinkEmoji: drink.emoji, 
        quantity, timestamp 
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['alcohol-logs', userId] });
      drinksService.incrementUsage(variables.drink.id).catch(() => {});
      queryClient.invalidateQueries({ queryKey: ['drinks'] });
      setLastDeletedLog(null);
      
      // Trigger circle alerts after successful log
      const weeklyUnits = getWeeklyUnits();
      const weeklyLimit = goal?.weeklyLimit || 14;
      triggerCircleAlert(bacState.currentBAC, weeklyUnits, weeklyLimit);
    },
  });

  const deleteLogMutation = useMutation({
    mutationFn: (logId: string) => alcoholService.deleteLog(logId),
    onMutate: async (logId) => {
      await queryClient.cancelQueries({ queryKey: ['alcohol-logs', userId] });
      const previousLogs = queryClient.getQueryData<AlcoholLog[]>(['alcohol-logs', userId]);
      const logToDelete = previousLogs?.find(l => l.id === logId);
      if (logToDelete) {
        setLastDeletedLog(logToDelete);
        setTimeout(() => setLastDeletedLog(null), 5000);
      }
      queryClient.setQueryData<AlcoholLog[]>(['alcohol-logs', userId], 
        (old) => old?.filter(l => l.id !== logId) ?? []
      );
      return { previousLogs };
    },
    onError: (_err, _logId, context) => {
      if (context?.previousLogs) {
        queryClient.setQueryData(['alcohol-logs', userId], context.previousLogs);
      }
      toast.error('Erreur lors de la suppression');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['alcohol-logs', userId] });
    },
  });

  const undoDeleteMutation = useMutation({
    mutationFn: () => {
      if (!lastDeletedLog || !userId) throw new Error('Nothing to undo');
      return alcoholService.createLog(userId, {
        drinkType: lastDeletedLog.drinkType, servingSize: lastDeletedLog.servingSize, 
        abv: lastDeletedLog.abv, mood: lastDeletedLog.mood, drinkName: lastDeletedLog.drinkName, 
        drinkEmoji: lastDeletedLog.drinkEmoji, quantity: lastDeletedLog.quantity,
      });
    },
    onSuccess: () => {
      setLastDeletedLog(null);
      queryClient.invalidateQueries({ queryKey: ['alcohol-logs', userId] });
    },
  });

  const deleteDrinkMutation = useMutation({
    mutationFn: (drinkId: string) => drinksService.deleteDrink(drinkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drinks'] });
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: (drinkId: string) => drinksService.toggleFavorite(drinkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drinks'] });
    },
  });

  const setWeeklyGoalMutation = useMutation({
    mutationFn: (limit: number) => {
      if (!userId) throw new Error('Not authenticated');
      return goalsService.createOrUpdateGoal(userId, { weeklyLimit: limit, isActive: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alcohol-goal', userId] });
    },
  });

  const updateUserProfileMutation = useMutation({
    mutationFn: (data: { weightKg?: number; sex?: 'male' | 'female' | 'unspecified' }) => {
      if (!userId) throw new Error('Not authenticated');
      return profileService.createOrUpdateProfile(userId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alcohol-profile', userId] });
    },
  });

  // ── Wrapper functions (backward-compatible API) ────────────────────────
  const createDrink = async (form: CreateDrinkForm, emoji?: string): Promise<Drink> => {
    return createDrinkMutation.mutateAsync({ form, emoji });
  };

  const quickLog = async (drink: Drink, mood?: MoodType, quantity: number = 1, timestamp?: string): Promise<AlcoholLog> => {
    return quickLogMutation.mutateAsync({ drink, mood, quantity, timestamp });
  };

  const deleteLog = async (logId: string): Promise<void> => {
    await deleteLogMutation.mutateAsync(logId);
  };

  const undoDelete = async (): Promise<void> => {
    await undoDeleteMutation.mutateAsync();
  };

  const deleteDrink = async (drinkId: string): Promise<void> => {
    await deleteDrinkMutation.mutateAsync(drinkId);
  };

  const toggleFavorite = async (drinkId: string): Promise<void> => {
    await toggleFavoriteMutation.mutateAsync(drinkId);
  };

  const setWeeklyGoal = async (limit: number): Promise<void> => {
    await setWeeklyGoalMutation.mutateAsync(limit);
  };

  const updateUserProfile = async (data: { weightKg?: number; sex?: 'male' | 'female' | 'unspecified' }): Promise<void> => {
    await updateUserProfileMutation.mutateAsync(data);
  };

  // ── Loading & error states ────────────────────────────────────────────
  const isLoading = drinksQuery.isLoading || logsQuery.isLoading;
  const isError = drinksQuery.isError || logsQuery.isError;

  return { 
    drinks, libraryDrinks, userDrinks, smartDrinks, favorites, recentlyUsed, 
    suggestedFavorites, currentTimeOfDay, 
    logs, goal, userProfile, isLoading, isError, insights, lastDeletedLog, 
    bacState, isSafeToDrive, 
    createDrink, quickLog, deleteLog, undoDelete, deleteDrink, toggleFavorite, 
    setWeeklyGoal, updateUserProfile, getTodayUnits, getWeeklyUnits 
  };
};