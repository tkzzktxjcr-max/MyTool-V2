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