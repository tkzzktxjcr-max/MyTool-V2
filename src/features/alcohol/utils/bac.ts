import { DRINK_TYPES } from '../types';
import type { DrinkType } from '../types';

// Widmark formula constants
// r = distribution ratio (water in body)
// Typical values: male ~0.68, female ~0.55
const BODY_WATER_MALE = 0.68;
const BODY_WATER_FEMALE = 0.55;

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

// Calculate pure alcohol in grams
// Beer: 33cl at 5% = 33 × 0.05 × 0.789 = 1.3g? No!
// 330ml × 5% = 16.5ml pure alcohol
// 16.5ml × 0.789g/ml = 13.0g alcohol
// So for 33cl at 5%: 330 × 0.05 × 0.789 = 13.0g ✓
export const calculateAlcoholGrams = (servingSizeMl: number, abv: number): number => {
  return (servingSizeMl * abv / 100) * 0.789;
};

// Widmark formula: BAC (g/L) = Alcohol (g) / (Weight (kg) × r)
// For 70kg male, r=0.68: BAC = 13g / 47.6L = 0.27 g/L
export const calculateSingleDrinkBAC = (
  drink: { servingSize: number; abv: number },
  userProfile: UserProfile,
  hoursSinceDrink: number
): number => {
  const alcoholGrams = calculateAlcoholGrams(drink.servingSize, drink.abv);
  
  // Default to male ratio if unspecified
  let r = userProfile.sex === 'female' ? BODY_WATER_FEMALE : 
          userProfile.sex === 'male' ? BODY_WATER_MALE : 0.68;
  
  // Widmark formula (NO multiplier!)
  const peakBAC = alcoholGrams / (userProfile.weightKg * r);
  
  // Elimination rate: ~0.015 g/L per hour
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
  
  // Start 2 hours before now to show absorption phase
  const startTime = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const intervalMs = 15 * 60 * 1000;
  const endTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);
  
  for (let time = startTime.getTime(); time <= endTime.getTime(); time += intervalMs) {
    const currentDate = new Date(time);
    let totalBAC = 0;
    
    drinks.forEach(drink => {
      const drinkTime = new Date(drink.timestamp);
      const hoursSince = (currentDate.getTime() - drinkTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursSince >= -0.5) { // Start showing 30min before drink
        totalBAC += calculateSingleDrinkBAC(drink, userProfile, Math.max(0, hoursSince));
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
  
  // Last drink time
  const lastDrinkTime = drinks.reduce((latest, drink) => {
    const drinkTime = new Date(drink.timestamp);
    return drinkTime > latest ? drinkTime : latest;
  }, new Date(0));
  
  // Peak is typically 45-90 min after last drink (using 60 min average)
  const peakTime = new Date(lastDrinkTime.getTime() + 60 * 60 * 1000);
  
  let peakBAC = 0;
  drinks.forEach(drink => {
    const drinkTime = new Date(drink.timestamp);
    const hoursToPeak = (peakTime.getTime() - drinkTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursToPeak >= 0) {
      peakBAC += calculateSingleDrinkBAC(drink, userProfile, hoursToPeak);
    }
  });
  
  return { 
    peakTime, 
    peakBAC: Math.round(peakBAC * 1000) / 1000 
  };
};

export const findZeroTime = (
  drinks: { servingSize: number; abv: number; timestamp: string }[],
  userProfile: UserProfile
): Date => {
  const { peakBAC, peakTime } = findPeakInfo(drinks, userProfile);
  
  if (peakBAC <= 0) return new Date();
  
  // Time to zero BAC = peakBAC / 0.015 (elimination rate per hour)
  const hoursToZero = peakBAC / 0.015;
  
  return new Date(peakTime.getTime() + hoursToZero * 60 * 60 * 1000);
};

export const checkLegalLimit = (
  bac: number,
  limit: number = 0.5
): { isAbove: boolean; isNear: boolean } => {
  return {
    isAbove: bac > limit,
    isNear: bac > limit * 0.8 && bac <= limit,
  };
};