/**
 * BAC Calculation Utility
 * Uses Widmark formula for accurate blood alcohol concentration estimation
 * 
 * All sizes are assumed to be in cl (centiliters) by default.
 * Conversion to ml happens internally.
 */

// Physical constants
const ALCOHOL_DENSITY = 0.789; // g/ml
const ELIMINATION_RATE = 0.015; // g/L per hour (average metabolism)
const PEAK_ABSORPTION_HOURS = 1; // Hours after drink when BAC peaks

// Body water ratios (Widmark's r factor)
export const BODY_WATER = {
  male: 0.68,
  female: 0.55,
  unspecified: 0.68, // Default to male ratio
} as const;

export type SexType = 'male' | 'female' | 'unspecified';

export interface UserProfile {
  weightKg: number;
  sex: SexType;
}

export interface DrinkData {
  /** Volume in cl (centiliters) - will be converted to ml internally */
  volumeCl: number;
  /** Alcohol by volume percentage (e.g., 5 for 5%) */
  abv: number;
  /** ISO timestamp string */
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
 * Convert cl to ml (1 cl = 10 ml)
 */
const clToMl = (cl: number): number => cl * 10;

/**
 * Calculate pure alcohol in grams from volume and ABV
 * Formula: volume_ml × (abv/100) × alcohol_density
 */
const calculateAlcoholGrams = (volumeCl: number, abv: number): number => {
  const volumeMl = clToMl(volumeCl);
  return volumeMl * (abv / 100) * ALCOHOL_DENSITY;
};

/**
 * Calculate peak BAC for a single drink using Widmark formula
 * Formula: BAC = alcohol_grams / (weight_kg × r)
 */
const calculatePeakBAC = (
  volumeCl: number,
  abv: number,
  weightKg: number,
  sex: SexType
): number => {
  const alcoholGrams = calculateAlcoholGrams(volumeCl, abv);
  const r = BODY_WATER[sex];
  return alcoholGrams / (weightKg * r);
};

/**
 * Calculate BAC at a specific time after drinking
 * Accounts for the absorption phase (peak at ~1 hour) and elimination
 */
export const calculateBACAtTime = (
  volumeCl: number,
  abv: number,
  weightKg: number,
  sex: SexType,
  hoursSinceDrink: number
): number => {
  const peakBAC = calculatePeakBAC(volumeCl, abv, weightKg, sex);
  
  // During absorption phase (first hour), BAC is rising
  if (hoursSinceDrink < PEAK_ABSORPTION_HOURS) {
    // Linear rise to peak during first hour
    const absorptionFactor = hoursSinceDrink / PEAK_ABSORPTION_HOURS;
    // Also account for early elimination during absorption
    const eliminationDuringAbsorption = ELIMINATION_RATE * hoursSinceDrink * 0.5;
    return Math.max(0, peakBAC * absorptionFactor - eliminationDuringAbsorption);
  }
  
  // Post-absorption: peak BAC minus elimination
  const hoursAfterPeak = hoursSinceDrink - PEAK_ABSORPTION_HOURS;
  const currentBAC = peakBAC - (ELIMINATION_RATE * hoursAfterPeak) - ELIMINATION_RATE * PEAK_ABSORPTION_HOURS;
  
  return Math.max(0, currentBAC);
};

/**
 * Calculate total BAC from multiple drinks at a specific time
 */
export const calculateTotalBAC = (
  drinks: DrinkData[],
  userProfile: UserProfile,
  atTime: Date = new Date()
): number => {
  return drinks.reduce((total, drink) => {
    const drinkTime = new Date(drink.timestamp);
    const hoursSince = (atTime.getTime() - drinkTime.getTime()) / (1000 * 60 * 60);
    
    // Ignore drinks more than 24 hours old or in the future
    if (hoursSince < -0.5 || hoursSince > 24) return total;
    
    return total + calculateBACAtTime(
      drink.volumeCl,
      drink.abv,
      userProfile.weightKg,
      userProfile.sex,
      hoursSince
    );
  }, 0);
};

/**
 * Find the peak BAC and when it occurs from multiple drinks
 */
export const findPeakInfo = (
  drinks: DrinkData[],
  userProfile: UserProfile
): { peakTime: Date; peakBAC: number } => {
  if (drinks.length === 0) {
    return { peakTime: new Date(), peakBAC: 0 };
  }
  
  // Find the latest drink time
  let lastDrinkTime = new Date(0);
  drinks.forEach(drink => {
    const drinkTime = new Date(drink.timestamp);
    if (drinkTime > lastDrinkTime) lastDrinkTime = drinkTime;
  });
  
  // Peak occurs PEAK_ABSORPTION_HOURS after last drink
  const peakTime = new Date(lastDrinkTime.getTime() + PEAK_ABSORPTION_HOURS * 60 * 60 * 1000);
  
  // Calculate total peak BAC from all drinks
  let peakBAC = 0;
  drinks.forEach(drink => {
    const drinkTime = new Date(drink.timestamp);
    const hoursToPeak = (peakTime.getTime() - drinkTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursToPeak >= 0) {
      peakBAC += calculateBACAtTime(
        drink.volumeCl,
        drink.abv,
        userProfile.weightKg,
        userProfile.sex,
        hoursToPeak
      );
    }
  });
  
  return {
    peakTime,
    peakBAC: Math.round(peakBAC * 1000) / 1000,
  };
};

/**
 * Find when BAC will return to zero
 */
export const findZeroTime = (
  drinks: DrinkData[],
  userProfile: UserProfile
): Date => {
  const { peakBAC, peakTime } = findPeakInfo(drinks, userProfile);
  
  if (peakBAC <= 0) return new Date();
  
  // Time to zero = peakBAC / elimination rate
  const hoursToZero = peakBAC / ELIMINATION_RATE;
  
  return new Date(peakTime.getTime() + hoursToZero * 60 * 60 * 1000);
};

/**
 * Find when BAC will be below the legal limit (safe to drive)
 */
export const findSafeToDriveTime = (
  drinks: DrinkData[],
  userProfile: UserProfile,
  legalLimit: number = 0.5
): Date => {
  if (drinks.length === 0) return new Date();
  
  const { peakBAC, peakTime } = findPeakInfo(drinks, userProfile);
  
  // If already below limit, return now
  if (peakBAC <= legalLimit) return new Date();
  
  // Calculate hours needed to reach legal limit from peak
  // BAC at time t after peak = peakBAC - (ELIMINATION_RATE * hours)
  // We need peakBAC - (ELIMINATION_RATE * hours) = legalLimit
  // hours = (peakBAC - legalLimit) / ELIMINATION_RATE
  const hoursToSafe = (peakBAC - legalLimit) / ELIMINATION_RATE;
  
  return new Date(peakTime.getTime() + hoursToSafe * 60 * 60 * 1000);
};

/**
 * Generate a timeline of BAC values for charting
 */
export const generateBACTimeline = (
  drinks: DrinkData[],
  userProfile: UserProfile,
  options: {
    hoursBeforeNow?: number;
    hoursAfterNow?: number;
    intervalMinutes?: number;
  } = {}
): BACDataPoint[] => {
  const {
    hoursBeforeNow = 2,
    hoursAfterNow = 12,
    intervalMinutes = 15,
  } = options;
  
  const now = new Date();
  const timeline: BACDataPoint[] = [];
  
  const startTime = new Date(now.getTime() - hoursBeforeNow * 60 * 60 * 1000);
  const endTime = new Date(now.getTime() + hoursAfterNow * 60 * 60 * 1000);
  const intervalMs = intervalMinutes * 60 * 1000;
  
  for (let time = startTime.getTime(); time <= endTime.getTime(); time += intervalMs) {
    const currentDate = new Date(time);
    const bac = calculateTotalBAC(drinks, userProfile, currentDate);
    
    timeline.push({
      time: currentDate,
      bac: Math.round(bac * 1000) / 1000,
      isPast: time < now.getTime(),
    });
  }
  
  return timeline;
};

/**
 * Get complete BAC analysis
 */
export const getBACAnalysis = (
  drinks: DrinkData[],
  userProfile: UserProfile,
  legalLimit: number = 0.5
): BACResult => {
  const now = new Date();
  const currentBAC = calculateTotalBAC(drinks, userProfile, now);
  const { peakTime, peakBAC } = findPeakInfo(drinks, userProfile);
  const zeroTime = findZeroTime(drinks, userProfile);
  const safeToDriveTime = findSafeToDriveTime(drinks, userProfile, legalLimit);
  const timeline = generateBACTimeline(drinks, userProfile);
  
  return {
    currentBAC: Math.round(currentBAC * 1000) / 1000,
    peakBAC: Math.round(peakBAC * 1000) / 1000,
    peakTime,
    zeroTime,
    safeToDriveTime,
    timeline,
  };
};

/**
 * Check if BAC is above or near legal limit
 */
export const checkLegalLimit = (
  bac: number,
  limit: number = 0.5
): { isAbove: boolean; isNear: boolean } => ({
  isAbove: bac > limit,
  isNear: bac > limit * 0.8 && bac <= limit,
});

/**
 * Quick validation: how many standard drinks to reach a target BAC
 */
export const drinksToReachBAC = (
  targetBAC: number,
  abv: number = 5,
  weightKg: number = 70,
  sex: SexType = 'unspecified'
): number => {
  const peakBAC = calculatePeakBAC(33, abv, weightKg, sex); // 33cl standard drink
  return Math.ceil(targetBAC / peakBAC);
};