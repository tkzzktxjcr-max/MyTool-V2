/**
 * BAC Calculation Utility
 * Uses Widmark formula for accurate blood alcohol concentration estimation
 * 
 * REFERENCES:
 * - Widmark, E. M. P. (1932). "Die theoretischen Grundlagen der gerichtsmedizinischen Blutalkoholbestimmung"
 * - OMS Guidelines on Alcohol and Health (2018)
 * 
 * COEFFICIENTS (r) - Widmark's r factor:
 * - Male: r = 0.68 (68% du poids = eau corporelle)
 * - Female: r = 0.55 (55% du poids = eau corporelle)
 * 
 * STANDARD FRENCH UNITS:
 * - 1 unité = 10g d'alcool pur
 * - Conversion: Volume cl × Degré × 0.0789 = unités
 */

// Physical constants
export const ALCOHOL_DENSITY = 0.789; // g/ml
export const ELIMINATION_RATE = 0.15; // g/L per hour (average liver metabolism rate)
export const PEAK_ABSORPTION_HOURS = 0.75; // ~45 minutes after drink when BAC peaks

// Body water ratios (Widmark's r factor)
export const BODY_WATER = {
  male: 0.68,
  female: 0.55,
  unspecified: 0.68,
} as const;

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
 * 
 * Formula: grams = (volumeCl × 10) × (abv / 100) × alcoholDensity
 * 
 * Example: 25cl beer at 5% = (250ml × 0.05 × 0.789) = 9.86g = ~1 unité
 */
export const calculateAlcoholGrams = (volumeCl: number, abv: number): number => {
  const volumeMl = volumeCl * 10; // cl → ml conversion
  return volumeMl * (abv / 100) * ALCOHOL_DENSITY;
};

/**
 * Calculate peak BAC for a single drink using Widmark formula
 * 
 * BAC = (alcoholGrams) / (weightKg × r)
 * 
 * r = Widmark factor (0.68 for male, 0.55 for female)
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
 * 
 * Uses Widmark formula with:
 * - Absorption phase: ~45 minutes (BAC rising)
 * - Post-absorption: peak BAC - (elimination rate × hours since peak)
 */
export const calculateBACAtTime = (
  volumeCl: number,
  abv: number,
  weightKg: number,
  sex: SexType,
  hoursSinceDrink: number
): number => {
  const peakBAC = calculatePeakBAC(volumeCl, abv, weightKg, sex);
  
  // During absorption phase, BAC is rising
  if (hoursSinceDrink < PEAK_ABSORPTION_HOURS) {
    const absorptionFactor = hoursSinceDrink / PEAK_ABSORPTION_HOURS;
    return peakBAC * absorptionFactor;
  }
  
  // Post-absorption: peak BAC minus elimination
  const hoursAfterPeak = hoursSinceDrink - PEAK_ABSORPTION_HOURS;
  const currentBAC = peakBAC - (ELIMINATION_RATE * hoursAfterPeak);
  
  return Math.max(0, currentBAC);
};

/**
 * Calculate total BAC from multiple drinks at a specific time
 * 
 * Sums BAC contributions from all drinks.
 * Ignores drinks more than 24h old or in the future (> -0.5h).
 */
