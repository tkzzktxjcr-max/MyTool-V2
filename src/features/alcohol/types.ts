// Drink types
export type DrinkType = 
  // Defaults
  | 'beer' | 'wine' | 'spirit' | 'cocktail' | 'cider' | 'other' | 'custom'
  // International beers
  | 'lager' | 'pilsner' | 'stout' | 'wheat_beer' | 'ipa' | 'ale'
  // International wines
  | 'red_wine' | 'white_wine' | 'rose_wine' | 'champagne' | 'sparkling'
  // International spirits
  | 'whisky' | 'vodka' | 'rum' | 'tequila' | 'gin' | 'brandy' | 'cognac' | 'calvados'
  // Cocktails
  | 'martini' | 'mojito' | 'margarita' | 'old_fashioned' | 'cosmopolitan' | 'daiquiri' | 'pina_colada' | 'aperol_spritz'
  // Regional
  | 'sake' | 'soju' | 'sangria' | 'sherry' | 'port';

// Country codes (ISO 3166-1 alpha-2)
export type CountryCode = 
  | 'FR' | 'GB' | 'DE' | 'IT' | 'ES' | 'PT' | 'NL' | 'BE' | 'IE' | 'IE'  // Europe
  | 'US' | 'CA' | 'MX' | 'CU' | 'PR' | 'BR' | 'AR' | 'CL'               // Americas
  | 'JP' | 'KR' | 'CN' | 'TH'                                           // Asia
  | 'RU' | 'UA' | 'GR';                                                  // Russia/Ukraine/Greece

// Country names with flags
export const COUNTRIES: Record<CountryCode, { name: string; flag: string }> = {
  FR: { name: 'France', flag: '🇫🇷' },
  GB: { name: 'Royaume-Uni', flag: '🇬🇧' },
  DE: { name: 'Allemagne', flag: '🇩🇪' },
  IT: { name: 'Italie', flag: '🇮🇹' },
  ES: { name: 'Espagne', flag: '🇪🇸' },
  PT: { name: 'Portugal', flag: '🇵🇹' },
  NL: { name: 'Pays-Bas', flag: '🇳🇱' },
  BE: { name: 'Belgique', flag: '🇧🇪' },
  IE: { name: 'Irlande', flag: '🇮🇪' },
  US: { name: 'États-Unis', flag: '🇺🇸' },
  CA: { name: 'Canada', flag: '🇨🇦' },
  MX: { name: 'Mexique', flag: '🇲🇽' },
  CU: { name: 'Cuba', flag: '🇨🇺' },
  PR: { name: 'Puerto Rico', flag: '🇵🇷' },
  BR: { name: 'Brésil', flag: '🇧🇷' },
  AR: { name: 'Argentine', flag: '🇦🇷' },
  CL: { name: 'Chili', flag: '🇨🇱' },
  JP: { name: 'Japon', flag: '🇯🇵' },
  KR: { name: 'Corée du Sud', flag: '🇰🇷' },
  CN: { name: 'Chine', flag: '🇨🇳' },
  TH: { name: 'Thaïlande', flag: '🇹🇭' },
  RU: { name: 'Russie', flag: '🇷🇺' },
  UA: { name: 'Ukraine', flag: '🇺🇦' },
  GR: { name: 'Grèce', flag: '🇬🇷' },
};

