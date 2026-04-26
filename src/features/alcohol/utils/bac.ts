/**
 * BAC Calculation Utility
 * Uses Widmark formula for accurate blood alcohol concentration estimation
 * 
 * REFERENCES:
 * - Widmark, E. M. P. (1932). "Die theoretischen Grundlagen der gerichtsmedizinischen Blutalkoholbestimmung"
 * - OMS Guidelines on Alcohol and Health (2018)
 */

import { ALCOHOL, HEALTH } from '@/lib/constants';

export type SexType = 'male' | 'female' | 'unspecified';

export interface UserProfile {
  weightKg: number;
  sex: SexType;
}

export interface DrinkData {
  volumeCl: number;
  abv: number;
  timestamp: string;
}

export interface BACDataPoint {
  time: Date;
  bac: number;
  isPast: boolean;
}

export interface BACResult {
  currentBAC: number;
  peakBAC: number;
  peakTime: Date;
  zeroTime: Date;
  safeToDriveTime?: Date;
  timeline: BACDataPoint[];
}

/**
 * Calculate pure alcohol in grams from volume and ABV
 * Formula: grams = (volumeCl × 10) × (abv / 100) × alcoholDensity
 */
export const calculateAlcoholGrams = (volumeCl: number, abv: number): number => {
  const volumeMl = volumeCl * 10;
  return volumeMl * (abv / 100) * ALCOHOL.DENSITY;
};

const calculatePeakBAC = (
  volumeCl: number, abv: number, weightKg: number, sex: SexType
): number => {
  const alcoholGrams = calculateAlcoholGrams(volumeCl, abv);
  return alcoholGrams / (weightKg * ALCOHOL.BODY_WATER[sex]);
};

export const calculateBACAtTime = (
  volumeCl: number, abv: number, weightKg: number, sex: SexType, hoursSinceDrink: number
): number => {
  const peakBAC = calculatePeakBAC(volumeCl, abv, weightKg, sex);
  if (hoursSinceDrink < ALCOHOL.PEAK_ABSORPTION_HOURS) {
    return peakBAC * (hoursSinceDrink / ALCOHOL.PEAK_ABSORPTION_HOURS);
  }
  const hoursAfterPeak = hoursSinceDrink - ALCOHOL.PEAK_ABSORPTION_HOURS;
  return Math.max(0, peakBAC - ALCOHOL.ELIMINATION_RATE * hoursAfterPeak);
};

export const calculateTotalBAC = (
  drinks: DrinkData[], userProfile: UserProfile, atTime: Date = new Date()
): number => {
  return drinks.reduce((total, drink) => {
    const hoursSince = (atTime.getTime() - new Date(drink.timestamp).getTime()) / (1000 * 60 * 60);
    if (hoursSince < -0.5 || hoursSince > 24) return total;
    return total + calculateBACAtTime(drink.volumeCl, drink.abv, userProfile.weightKg, userProfile.sex, hoursSince);
  }, 0);
};

export const findPeakInfo = (drinks: DrinkData[], userProfile: UserProfile): { peakTime: Date; peakBAC: number } => {
  if (drinks.length === 0) return { peakTime: new Date(), peakBAC: 0 };
  
  let lastDrinkTime = new Date(0);
  drinks.forEach(d => { const t = new Date(d.timestamp); if (t > lastDrinkTime) lastDrinkTime = t; });
  
  const peakTime = new Date(lastDrinkTime.getTime() + ALCOHOL.PEAK_ABSORPTION_HOURS * 3600000);
  let peakBAC = 0;
  drinks.forEach(d => {
    const hoursToPeak = (peakTime.getTime() - new Date(d.timestamp).getTime()) / 3600000;
    if (hoursToPeak >= 0) peakBAC += calculateBACAtTime(d.volumeCl, d.abv, userProfile.weightKg, userProfile.sex, hoursToPeak);
  });
  return { peakTime, peakBAC: Math.round(peakBAC * 1000) / 1000 };
};

export const findZeroTime = (drinks: DrinkData[], userProfile: UserProfile): Date => {
  const { peakBAC, peakTime } = findPeakInfo(drinks, userProfile);
  if (peakBAC <= 0) return new Date();
  return new Date(peakTime.getTime() + (peakBAC / ALCOHOL.ELIMINATION_RATE) * 3600000);
};

export const findSafeToDriveTime = (
  drinks: DrinkData[], userProfile: UserProfile, legalLimit: number = HEALTH.LEGAL_BAC_LIMIT
): Date => {
  if (drinks.length === 0) return new Date();
  const { peakBAC, peakTime } = findPeakInfo(drinks, userProfile);
  if (peakBAC <= legalLimit) return new Date();
  return new Date(peakTime.getTime() + ((peakBAC - legalLimit) / ALCOHOL.ELIMINATION_RATE) * 3600000);
};

export const generateBACTimeline = (
  drinks: DrinkData[], userProfile: UserProfile,
  options: { hoursBeforeNow?: number; hoursAfterNow?: number; intervalMinutes?: number } = {}
): BACDataPoint[] => {
  const { hoursBeforeNow = 2, hoursAfterNow = 12, intervalMinutes = 15 } = options;
  const now = new Date();
  const timeline: BACDataPoint[] = [];
  const startTime = new Date(now.getTime() - hoursBeforeNow * 3600000);
  const endTime = new Date(now.getTime() + hoursAfterNow * 3600000);
  
  for (let time = startTime.getTime(); time <= endTime.getTime(); time += intervalMinutes * 60000) {
    const currentDate = new Date(time);
    const bac = calculateTotalBAC(drinks, userProfile, currentDate);
    timeline.push({ time: currentDate, bac: Math.round(bac * 1000) / 1000, isPast: time < now.getTime() });
  }
  return timeline;
};

export const getBACAnalysis = (
  drinks: DrinkData[], userProfile: UserProfile, legalLimit: number = HEALTH.LEGAL_BAC_LIMIT
): BACResult => {
  const now = new Date();
  return {
    currentBAC: Math.round(calculateTotalBAC(drinks, userProfile, now) * 1000) / 1000,
    peakBAC: Math.round(findPeakInfo(drinks, userProfile).peakBAC * 1000) / 1000,
    peakTime: findPeakInfo(drinks, userProfile).peakTime,
    zeroTime: findZeroTime(drinks, userProfile),
    safeToDriveTime: findSafeToDriveTime(drinks, userProfile, legalLimit),
    timeline: generateBACTimeline(drinks, userProfile),
  };
};

export const checkLegalLimit = (
  bac: number, limit: number = HEALTH.LEGAL_BAC_LIMIT
): { isAbove: boolean; isNear: boolean } => ({
  isAbove: bac > limit,
  isNear: bac > limit * 0.8 && bac <= limit,
});
