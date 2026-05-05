"use client";

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '@/features/auth/context';
import { goalsService } from '@/features/alcohol/services';
import { profileService } from '@/features/alcohol/services';

const STORAGE_KEY = 'fh_alcohol_onboarding';
const DRINKS_KEY = 'fh_alcohol_favorites';

export type AlcoholGoal = 'discover' | 'moderate' | 'reduce' | 'sport' | 'quit' | null;
export type SexType = 'male' | 'female';

export interface AlcoholProfile {
  goal: AlcoholGoal;
  sex: SexType;
  weight: number;
  favoriteDrinks: string[];
}

export interface DrinkOption {
  id: string;
  name: string;
  emoji: string;
  volumeCl: number;
  abv: number;
}

const DEFAULT_DRINKS: DrinkOption[] = [
  { id: 'beer', name: 'Bière', emoji: '🍺', volumeCl: 25, abv: 5 },
  { id: 'wine', name: 'Vin', emoji: '🍷', volumeCl: 12, abv: 12 },
  { id: 'whisky', name: 'Whisky', emoji: '🥃', volumeCl: 4, abv: 40 },
  { id: 'vodka', name: 'Vodka', emoji: '💧', volumeCl: 4, abv: 40 },
  { id: 'champagne', name: 'Champagne', emoji: '🍾', volumeCl: 12, abv: 12 },
  { id: 'cocktail', name: 'Cocktail', emoji: '🍹', volumeCl: 8, abv: 25 },
  { id: 'cider', name: 'Cidre', emoji: '🍎', volumeCl: 33, abv: 5 },
];

const GOAL_WEEKLY_LIMITS: Record<Exclude<AlcoholGoal, null>, number> = {
  discover: 21,
  moderate: 14,
  reduce: 10,
  sport: 7,
  quit: 0,
};

const loadStoredData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return {
        profile: data.profile || { goal: null, sex: 'male', weight: 70, favoriteDrinks: [] },
        completed: data.completed || false,
        completedAt: data.completedAt || null,
      };
    }
  } catch {
    // Ignore localStorage parse errors
  }
  return null;
};

interface UseAlcoholOnboardingReturn {
  profile: AlcoholProfile;
  step: number;
  hasCompleted: boolean;
  drinks: DrinkOption[];
  isLoading: boolean;
  setGoal: (goal: AlcoholGoal) => void;
  setSex: (sex: SexType) => void;
  setWeight: (weight: number) => void;
  toggleFavoriteDrink: (drinkId: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  complete: () => Promise<void>;
  reset: () => void;
  canProceed: () => boolean;
}

export function useAlcoholOnboarding(): UseAlcoholOnboardingReturn {
  const { user } = useAuth();
  
  const initialData = useMemo(() => loadStoredData(), []);
  
  const [profile, setProfile] = useState<AlcoholProfile>(
    initialData?.profile || { goal: null, sex: 'male', weight: 70, favoriteDrinks: [] }
  );
  const [step, setStep] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(initialData?.completed || false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user?.$id) return;
    
    const checkOnboardingStatus = async () => {
      setIsLoading(true);
      try {
        const appProfile = await profileService.getProfile(user.$id);
        if (appProfile?.onboardingCompleted) {
          setHasCompleted(true);
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            profile: {
              goal: appProfile.weightKg ? 'moderate' : null,
              sex: appProfile.sex as SexType,
              weight: appProfile.weightKg,
              favoriteDrinks: [],
            },
            completed: true,
            completedAt: new Date().toISOString(),
          }));
        }
      } catch {
        // Profile doesn't exist yet — onboarding needed
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user?.$id]);

  const saveToStorage = useCallback((completed: boolean = true) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        profile,
        completed,
        completedAt: completed ? new Date().toISOString() : null,
      }));
      setHasCompleted(completed);
    } catch {
      // localStorage may be unavailable
    }
  }, [profile]);

  const setGoal = useCallback((goal: AlcoholGoal) => {
    setProfile(prev => ({ ...prev, goal }));
  }, []);

  const setSex = useCallback((sex: SexType) => {
    setProfile(prev => ({ ...prev, sex }));
  }, []);

  const setWeight = useCallback((weight: number) => {
    setProfile(prev => ({ ...prev, weight }));
  }, []);

  const toggleFavoriteDrink = useCallback((drinkId: string) => {
    setProfile(prev => ({
      ...prev,
      favoriteDrinks: prev.favoriteDrinks.includes(drinkId)
        ? prev.favoriteDrinks.filter(id => id !== drinkId)
        : [...prev.favoriteDrinks, drinkId],
    }));
  }, []);

  const nextStep = useCallback(() => {
    setStep(prev => Math.min(prev + 1, 2));
  }, []);

  const prevStep = useCallback(() => {
    setStep(prev => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback((newStep: number) => {
    setStep(newStep);
  }, []);

  const canProceed = useCallback((): boolean => {
    switch (step) {
      case 0:
        return profile.goal !== null;
      case 1:
        return profile.weight > 0 && profile.weight < 300;
      case 2:
        return profile.favoriteDrinks.length > 0;
      default:
        return false;
    }
  }, [step, profile]);

  const complete = useCallback(async () => {
    if (!user?.$id) {
      saveToStorage(true);
      return;
    }

    try {
      await profileService.createOrUpdateProfile(user.$id, {
        weightKg: profile.weight,
        sex: profile.sex,
        legalLimit: 0.5,
        onboardingCompleted: true,
      });

      const weeklyLimit = profile.goal ? GOAL_WEEKLY_LIMITS[profile.goal] : 14;
      await goalsService.createOrUpdateGoal(user.$id, {
        weeklyLimit,
        isActive: true,
      });

      localStorage.setItem(DRINKS_KEY, JSON.stringify(profile.favoriteDrinks));
      saveToStorage(true);
    } catch {
      // Still save to localStorage even if Appwrite fails
      saveToStorage(true);
    }
  }, [user, profile, saveToStorage]);

  const reset = useCallback(() => {
    setProfile({ goal: null, sex: 'male', weight: 70, favoriteDrinks: [] });
    setStep(0);
    setHasCompleted(false);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(DRINKS_KEY);
  }, []);

  return {
    profile,
    step,
    hasCompleted,
    isLoading,
    drinks: DEFAULT_DRINKS,
    setGoal,
    setSex,
    setWeight,
    toggleFavoriteDrink,
    nextStep,
    prevStep,
    goToStep,
    complete,
    reset,
    canProceed,
  };
}