// Drink types
export type DrinkType = 
  | 'beer' | 'wine' | 'spirit' | 'cocktail' | 'cider' | 'other' | 'custom'
  | 'lager' | 'pilsner' | 'stout' | 'wheat_beer' | 'ipa' | 'ale'
  | 'red_wine' | 'white_wine' | 'rose_wine' | 'champagne' | 'sparkling'
  | 'whisky' | 'vodka' | 'rum' | 'tequila' | 'gin' | 'brandy' | 'cognac' | 'calvados'
  | 'martini' | 'mojito' | 'margarita' | 'old_fashioned' | 'cosmopolitan' | 'daiquiri' | 'pina_colada' | 'aperol_spritz'
  | 'sake' | 'soju' | 'sangria' | 'sherry' | 'port';

export const DRINK_TYPES: Record<DrinkType, { label: string; defaultAbv: number; icon: string }> = {
  beer: { label: 'Biere', defaultAbv: 5, icon: '🍺' },
  wine: { label: 'Vin', defaultAbv: 12, icon: '🍷' },
  spirit: { label: 'Spiritueux', defaultAbv: 40, icon: '🥃' },
  cocktail: { label: 'Cocktail', defaultAbv: 20, icon: '🍹' },
  cider: { label: 'Cidre', defaultAbv: 5, icon: '🍎' },
  other: { label: 'Autre', defaultAbv: 10, icon: '🥤' },
  custom: { label: 'Personnalise', defaultAbv: 10, icon: '✨' },
  lager: { label: 'Lager', defaultAbv: 5, icon: '🍺' },
  pilsner: { label: 'Pilsner', defaultAbv: 5, icon: '🍺' },
  stout: { label: 'Stout', defaultAbv: 7, icon: '🖤' },
  wheat_beer: { label: 'Blanche', defaultAbv: 5, icon: '🍺' },
  ipa: { label: 'IPA', defaultAbv: 6.5, icon: '🍺' },
  ale: { label: 'Ale', defaultAbv: 5.5, icon: '🍺' },
  red_wine: { label: 'Vin Rouge', defaultAbv: 13, icon: '🍷' },
  white_wine: { label: 'Vin Blanc', defaultAbv: 12, icon: '🥂' },
  rose_wine: { label: 'Rose', defaultAbv: 12.5, icon: '🌸' },
  champagne: { label: 'Champagne', defaultAbv: 12, icon: '🍾' },
  sparkling: { label: 'Effervescent', defaultAbv: 11, icon: '🥂' },
  whisky: { label: 'Whisky', defaultAbv: 40, icon: '🥃' },
  vodka: { label: 'Vodka', defaultAbv: 40, icon: '💧' },
  rum: { label: 'Rhum', defaultAbv: 40, icon: '🏝️' },
  tequila: { label: 'Tequila', defaultAbv: 40, icon: '🌵' },
  gin: { label: 'Gin', defaultAbv: 40, icon: '🌿' },
  brandy: { label: 'Brandy', defaultAbv: 40, icon: '🥃' },
  cognac: { label: 'Cognac', defaultAbv: 40, icon: '🏰' },
  calvados: { label: 'Calvados', defaultAbv: 40, icon: '🍎' },
  martini: { label: 'Martini', defaultAbv: 25, icon: '🍸' },
  mojito: { label: 'Mojito', defaultAbv: 15, icon: '🍹' },
  margarita: { label: 'Margarita', defaultAbv: 20, icon: '🍹' },
  old_fashioned: { label: 'Old Fashioned', defaultAbv: 35, icon: '🥃' },
  cosmopolitan: { label: 'Cosmopolitan', defaultAbv: 20, icon: '🍸' },
  daiquiri: { label: 'Daiquiri', defaultAbv: 15, icon: '🍹' },
  pina_colada: { label: 'Pina Colada', defaultAbv: 15, icon: '🍍' },
  aperol_spritz: { label: 'Aperol Spritz', defaultAbv: 11, icon: '🍊' },
  sake: { label: 'Sake', defaultAbv: 15, icon: '🍶' },
  soju: { label: 'Soju', defaultAbv: 20, icon: '🥃' },
  sangria: { label: 'Sangria', defaultAbv: 10, icon: '🍷' },
  sherry: { label: 'Sherry', defaultAbv: 17, icon: '🍷' },
  port: { label: 'Porto', defaultAbv: 20, icon: '🍷' },
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