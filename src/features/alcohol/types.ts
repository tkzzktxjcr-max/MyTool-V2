// Drink types
export type DrinkType = 'beer' | 'wine' | 'spirit' | 'cocktail' | 'cider' | 'other';

export const DRINK_TYPES: Record<DrinkType, { label: string; defaultAbv: number; icon: string }> = {
  beer: { label: 'Bière', defaultAbv: 5, icon: '🍺' },
  wine: { label: 'Vin', defaultAbv: 12, icon: '🍷' },
  spirit: { label: 'Spiritueux', defaultAbv: 40, icon: '🥃' },
  cocktail: { label: 'Cocktail', defaultAbv: 20, icon: '🍹' },
  cider: { label: 'Cidre', defaultAbv: 5, icon: '🍎' },
  other: { label: 'Autre', defaultAbv: 10, icon: '🥤' },
};

// Mood types
export type MoodType = 'happy' | 'relaxed' | 'social' | 'celebrating' | 'stressed' | 'sad' | 'tired' | 'neutral';

export const MOOD_TYPES: Record<MoodType, { label: string; emoji: string }> = {
  happy: { label: 'Joyeux', emoji: '😊' },
  relaxed: { label: 'Détendu', emoji: '😌' },
  social: { label: 'Social', emoji: '🥂' },
  celebrating: { label: 'Fête', emoji: '🎉' },
  stressed: { label: 'Stressé', emoji: '😰' },
  sad: { label: 'Triste', emoji: '😢' },
  tired: { label: 'Fatigué', emoji: '😴' },
  neutral: { label: 'Neutre', emoji: '😐' },
};

// Health guidelines (WHO recommendations)
export const HEALTH_GUIDELINES = {
  maxWeeklyUnits: 14,
  maxDailyUnits: 4,
  lowRiskUnits: 2,
};

// Custom drink interface
export interface CustomDrink {
  id: string;
  userId: string;
  name: string;
  type: DrinkType;
  abv: number;
  defaultServingSize: number;
  emoji?: string;
  isFavorite: boolean;
  usageCount: number;
  createdAt: string;
}

// Drink log entry
export interface AlcoholLog {
  id: string;
  userId: string;
  drinkId?: string;
  drinkName: string;
  drinkEmoji: string;
  drinkType: DrinkType;
  quantity: number;
  servingSize: number;
  abv: number;
  units: number;
  mood?: MoodType;
  timestamp: string;
  notes?: string;
}

// Goals
export interface AlcoholGoal {
  id: string;
  userId: string;
  weeklyLimit: number; // in units
  reductionGoal?: number; // percentage to reduce
  isActive: boolean;
  createdAt: string;
}

// Insights
export interface AlcoholInsight {
  totalWeeklyUnits: number;
  totalMonthlyUnits: number;
  averagePerDay: number;
  dailyTrend: { date: string; units: number }[];
  weeklyTrend: { week: string; units: number }[];
  drinkTypeBreakdown: Record<DrinkType, { count: number; units: number }>;
  moodBreakdown: Record<MoodType, number>;
  contextBreakdown: Record<string, number>;
  patterns: string[];
  riskLevel: 'low' | 'moderate' | 'high';
  recommendations: string[];
  weeklyGoalProgress: number;
  streak: number;
}

// Create drink form
export interface CreateDrinkForm {
  name: string;
  type: DrinkType;
  abv: number;
  defaultServingSize: number;
  emoji?: string;
}