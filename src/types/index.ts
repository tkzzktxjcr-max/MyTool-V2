// ==================== USER & AUTH ====================
export interface UserProfile {
  id: string;
  userId: string;
  email: string;
  name: string;
  familyId?: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthUser {
  $id: string;
  email: string;
  name: string;
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

// ==================== EVENTS ====================
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

export type EventCategory = 'family' | 'school' | 'work' | 'leisure' | 'medical' | 'other';

export const EVENT_COLORS: Record<EventCategory, string> = {
  family: '#FF6B6B',
  school: '#4ECDC4',
  work: '#45B7D1',
  leisure: '#FFE66D',
  medical: '#96CEB4',
  other: '#95A5A6',
};

// ==================== CHORES ====================
export interface Chore {
  id: string;
  familyId: string;
  title: string;
  description?: string;
  frequency: ChoreFrequency;
  points?: number;
  assignedTo?: string;
  dueDate?: string;
  status: ChoreStatus;
  createdBy: string;
}

export type ChoreFrequency = 'daily' | 'weekly' | 'monthly';
export type ChoreStatus = 'pending' | 'completed' | 'missed';

export const CHORE_STATUS_COLORS: Record<ChoreStatus, string> = {
  pending: '#FFE66D',
  completed: '#4ECDC4',
  missed: '#FF6B6B',
};

// ==================== BUDGET ====================
export interface BudgetEntry {
  id: string;
  familyId: string;
  amount: number;
  category: BudgetCategory;
  description?: string;
  date: string;
  type: 'expense' | 'income';
  createdBy: string;
}

export type BudgetCategory = 
  | 'groceries' 
  | 'leisure' 
  | 'bills' 
  | 'transport' 
  | 'health' 
  | 'education' 
  | 'gifts' 
  | 'savings' 
  | 'other';

export const BUDGET_CATEGORIES: Record<BudgetCategory, { label: string; icon: string; color: string }> = {
  groceries: { label: 'Courses', icon: '🛒', color: '#4ECDC4' },
  leisure: { label: 'Loisirs', icon: '🎮', color: '#FF6B6B' },
  bills: { label: 'Factures', icon: '📄', color: '#45B7D1' },
  transport: { label: 'Transport', icon: '🚗', color: '#FFE66D' },
  health: { label: 'Santé', icon: '💊', color: '#96CEB4' },
  education: { label: 'Éducation', icon: '📚', color: '#9B59B6' },
  gifts: { label: 'Cadeaux', icon: '🎁', color: '#E91E63' },
  savings: { label: 'Épargne', icon: '💰', color: '#2ECC71' },
  other: { label: 'Autre', icon: '📦', color: '#95A5A6' },
};

// ==================== ALCOHOL ====================
export interface AlcoholLog {
  id: string;
  userId: string;
  date: string;
  drinkType: DrinkType;
  volumeCl: number;
  abv: number;
  units: number;
  context?: AlcoholContext;
  notes?: string;
  mood?: Mood;
}

export type DrinkType = 'beer' | 'wine' | 'spirits' | 'cocktail' | 'cider' | 'other';

export type AlcoholContext = 'meal' | 'party' | 'relax' | 'social' | 'celebration' | 'other';

export type Mood = 'happy' | 'relaxed' | 'neutral' | 'stressed' | 'sad';

export const DRINK_TYPES: Record<DrinkType, { label: string; defaultAbv: number; icon: string }> = {
  beer: { label: 'Bière', defaultAbv: 5, icon: '🍺' },
  wine: { label: 'Vin', defaultAbv: 12, icon: '🍷' },
  spirits: { label: 'Spiritueux', defaultAbv: 40, icon: '🥃' },
  cocktail: { label: 'Cocktail', defaultAbv: 20, icon: '🍹' },
  cider: { label: 'Cidre', defaultAbv: 5, icon: '🍎' },
  other: { label: 'Autre', defaultAbv: 10, icon: '🥤' },
};

export const ALCOHOL_CONTEXTS: Record<AlcoholContext, { label: string; icon: string }> = {
  meal: { label: 'Repas', icon: '🍽️' },
  party: { label: 'Fête', icon: '🎉' },
  relax: { label: 'Détente', icon: '😌' },
  social: { label: 'Entre amis', icon: '👥' },
  celebration: { label: 'Célébration', icon: '🎊' },
  other: { label: 'Autre', icon: '✨' },
};

export const MOODS: Record<Mood, { label: string; emoji: string }> = {
  happy: { label: 'Joyeux', emoji: '😊' },
  relaxed: { label: 'Détendu', emoji: '😌' },
  neutral: { label: 'Neutre', emoji: '😐' },
  stressed: { label: 'Stressé', emoji: '😰' },
  sad: { label: 'Triste', emoji: '😢' },
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

// ==================== UTILITY TYPES ====================
export interface DashboardStats {
  upcomingEvents: number;
  pendingChores: number;
  monthlySpent: number;
  monthlyBudget: number;
  weeklyAlcoholUnits: number;
  alcoholRiskLevel: 'low' | 'moderate' | 'high';
}

// ==================== FORM TYPES ====================
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
}

export interface CreateFamilyForm {
  name: string;
  monthlyBudget?: number;
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

export interface CreateChoreForm {
  title: string;
  description?: string;
  frequency: ChoreFrequency;
  points?: number;
  assignedTo?: string;
  dueDate?: Date;
}

export interface CreateBudgetEntryForm {
  amount: number;
  category: BudgetCategory;
  description?: string;
  date: Date;
  type: 'expense' | 'income';
}

export interface CreateAlcoholLogForm {
  drinkType: DrinkType;
  volumeCl: number;
  abv: number;
  context?: AlcoholContext;
  notes?: string;
  mood?: Mood;
}