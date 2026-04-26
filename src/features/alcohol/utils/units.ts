/**
 * Alcohol Units Calculator - Standard Français
 * 
 * En France, 1 unité d'alcool = 10g d'alcool pur.
 * Cette norme est utilisée par Santé Publique France et l'OMS.
 * 
 * Formule: Unités = (Volume cl × 10 × Degré% / 100 × densité éthanol) / 10
 * Simplifié: Unités = Volume cl × Degré × 0.0789
 */

import { DRINK_TYPES, type DrinkType } from '../types';

// =============================================================================
// CONSTANTES
// =============================================================================

export const ETHANOL_DENSITY = 0.789; // g/ml à 20°C
export const STANDARD_UNIT_GRAMS = 10; // 1 unité = 10g (standard français)

// =============================================================================
// FONCTIONS DE CALCUL
// =============================================================================

/**
 * Calcule les unités d'alcool (standard français)
 * 
 * @param volumeCl - Volume en centilitres
 * @param abv - Taux d'alcool en pourcentage (ex: 5 pour 5%)
 * @returns Nombre d'unités (arrondi à 1 décimale)
 * 
 * @example
 * calculateUnits(25, 5)  // 25cl de bière à 5% → ~1.0 unité
 * calculateUnits(10, 12)  // 10cl de vin à 12% → ~1.0 unité
 * calculateUnits(4, 40)   // 4cl de whisky à 40% → ~1.26 unités
 */
export const calculateUnits = (volumeCl: number, abv: number): number => {
  if (volumeCl <= 0 || abv <= 0) return 0;
  
  const volumeMl = volumeCl * 10; // conversion cl → ml
  const gramsPure = volumeMl * (abv / 100) * ETHANOL_DENSITY;
  const units = gramsPure / STANDARD_UNIT_GRAMS;
  
  // Arrondi à 1 décimale pour affichage
  return Math.round(units * 10) / 10;
};

/**
 * Calcule les unités pour une consommation avec quantité
 * 
 * @param volumeCl - Volume en centilitres par verre
 * @param abv - Taux d'alcool en pourcentage
 * @param quantity - Nombre de verres
 * @returns Nombre d'unités total
 */
export const calculateUnitsWithQuantity = (
  volumeCl: number, 
  abv: number, 
  quantity: number
): number => {
  const singleUnit = calculateUnits(volumeCl, abv);
  return Math.round(singleUnit * quantity * 10) / 10;
};

/**
 * Conversion inverse: unités → volume (bière standard 5%)
 * 
 * @param units - Nombre d'unités souhaitées
 * @param abv - Taux d'alcool en pourcentage
 * @returns Volume en cl nécessaire
 */
export const unitsToVolumeCl = (units: number, abv: number = 5): number => {
  if (units <= 0 || abv <= 0) return 0;
  
  const gramsNeeded = units * STANDARD_UNIT_GRAMS;
  const volumeMl = gramsNeeded / (ETHANOL_DENSITY * (abv / 100));
  return Math.round(volumeMl / 10 * 10) / 10; // arrondi à 1 décimale
};

// =============================================================================
// VOLUMES STANDARDS FRANÇAIS
// =============================================================================

export interface StandardDrink {
  name: string;
  volumeCl: number;
  abv: number;
  units: number;
  emoji: string;
  category: DrinkType;
}

