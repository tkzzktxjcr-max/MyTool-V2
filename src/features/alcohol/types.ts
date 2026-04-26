// Drink types - Now uses icon names that map to Lucide icons
export type DrinkType = 
  | 'beer' | 'wine' | 'spirit' | 'cocktail' | 'cider' | 'other' | 'custom'
  | 'lager' | 'pilsner' | 'stout' | 'wheat_beer' | 'ipa' | 'ale'
  | 'red_wine' | 'white_wine' | 'rose_wine' | 'champagne' | 'sparkling'
  | 'whisky' | 'vodka' | 'rum' | 'tequila' | 'gin' | 'brandy' | 'cognac' | 'calvados'
  | 'martini' | 'mojito' | 'margarita' | 'old_fashioned' | 'cosmopolitan' | 'daiquiri' | 'pina_colada' | 'aperol_spritz'
  | 'sake' | 'soju' | 'sangria' | 'sherry' | 'port';

// Drink type configuration - icon names map to Lucide icons
export const DRINK_TYPES: Record<DrinkType, { label: string; defaultAbv: number; icon: string }> = {
  beer: { label: 'Bière', defaultAbv: 5, icon: 'Beer' },
  wine: { label: 'Vin', defaultAbv: 12, icon: 'Wine' },
  spirit: { label: 'Spiritueux', defaultAbv: 40, icon: 'Whisky' },
  cocktail: { label: 'Cocktail', defaultAbv: 20, icon: 'Cocktail' },
  cider: { label: 'Cidre', defaultAbv: 5, icon: 'Apple' },
  other: { label: 'Autre', defaultAbv: 10, icon: 'CupSoda' },
  custom: { label: 'Personnalisé', defaultAbv: 10, icon: 'Sparkles' },
  lager: { label: 'Lager', defaultAbv: 5, icon: 'Beer' },
  pilsner: { label: 'Pilsner', defaultAbv: 5, icon: 'Beer' },
  stout: { label: 'Stout', defaultAbv: 7, icon: 'BeerOff' },
  wheat_beer: { label: 'Blanche', defaultAbv: 5, icon: 'Beer' },
  ipa: { label: 'IPA', defaultAbv: 6.5, icon: 'Beer' },
  ale: { label: 'Ale', defaultAbv: 5.5, icon: 'Beer' },
  red_wine: { label: 'Vin Rouge', defaultAbv: 13, icon: 'Wine' },
  white_wine: { label: 'Vin Blanc', defaultAbv: 12, icon: 'Wine' },
  rose_wine: { label: 'Rosé', defaultAbv: 12.5, icon: 'Wine' },
  champagne: { label: 'Champagne', defaultAbv: 12, icon: 'Champagne' },
  sparkling: { label: 'Effervescent', defaultAbv: 11, icon: 'Champagne' },
  whisky: { label: 'Whisky', defaultAbv: 40, icon: 'Whisky' },
  vodka: { label: 'Vodka', defaultAbv: 40, icon: 'GlassWater' },
  rum: { label: 'Rhum', defaultAbv: 40, icon: 'GlassWater' },
  tequila: { label: 'Tequila', defaultAbv: 40, icon: 'Whisky' },
  gin: { label: 'Gin', defaultAbv: 40, icon: 'GlassWater' },
  brandy: { label: 'Brandy', defaultAbv: 40, icon: 'Whisky' },
  cognac: { label: 'Cognac', defaultAbv: 40, icon: 'Whisky' },
  calvados: { label: 'Calvados', defaultAbv: 40, icon: 'Apple' },
  martini: { label: 'Martini', defaultAbv: 25, icon: 'Cocktail' },
  mojito: { label: 'Mojito', defaultAbv: 15, icon: 'Cocktail' },
  margarita: { label: 'Margarita', defaultAbv: 20, icon: 'Cocktail' },
  old_fashioned: { label: 'Old Fashioned', defaultAbv: 35, icon: 'Cocktail' },
  cosmopolitan: { label: 'Cosmopolitan', defaultAbv: 20, icon: 'Cocktail' },
  daiquiri: { label: 'Daiquiri', defaultAbv: 15, icon: 'Cocktail' },
  pina_colada: { label: 'Pina Colada', defaultAbv: 15, icon: 'Cocktail' },
  aperol_spritz: { label: 'Aperol Spritz', defaultAbv: 11, icon: 'Champagne' },
  sake: { label: 'Sake', defaultAbv: 15, icon: 'CupSoda' },
  soju: { label: 'Soju', defaultAbv: 20, icon: 'GlassWater' },
  sangria: { label: 'Sangria', defaultAbv: 10, icon: 'Wine' },
  sherry: { label: 'Sherry', defaultAbv: 17, icon: 'Wine' },
  port: { label: 'Porto', defaultAbv: 20, icon: 'Wine' },
};

export const HEALTH_GUIDELINES = {
  maxDailyUnits: 2,
  maxWeeklyUnits: 14,
  maxSingleDrinkUnits: 3,
};

export type MoodType = 'happy' | 'relaxed' | 'social' | 'celebrating' | 'stressed' | 'sad' | 'tired' | 'neutral';

export interface AlcoholLog {
  id: string;
  userId: string;
  drinkName: string;
  drinkEmoji: string; // Kept for display purposes in logs
  drinkType: DrinkType;
  quantity: number;
  servingSize: number;
  abv: number;
  units: number;
  mood?: MoodType;
  timestamp: string;
  notes?: string;
}

export interface CreateDrinkForm {
  name: string;
  type: DrinkType;
  abv: number;
  defaultServingSize: number;
  country?: string;
}

export interface AlcoholGoal {
  id: string;
  userId: string;
  weeklyLimit: number;
  reductionGoal?: number;
  isActive: boolean;
  createdAt: string;
}

export interface DailyTrend {
  date: string;
  units: number;
}

export interface WeeklyTrend {
  week: string;
  units: number;
}

export interface DrinkTypeBreakdown {
  count: number;
  units: number;
}

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