/**
 * Centralized Constants - Single source of truth for all app constants
 * Reduces magic numbers and ensures consistency across the codebase
 */

// =============================================================================
// ALCOHOL & BAC CALCULATION CONSTANTS
// =============================================================================

export const ALCOHOL = {
  DENSITY: 0.789, // g/ml at 20°C (ethanol density)
  ELIMINATION_RATE: 0.15, // g/L per hour (average liver metabolism rate)
  PEAK_ABSORPTION_HOURS: 0.75, // ~45 minutes after drink when BAC peaks
  
  // Body water ratios (Widmark's r factor)
  BODY_WATER: {
    male: 0.68,
    female: 0.55,
    unspecified: 0.68,
  } as const,

  // Standard French units (1 unit = 10g of pure alcohol)
  STANDARD_UNIT_GRAMS: 10,
} as const;

// =============================================================================
// HEALTH GUIDELINES (OMS / Santé Publique France recommendations)
// =============================================================================

export const HEALTH = {
  MAX_DAILY_UNITS: 2,
  MAX_WEEKLY_UNITS: 14,
  MAX_SINGLE_DRINK_UNITS: 3,
  
  // Default values
  DEFAULT_WEIGHT_KG: 70,
  LEGAL_BAC_LIMIT: 0.5, // g/L (France default)
} as const;

// =============================================================================
// GOAL PRESETS (Weekly limits based on user's target)
// =============================================================================

export const GOAL_PRESETS = {
  DISCOVER: 21,  // "Je veux juste suivre"
  MODERATE: 14,  // "Boire de manière responsable" (OMS recommended)
  REDUCE: 10,    // "Diminuer progressivement"
  SPORT: 7,      // "Optimiser ma récupération"
  QUIT: 0,       // "Zéro alcool"
} as const;

// =============================================================================
// UI CONSTANTS
// =============================================================================

export const UI = {
  ANIMATION_DURATION: 300, // ms for standard animations
  TOAST_DURATION: 3000,   // ms
  DEBOUNCE_DELAY: 300,     // ms for search inputs
  MAX_RECENT_DRINKS: 4,
  MAX_PAGINATION_ITEMS: 100,
} as const;

// =============================================================================
// TIME OF DAY CATEGORIES
// =============================================================================

export const TIME_LABELS: Record<'morning' | 'afternoon' | 'evening' | 'night', string> = {
  morning: 'le matin',
  afternoon: "l'apres-midi",
  evening: 'le soir',
  night: 'la nuit',
};

export const DRINKS_BY_TIME: Record<'morning' | 'afternoon' | 'evening' | 'night', string[]> = {
  morning: ['beer', 'cider', 'sparkling'],
  afternoon: ['wine', 'beer', 'cider', 'rose_wine'],
  evening: ['wine', 'beer', 'cocktail', 'aperol_spritz', 'rose_wine'],
  night: ['spirit', 'whisky', 'vodka', 'rum', 'cocktail', 'beer'],
};
