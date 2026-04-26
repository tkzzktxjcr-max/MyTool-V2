/**
 * Alcohol Units Calculator - Standard Français
 * 1 unité d'alcool = 10g d'alcool pur (Santé Publique France / OMS)
 */

import { DRINK_TYPES, type DrinkType } from '../types';
import { ALCOHOL, HEALTH } from '@/lib/constants';

export const calculateUnits = (volumeCl: number, abv: number): number => {
  if (volumeCl <= 0 || abv <= 0) return 0;
  const volumeMl = volumeCl * 10;
  const gramsPure = volumeMl * (abv / 100) * ALCOHOL.DENSITY;
  return Math.round((gramsPure / ALCOHOL.STANDARD_UNIT_GRAMS) * 10) / 10;
};

export const calculateUnitsWithQuantity = (volumeCl: number, abv: number, quantity: number): number => {
  return Math.round(calculateUnits(volumeCl, abv) * quantity * 10) / 10;
};

export const unitsToVolumeCl = (units: number, abv: number = 5): number => {
  if (units <= 0 || abv <= 0) return 0;
  const gramsNeeded = units * ALCOHOL.STANDARD_UNIT_GRAMS;
  return Math.round((gramsNeeded / (ALCOHOL.DENSITY * (abv / 100))) / 10 * 10) / 10;
};

export interface StandardDrink {
  name: string; volumeCl: number; abv: number; units: number; emoji: string; category: DrinkType;
}

export const STANDARD_DRINKS: Record<string, StandardDrink> = {
  beer_half_pint: { name: 'Demi', volumeCl: 25, abv: 5, units: 1, emoji: '🍺', category: 'beer' },
  beer_pint: { name: 'Pinte', volumeCl: 50, abv: 5, units: 2, emoji: '🍺', category: 'beer' },
  beer_can: { name: 'Cannette', volumeCl: 33, abv: 5, units: 1.3, emoji: '🍺', category: 'beer' },
  wine_small: { name: 'Demi-verre', volumeCl: 7.5, abv: 12, units: 0.7, emoji: '🍷', category: 'wine' },
  wine_glass: { name: 'Verre', volumeCl: 10, abv: 12, units: 1, emoji: '🍷', category: 'wine' },
  spirit_shot: { name: 'Shot', volumeCl: 3, abv: 40, units: 0.95, emoji: '🥃', category: 'spirit' },
  cocktail: { name: 'Cocktail', volumeCl: 8, abv: 20, units: 1.26, emoji: '🍹', category: 'cocktail' },
};

export const isStandardUnit = (volumeCl: number, abv: number): boolean => Math.abs(calculateUnits(volumeCl, abv) - 1) <= 0.2;
export const getStandardUnitCount = (volumeCl: number, abv: number): number => Math.round(calculateUnits(volumeCl, abv));

export const calculateWeeklyProgress = (weeklyUnits: number, weeklyLimit: number): number => {
  if (weeklyLimit <= 0) return weeklyUnits > 0 ? 150 : 0;
  return Math.round((weeklyUnits / weeklyLimit) * 100);
};

export const getRiskLevel = (weeklyUnits: number, weeklyLimit: number = HEALTH.MAX_WEEKLY_UNITS): 'low' | 'moderate' | 'high' => {
  const ratio = weeklyUnits / weeklyLimit;
  if (weeklyUnits === 0) return 'low';
  if (ratio <= 0.8) return 'low';
  if (ratio <= 1.0) return 'moderate';
  return 'high';
};

export const getFeedbackMessage = (weeklyUnits: number, weeklyLimit: number = HEALTH.MAX_WEEKLY_UNITS): string => {
  if (weeklyUnits === 0) return '🎯 Semaine sobre - Excellent !';
  const ratio = weeklyUnits / weeklyLimit;
  const remaining = weeklyLimit - weeklyUnits;
  if (ratio <= 0.5) return `✨ À mi-chemin - ${remaining.toFixed(1)} unités restantes`;
  if (ratio <= 0.8) return `🌟 Bien parti - ${remaining.toFixed(1)} unités restantes`;
  if (ratio <= 1.0) return `⚠️ Limite proche - ${remaining.toFixed(1)} unités restantes`;
  if (ratio <= 1.2) return `📊 Au-delà de l'objectif (${weeklyUnits.toFixed(1)} unités)`;
  return `🚨 Forte consommation cette semaine (${weeklyUnits.toFixed(1)} unités)`;
};