// Volumes standards utilisés en France pour les repères de consommation
export const STANDARD_DRINKS: Record<string, StandardDrink> = {
  // Bières
  beer_half_pint: { name: 'Demi', volumeCl: 25, abv: 5, units: 1, emoji: '🍺', category: 'beer' },
  beer_pint: { name: 'Pinte', volumeCl: 50, abv: 5, units: 2, emoji: '🍺', category: 'beer' },
  beer_can: { name: 'Cannette', volumeCl: 33, abv: 5, units: 1.3, emoji: '🍺', category: 'beer' },
  beer_bottle: { name: 'Bouteille', volumeCl: 33, abv: 5, units: 1.3, emoji: '🍻', category: 'beer' },
  
  // Vins
  wine_small: { name: 'Demi-verre', volumeCl: 7.5, abv: 12, units: 0.7, emoji: '🍷', category: 'wine' },
  wine_glass: { name: 'Verre', volumeCl: 10, abv: 12, units: 1, emoji: '🍷', category: 'wine' },
  wine_larger: { name: 'Grand verre', volumeCl: 15, abv: 12, units: 1.5, emoji: '🍷', category: 'wine' },
  champagne: { name: 'Flûte', volumeCl: 10, abv: 12, units: 1, emoji: '🍾', category: 'champagne' },
  
  // Spiritueux
  spirit_shot: { name: 'Shot', volumeCl: 3, abv: 40, units: 0.95, emoji: '🥃', category: 'spirit' },
  spirit_glass: { name: 'Verre', volumeCl: 4, abv: 40, units: 1.26, emoji: '🥃', category: 'spirit' },
  
  // Cocktails (moyenne)
  cocktail: { name: 'Cocktail', volumeCl: 8, abv: 20, units: 1.26, emoji: '🍹', category: 'cocktail' },
  
  // Cidre
  cider: { name: 'Cidre', volumeCl: 25, abv: 5, units: 1, emoji: '🍎', category: 'cider' },
};

// =============================================================================
// VÉRIFICATION DE COHÉRENCE
// =============================================================================

/**
 * Vérifie qu'une consommation correspond à environ 1 unité
 * Tolérance de ±0.2 unités
 */
export const isStandardUnit = (volumeCl: number, abv: number): boolean => {
  const units = calculateUnits(volumeCl, abv);
  return Math.abs(units - 1) <= 0.2;
};

/**
 * Retourne le nombre d'unités "standards" pour un verre
 * Utilisé pour les快速 repères visuels
 */
export const getStandardUnitCount = (volumeCl: number, abv: number): number => {
  return Math.round(calculateUnits(volumeCl, abv));
};

/**
 * Calcule le pourcentage de l'objectif hebdomadaire atteint
 * 
 * @param weeklyUnits - Nombre d'unités consommées cette semaine
 * @param weeklyLimit - Limite hebdomadaire en unités
 * @returns Pourcentage (0-100+, peut dépasser 100% si au-delà de la limite)
 */
export const calculateWeeklyProgress = (
  weeklyUnits: number, 
  weeklyLimit: number
): number => {
  if (weeklyLimit <= 0) return weeklyUnits > 0 ? 150 : 0; // Si limite = 0 (arrêt), montrer 150% si consommation
  return Math.round((weeklyUnits / weeklyLimit) * 100);
};

/**
 * Détermine le niveau de risque basé sur la consommation hebdomadaire
 * Selon les recommandations OMS et Santé Publique France
 */
export const getRiskLevel = (
  weeklyUnits: number,
  weeklyLimit: number = 14
): 'low' | 'moderate' | 'high' => {
  const ratio = weeklyUnits / weeklyLimit;
  
  if (weeklyUnits === 0) return 'low';
  if (ratio <= 0.8) return 'low';
  if (ratio <= 1.0) return 'moderate';
  return 'high';
};

/**
 * Génère un message de feedback basé sur la consommation
 */
export const getFeedbackMessage = (
  weeklyUnits: number,
  weeklyLimit: number = 14
): string => {
  if (weeklyUnits === 0) {
    return '🎯 Semaine sobre - Excellent !';
  }
  
  const ratio = weeklyUnits / weeklyLimit;
  const remaining = weeklyLimit - weeklyUnits;
  
  if (ratio <= 0.5) {
    return `✨ À mi-chemin - ${remaining.toFixed(1)} unités restantes`;
  }
  if (ratio <= 0.8) {
    return `🌟 Bien parti - ${remaining.toFixed(1)} unités restantes`;
  }
  if (ratio <= 1.0) {
    return `⚠️ Limite proche - ${remaining.toFixed(1)} unités restantes`;
  }
  if (ratio <= 1.2) {
    return `📊 Au-delà de l'objectif (${weeklyUnits.toFixed(1)} unités)`;
  }
  return `🚨 Forte consommation cette semaine (${weeklyUnits.toFixed(1)} unités)`;
};

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  calculateUnits,
  calculateUnitsWithQuantity,
  unitsToVolumeCl,
  STANDARD_DRINKS,
  isStandardUnit,
  getStandardUnitCount,
  calculateWeeklyProgress,
  getRiskLevel,
  getFeedbackMessage,
  ETHANOL_DENSITY,
  STANDARD_UNIT_GRAMS,
};