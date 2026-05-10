import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context';
import { goalsService, profileService, alcoholService } from '../services';
import type { AlcoholLog, AlcoholGoal, AlcoholInsight, Drink, MoodType } from '../types';
import { getBACAnalysis, checkLegalLimit, getUserStatus, type SexType, type DrinkData } from '../utils/bac';
import { alertService } from '@/features/circle/services';
import { getSmartSuggestedFavorites, getTimeOfDay, getSmartDrinksForTime } from '../services';

const STALE_TIME = 2 * 60 * 1000;

export const useAlcoholInsights = (logs: AlcoholLog[], drinks: Drink[]) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.$id;
  const userName = user?.name;

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

  const goal = goalQuery.data ?? null;
  const userProfile = profileQuery.data ?? null;

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
      isAboveLimit: isAbove, isNearLimit: isNear,
    };
  }, [logs, userProfile]);

  const insights = useMemo((): AlcoholInsight | null =>
    alcoholService.calculateInsights(logs, goal),
    [logs, goal]
  );

  const smartDrinks = useMemo(() => getSmartDrinksForTime(drinks, getTimeOfDay()), [drinks]);
  const suggestedFavorites = useMemo(() => drinks.length > 0 ? getSmartSuggestedFavorites(drinks, logs, 3) : [], [drinks, logs]);
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

  const isSafeToDrive = useMemo(() =>
    (userProfile?.legalLimit || 0.5) >= bacState.currentBAC,
    [bacState.currentBAC, userProfile]
  );

  const triggerCircleAlert = async (currentBAC: number, weeklyUnits: number, weeklyLimit: number) => {
    if (!userId || !userName) return;
    const status = getUserStatus(currentBAC, bacState.isAboveLimit, weeklyUnits, weeklyLimit);
    if (status === 'at_risk') {
      try { await alertService.createAlert({ userId, userName, alertType: 'risk_detected', severity: 'warning', message: `${userName} a dépassé son seuil.` }); } catch {}
    } else if (currentBAC > 0.8) {
      try { await alertService.createAlert({ userId, userName, alertType: 'threshold_exceeded', severity: 'urgent', message: `${userName} a un taux élevé (${currentBAC.toFixed(2)} g/L).` }); } catch {}
    }
  };

  const setWeeklyGoalMutation = useMutation({
    mutationFn: (limit: number) => {
      if (!userId) throw new Error('Not authenticated');
      return goalsService.createOrUpdateGoal(userId, { weeklyLimit: limit, isActive: true });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alcohol-goal', userId] }),
  });

  const updateUserProfileMutation = useMutation({
    mutationFn: (data: { weightKg?: number; sex?: 'male' | 'female' | 'unspecified' }) => {
      if (!userId) throw new Error('Not authenticated');
      return profileService.createOrUpdateProfile(userId, data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alcohol-profile', userId] }),
  });

  return {
    goal, userProfile,
    insights, bacState, isSafeToDrive,
    smartDrinks, suggestedFavorites, currentTimeOfDay, recentlyUsed,
    setWeeklyGoal: (limit: number) => setWeeklyGoalMutation.mutateAsync(limit),
    updateUserProfile: (data: { weightKg?: number; sex?: 'male' | 'female' | 'unspecified' }) => updateUserProfileMutation.mutateAsync(data),
    triggerCircleAlert,
    isLoading: goalQuery.isLoading || profileQuery.isLoading,
    isError: goalQuery.isError || profileQuery.isError,
  };
};