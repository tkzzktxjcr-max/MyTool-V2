// ==================== USER & AUTH ====================
export interface AuthUser {
  $id: string;
  email: string;
  name: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  email: string;
  name: string;
  familyId?: string;
  avatar?: string;
  createdAt?: string;
}

// ==================== FAMILY ====================
export interface Family {
  id: string;
  name: string;
  ownerId: string;
  inviteCode?: string;
  monthlyBudget?: number;
  createdAt: string;
}

export interface FamilyMember {
  id: string;
  familyId: string;
  userId: string;
  role: 'admin' | 'member';
  name: string;
  avatar?: string;
}

export interface CreateFamilyForm {
  name: string;
  monthlyBudget?: number;
}

// ==================== CALENDAR ====================
export type EventCategory = 'family' | 'school' | 'work' | 'leisure' | 'medical' | 'other';

export interface CalendarEvent {
  id: string;
  familyId: string;
  title: string;
  description?: string;
  date: string;
  endDate?: string;
  color?: string;
  category: EventCategory;
  assignedTo?: string;
  reminder?: boolean;
  createdBy: string;
}

export interface CreateEventForm {
  title: string;
  description?: string;
  date: Date;
  endDate?: Date;
  category: EventCategory;
  assignedTo?: string;
  reminder?: boolean;
}

// ==================== CHORES ====================
export type ChoreFrequency = 'daily' | 'weekly' | 'monthly';
export type ChoreStatus = 'pending' | 'completed';

export interface Chore {
  id: string;
  familyId: string;
  title: string;
  description?: string;
  frequency?: ChoreFrequency;
  points?: number;
  assignedTo?: string;
  dueDate?: string;
  status: ChoreStatus;
  createdBy: string;
}

export interface CreateChoreForm {
  title: string;
  description?: string;
  frequency?: ChoreFrequency;
  points?: number;
  assignedTo?: string;
  dueDate?: Date;
}

// ==================== BUDGET ====================
export type BudgetCategory = 'groceries' | 'leisure' | 'bills' | 'transport' | 'health' | 'education' | 'gifts' | 'savings' | 'other';

export const BUDGET_CATEGORIES: Record<BudgetCategory, { label: string; icon: string; color: string }> = {
  groceries: { label: 'Courses', icon: '🛒', color: '#FF6B6B' },
  leisure: { label: 'Loisirs', icon: '🎮', color: '#4ECDC4' },
  bills: { label: 'Factures', icon: '📄', color: '#45B7D1' },
  transport: { label: 'Transport', icon: '🚗', color: '#96CEB4' },
  health: { label: 'Santé', icon: '💊', color: '#DDA0DD' },
  education: { label: 'Éducation', icon: '📚', color: '#FFE66D' },
  gifts: { label: 'Cadeaux', icon: '🎁', color: '#FFB6C1' },
  savings: { label: 'Épargne', icon: '💰', color: '#98D8C8' },
  other: { label: 'Autre', icon: '📦', color: '#95A5A6' },
};

export interface BudgetEntry {
  id: string;
  familyId: string;
  amount: number;
  category: BudgetCategory;
  description?: string;
  date: string;
  type: 'income' | 'expense';
  createdBy: string;
}

export interface CreateBudgetEntryForm {
  amount: number;
  category: BudgetCategory;
  description?: string;
  date: Date;
  type: 'income' | 'expense';
}

// ==================== ALCOHOL ====================
export type AlcoholContext = 'social' | 'alone' | 'meal' | 'celebration' | 'other';

export interface AlcoholLog {
  id: string;
  userId: string;
  date: string;
  drinkType: DrinkType;
  volumeCl: number;
  abv: number;
  units: number;
}

export type DrinkType = 'beer' | 'wine' | 'spirits' | 'cocktail' | 'cider' | 'other';

export const DRINK_TYPES: Record<DrinkType, { label: string; defaultAbv: number; icon: string }> = {
  beer: { label: 'Bière', defaultAbv: 5, icon: '🍺' },
  wine: { label: 'Vin', defaultAbv: 12, icon: '🍷' },
  spirits: { label: 'Spiritueux', defaultAbv: 40, icon: '🥃' },
  cocktail: { label: 'Cocktail', defaultAbv: 20, icon: '🍹' },
  cider: { label: 'Cidre', defaultAbv: 5, icon: '🍎' },
  other: { label: 'Autre', defaultAbv: 10, icon: '🥤' },
};

// ==================== ALCOHOL INSIGHTS ====================
export interface AlcoholInsight {
  totalWeeklyUnits: number;
  totalMonthlyUnits: number;
  averagePerDay: number;
  dailyTrend: { date: string; units: number }[];
  weeklyTrend: { week: string; units: number }[];
  isWithinGuidelines: boolean;
  riskLevel: 'low' | 'moderate' | 'high';
  daysOverLimit: number;
  mostCommonDrink: DrinkType;
  mostCommonContext: AlcoholContext;
  recommendations: string[];
}

// Repères santé (recommandations OMS)
export const HEALTH_GUIDELINES = {
  maxWeeklyUnits: 14,
  maxDailyUnits: 4,
  lowRiskUnits: 2,
  dangerousUnits: 6,
};

// ==================== FORM TYPES ====================
export interface CreateAlcoholLogForm {
  drinkType: DrinkType;
  volumeCl: number;
  abv: number;
}