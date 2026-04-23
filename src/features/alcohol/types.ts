export type DrinkType = 'beer' | 'wine' | 'spirits' | 'cocktail' | 'cider' | 'other';

export const DRINK_TYPES: Record<DrinkType, { label: string; defaultAbv: number; icon: string }> = {
  beer: { label: 'Bière', defaultAbv: 5, icon: '🍺' },
  wine: { label: 'Vin', defaultAbv: 12, icon: '🍷' },
  spirits: { label: 'Spiritueux', defaultAbv: 40, icon: '🥃' },
  cocktail: { label: 'Cocktail', defaultAbv: 20, icon: '🍹' },
  cider: { label: 'Cidre', defaultAbv: 5, icon: '🍎' },
  other: { label: 'Autre', defaultAbv: 10, icon: '🥤' },
};

export const HEALTH_GUIDELINES = {
  maxWeeklyUnits: 14,
  maxDailyUnits: 4,
  lowRiskUnits: 2,
};

export interface AlcoholLog {
  id: string;
  userId: string;
  date: string;
  drinkType: DrinkType;
  volumeCl: number;
  abv: number;
  units: number;
}

export interface CreateAlcoholLogForm {
  drinkType: DrinkType;
  volumeCl: number;
  abv: number;
}

export interface AlcoholInsight {
  totalWeeklyUnits: number;
  totalMonthlyUnits: number;
  averagePerDay: number;
  dailyTrend: { date: string; units: number }[];
  riskLevel: 'low' | 'moderate' | 'high';
  recommendations: string[];
}