export const calculateTotalBAC = (
  drinks: DrinkData[],
  userProfile: UserProfile,
  atTime: Date = new Date()
): number => {
  return drinks.reduce((total, drink) => {
    const drinkTime = new Date(drink.timestamp);
    const hoursSince = (atTime.getTime() - drinkTime.getTime()) / (1000 * 60 * 60);
    
    // Ignore drinks from >24h ago or in the future
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
 * 
 * Peak occurs ~45 min after the last drink.
 */
export const findPeakInfo = (
  drinks: DrinkData[],
  userProfile: UserProfile
): { peakTime: Date; peakBAC: number } => {
  if (drinks.length === 0) {
    return { peakTime: new Date(), peakBAC: 0 };
  }
  
  // Find the last drink time
  let lastDrinkTime = new Date(0);
  drinks.forEach(drink => {
    const drinkTime = new Date(drink.timestamp);
    if (drinkTime > lastDrinkTime) lastDrinkTime = drinkTime;
  });
  
  // Peak is ~45 min after last drink
  const peakTime = new Date(lastDrinkTime.getTime() + PEAK_ABSORPTION_HOURS * 60 * 60 * 1000);
  
  // Sum BAC contributions at peak time
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
 * 
 * zeroTime = peakTime + (peakBAC / eliminationRate)
 * 
 * @param drinks - Array of drinks
 * @param userProfile - User profile with weight and sex
 * @returns Date when BAC will be zero
 */
export const findZeroTime = (
  drinks: DrinkData[],
  userProfile: UserProfile
): Date => {
  const { peakBAC, peakTime } = findPeakInfo(drinks, userProfile);
  
  if (peakBAC <= 0) return new Date();
  
  // hoursToZero = peakBAC / eliminationRate (g/L per hour)
  const hoursToZero = peakBAC / ELIMINATION_RATE;
  
  return new Date(peakTime.getTime() + hoursToZero * 60 * 60 * 1000);
};

/**
 * Find when BAC will be below the legal limit (safe to drive)
 * 
 * @param drinks - Array of drinks
 * @param userProfile - User profile with weight and sex
 * @param legalLimit - Legal BAC limit (default 0.5 g/L for France)
 * @returns Date when BAC will be safe to drive
 */
export const findSafeToDriveTime = (
  drinks: DrinkData[],
  userProfile: UserProfile,
  legalLimit: number = 0.5
): Date => {
  if (drinks.length === 0) return new Date();
  
  const { peakBAC, peakTime } = findPeakInfo(drinks, userProfile);
  
  if (peakBAC <= legalLimit) return new Date(); // Already safe
  
  // hoursToSafe = (peakBAC - legalLimit) / eliminationRate
  const hoursToSafe = (peakBAC - legalLimit) / ELIMINATION_RATE;
  
  return new Date(peakTime.getTime() + hoursToSafe * 60 * 60 * 1000);
};

/**
 * Generate a timeline of BAC values for charting
 * 
 * @param drinks - Array of drinks
 * @param userProfile - User profile with weight and sex
 * @param options - Timeline configuration
 * @returns Array of BAC data points
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
 * 
 * @param drinks - Array of drinks
 * @param userProfile - User profile with weight and sex
 * @param legalLimit - Legal BAC limit (default 0.5 g/L)
 * @returns Complete BAC analysis result
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
 * 
 * @param bac - Current BAC
 * @param limit - Legal limit (default 0.5 g/L)
 * @returns Object with isAbove and isNear flags
 */
export const checkLegalLimit = (
  bac: number,
  limit: number = 0.5
): { isAbove: boolean; isNear: boolean } => ({
  isAbove: bac > limit,
  isNear: bac > limit * 0.8 && bac <= limit,
});

// =============================================================================
// VALIDATION / DEBUG FUNCTIONS
// =============================================================================

/**
 * Validate BAC calculation consistency
 * Use for debugging and testing
 */
export const validateBACCalculations = (
  drinks: DrinkData[],
  userProfile: UserProfile
): {
  isValid: boolean;
  errors: string[];
  debug: {
    totalAlcoholGrams: number;
    estimatedPeakBAC: number;
    estimatedZeroTime: string;
    drinkCount: number;
  };
} => {
  const errors: string[] = [];
  
  // Check for invalid inputs
  if (userProfile.weightKg <= 0 || userProfile.weightKg > 300) {
    errors.push(`Invalid weight: ${userProfile.weightKg}`);
  }
  
  // Check drinks
  drinks.forEach((drink, i) => {
    if (drink.volumeCl <= 0 || drink.volumeCl > 200) {
      errors.push(`Invalid volume for drink ${i}: ${drink.volumeCl}`);
    }
    if (drink.abv <= 0 || drink.abv > 100) {
      errors.push(`Invalid ABV for drink ${i}: ${drink.abv}`);
    }
  });
  
  // Calculate debug info
  const totalAlcoholGrams = drinks.reduce((sum, d) => sum + calculateAlcoholGrams(d.volumeCl, d.abv), 0);
  const { peakTime, peakBAC } = findPeakInfo(drinks, userProfile);
  
  return {
    isValid: errors.length === 0,
    errors,
    debug: {
      totalAlcoholGrams: Math.round(totalAlcoholGrams * 10) / 10,
      estimatedPeakBAC: peakBAC,
      estimatedZeroTime: findZeroTime(drinks, userProfile).toISOString(),
      drinkCount: drinks.length,
    },
  };
};