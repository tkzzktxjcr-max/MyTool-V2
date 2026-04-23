// Drink types
export type DrinkType = 'beer' | 'wine' | 'spirit' | 'cocktail' | 'cider' | 'other' | 'custom';

export const DRINK_TYPES: Record<DrinkType, { label: string; defaultAbv: number; icon: string }> = {
  beer: { label: 'Bière', defaultAbv: 5, icon: '🍺' },
  wine: { label: 'Vin', defaultAbv: 12, icon: '🍷' },
  spirit: { label: 'Spiritueux', defaultAbv: 40, icon: '🥃' },
  cocktail: { label: 'Cocktail', defaultAbv: 20, icon: '🍹' },
  cider: { label: 'Cidre', defaultAbv: 5, icon: '🍎' },
  other: { label: 'Autre', defaultAbv: 10, icon: '🥤' },
  custom: { label: 'Personnalisé', defaultAbv: 10, icon: '✨' },
};

// Health guidelines
export const HEALTH_GUIDELINES = {
  maxDailyUnits: 2,
  maxWeeklyUnits: 14,
  maxSingleDrinkUnits: 3,
  recommendedGlassSize: { beer: 33, wine: 12, spirit: 4 },
};

// Mood type
export type MoodType = 'happy' | 'relaxed' | 'social' | 'celebrating' | 'stressed' | 'sad' | 'tired' | 'neutral';

// Alcohol log (consumption record)
export interface AlcoholLog {
  id: string;
  userId: string;
  drinkName: string;
  drinkEmoji: string;
  drinkType: DrinkType;
  quantity: number;
  servingSize: number; // in cl
  abv: number;
  units: number;
  mood?: MoodType;
  timestamp: string;
  notes?: string;
}

// Create drink form
export interface CreateDrinkForm {
  name: string;
  type: DrinkType;
  abv: number;
  defaultServingSize: number;
}

// Alcohol goal
export interface AlcoholGoal {
  id: string;
  userId: string;
  weeklyLimit: number;
  reductionGoal?: number;
  isActive: boolean;
  createdAt: string;
}

// Daily trend data
export interface DailyTrend {
  date: string;
  units: number;
}

// Weekly trend data
export interface WeeklyTrend {
  week: string;
  units: number;
}

// Drink type breakdown
export interface DrinkTypeBreakdown {
  count: number;
  units: number;
}

// Alcohol insight
export interface AlcoholInsight {
  totalWeeklyUnits: number;
  totalMonthlyUnits: number;
  averagePerDay: number;
  dailyTrend: DailyTrend[];
  weeklyTrend: WeeklyTrend[];
  drinkTypeBreakdown: Record<DrinkType, DrinkTypeBreakdown>;
  moodBreakdown: Record<MoodType, number>;
  contextBreakdown: Record<string, number>;
  patterns: string[];
  riskLevel: 'low' | 'moderate' | 'high';
  recommendations: string[];
  weeklyGoalProgress: number;
  streak: number;
}