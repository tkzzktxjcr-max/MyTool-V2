import { DRINK_TYPES } from '../types';
import type { DrinkType } from '../types';

// Widmark formula constants
const BODY_WATER_MALE = 0.58;
const BODY_WATER_FEMALE = 0.49;
const ALCOHOL_DENSITY = 0.789;

export interface UserProfile {
  weightKg: number;
  sex: 'male' | 'female' | 'unspecified';
}

export interface BACDataPoint {
  time: Date;
  bac: number;
  isPast: boolean;
}

export interface BACState {
  currentBAC: number;
  peakBAC: number;
  peakTime: Date;
  zeroTime: Date;
  timeline: BACDataPoint[];
  isAboveLimit: boolean;
  isNearLimit: boolean;
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  weightKg: 70,
  sex: 'unspecified',
};

export const calculateAlcoholGrams = (servingSizeMl: number, abv: number): number => {
  return (servingSizeMl * abv / 100) * ALCOHOL_DENSITY;
};

export const calculateSingleDrinkBAC = (
  drink: { servingSize: number; abv: number },
  userProfile: UserProfile,
  hoursSinceDrink: number
): number => {
  const alcoholGrams = calculateAlcoholGrams(drink.servingSize, drink.abv);
  const bodyWater = userProfile.sex === 'female' ? BODY_WATER_FEMALE : 
                   userProfile.sex === 'male' ? BODY_WATER_MALE : 0.68;
  const peakBAC = (alcoholGrams / (userProfile.weightKg * bodyWater)) * 10;
  const currentBAC = Math.max(0, peakBAC - (0.015 * hoursSinceDrink));
  return currentBAC;
};

export const calculateTotalBAC = (
  drinks: { servingSize: number; abv: number; timestamp: string }[],
  userProfile: UserProfile
): number => {
  const now = new Date();
  return drinks.reduce((total, drink) => {
    const hoursSince = (now.getTime() - new Date(drink.timestamp).getTime()) / (1000 * 60 * 60);
    if (hoursSince < 0) return total;
    return total + calculateSingleDrinkBAC(drink, userProfile, hoursSince);
  }, 0);
};

export const generateBACTimeline = (
  drinks: { servingSize: number; abv: number; timestamp: string }[],
  userProfile: UserProfile,
  hoursAhead: number = 12
): BACDataPoint[] => {
  const now = new Date();
  const timeline: BACDataPoint[] = [];
  const startTime = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const intervalMs = 15 * 60 * 1000;
  const endTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);
  
  for (let time = startTime.getTime(); time <= endTime.getTime(); time += intervalMs) {
    const currentDate = new Date(time);
    let totalBAC = 0;
    drinks.forEach(drink => {
      const drinkHoursSince = (currentDate.getTime() - new Date(drink.timestamp).getTime()) / (1000 * 60 * 60);
      if (drinkHoursSince >= 0) {
        const alcoholGrams = calculateAlcoholGrams(drink.servingSize, drink.abv);
        const bodyWater = userProfile.sex === 'female' ? BODY_WATER_FEMALE : 
                         userProfile.sex === 'male' ? BODY_WATER_MALE : 0.68;
        const peakBAC = (alcoholGrams / (userProfile.weightKg * bodyWater)) * 10;
        const currentBAC = Math.max(0, peakBAC - (0.015 * drinkHoursSince));
        totalBAC += currentBAC;
      }
    });
    timeline.push({
      time: currentDate,
      bac: Math.round(totalBAC * 1000) / 1000,
      isPast: time < now.getTime(),
    });
  }
  return timeline;
};

export const findPeakInfo = (
  drinks: { servingSize: number; abv: number; timestamp: string }[],
  userProfile: UserProfile
): { peakTime: Date; peakBAC: number } => {
  if (drinks.length === 0) return { peakTime: new Date(), peakBAC: 0 };
  const lastDrinkTime = drinks.reduce((latest, drink) => {
    const drinkTime = new Date(drink.timestamp);
    return drinkTime > latest ? drinkTime : latest;
  }, new Date(0));
  const peakTime = new Date(lastDrinkTime.getTime() + 45 * 60 * 1000);
  let peakBAC = 0;
  drinks.forEach(drink => {
    const hoursToPeak = (peakTime.getTime() - new Date(drink.timestamp).getTime()) / (1000 * 60 * 60);
    if (hoursToPeak >= 0) {
      const alcoholGrams = calculateAlcoholGrams(drink.servingSize, drink.abv);
      const bodyWater = userProfile.sex === 'female' ? BODY_WATER_FEMALE : 
                       userProfile.sex === 'male' ? BODY_WATER_MALE : 0.68;
      const drinkPeakBAC = (alcoholGrams / (userProfile.weightKg * bodyWater)) * 10;
      const bacAtPeak = Math.max(0, drinkPeakBAC - (0.015 * hoursToPeak));
      peakBAC += bacAtPeak;
    }
  });
  return { peakTime, peakBAC: Math.round(peakBAC * 1000) / 1000 };
};

export const findZeroTime = (
  drinks: { servingSize: number; abv: number; timestamp: string }[],
  userProfile: UserProfile
): Date => {
  const timeline = generateBACTimeline(drinks, userProfile, 24);
  for (let i = timeline.length - 1; i >= 0; i--) {
    if (timeline[i].bac > 0) {
      return timeline[i + 1]?.time || timeline[i].time;
    }
  }
  return new Date();
};

export const checkLegalLimit = (
  bac: number,
  limit: number = 0.05
): { isAbove: boolean; isNear: boolean } => {
  return {
    isAbove: bac > limit,
    isNear: bac > limit * 0.8 && bac <= limit,
  };
};