export const DRINK_TYPES: Record<DrinkType, { label: string; defaultAbv: number; icon: string; defaultCountry?: CountryCode }> = {
  // Base categories
  beer: { label: 'Bière', defaultAbv: 5, icon: '🍺' },
  wine: { label: 'Vin', defaultAbv: 12, icon: '🍷' },
  spirit: { label: 'Spiritueux', defaultAbv: 40, icon: '🥃' },
  cocktail: { label: 'Cocktail', defaultAbv: 20, icon: '🍹' },
  cider: { label: 'Cidre', defaultAbv: 5, icon: '🍎' },
  other: { label: 'Autre', defaultAbv: 10, icon: '🥤' },
  custom: { label: 'Personnalisé', defaultAbv: 10, icon: '✨' },

  // International Beers
  lager: { label: 'Lager', defaultAbv: 5, icon: '🍺' },
  pilsner: { label: 'Pilsner', defaultAbv: 5, icon: '🍺' },
  stout: { label: 'Stout', defaultAbv: 7, icon: '🖤' },
  wheat_beer: { label: 'Blanche', defaultAbv: 5, icon: '🍺' },
  ipa: { label: 'IPA', defaultAbv: 6.5, icon: '🍺' },
  ale: { label: 'Ale', defaultAbv: 5.5, icon: '🍺' },

  // International Wines
  red_wine: { label: 'Vin Rouge', defaultAbv: 13, icon: '🍷' },
  white_wine: { label: 'Vin Blanc', defaultAbv: 12, icon: '🥂' },
  rose_wine: { label: 'Rosé', defaultAbv: 12.5, icon: '🌸' },
  champagne: { label: 'Champagne', defaultAbv: 12, icon: '🍾', defaultCountry: 'FR' },
  sparkling: { label: 'Effervescent', defaultAbv: 11, icon: '🥂' },

  // International Spirits
  whisky: { label: 'Whisky', defaultAbv: 40, icon: '🥃' },
  vodka: { label: 'Vodka', defaultAbv: 40, icon: '💧', defaultCountry: 'RU' },
  rum: { label: 'Rhum', defaultAbv: 40, icon: '🏝️', defaultCountry: 'CU' },
  tequila: { label: 'Tequila', defaultAbv: 40, icon: '🌵', defaultCountry: 'MX' },
  gin: { label: 'Gin', defaultAbv: 40, icon: '🌿', defaultCountry: 'GB' },
  brandy: { label: 'Brandy', defaultAbv: 40, icon: '🥃' },
  cognac: { label: 'Cognac', defaultAbv: 40, icon: '🏰', defaultCountry: 'FR' },
  calvados: { label: 'Calvados', defaultAbv: 40, icon: '🍎', defaultCountry: 'FR' },

  // Popular Cocktails
  martini: { label: 'Martini', defaultAbv: 25, icon: '🍸', defaultCountry: 'IT' },
  mojito: { label: 'Mojito', defaultAbv: 15, icon: '🍹', defaultCountry: 'CU' },
  margarita: { label: 'Margarita', defaultAbv: 20, icon: '🍹', defaultCountry: 'MX' },
  old_fashioned: { label: 'Old Fashioned', defaultAbv: 35, icon: '🥃', defaultCountry: 'US' },
  cosmopolitan: { label: 'Cosmopolitan', defaultAbv: 20, icon: '🍸', defaultCountry: 'US' },
  daiquiri: { label: 'Daiquiri', defaultAbv: 15, icon: '🍹', defaultCountry: 'CU' },
  pina_colada: { label: 'Piña Colada', defaultAbv: 15, icon: '🍍', defaultCountry: 'PR' },
  aperol_spritz: { label: 'Aperol Spritz', defaultAbv: 11, icon: '🍊', defaultCountry: 'IT' },

  // Regional Specialties
  sake: { label: 'Saké', defaultAbv: 15, icon: '🍶', defaultCountry: 'JP' },
  soju: { label: 'Soju', defaultAbv: 20, icon: '🥃', defaultCountry: 'KR' },
  sangria: { label: 'Sangria', defaultAbv: 10, icon: '🍷', defaultCountry: 'ES' },
  sherry: { label: 'Sherry', defaultAbv: 17, icon: '🍷', defaultCountry: 'ES' },
  port: { label: 'Porto', defaultAbv: 20, icon: '🍷', defaultCountry: 'PT' },
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
  country?: CountryCode;
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
  country?: CountryCode;
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