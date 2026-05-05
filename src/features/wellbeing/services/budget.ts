import { listDocuments, Query } from '@/lib/appwrite';
import { COLLECTIONS } from '@/lib/appwrite';
import type { FinancialStats } from '@/features/wellbeing/utils/financial';

export interface BudgetAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: FinancialStats, achievements: BudgetAchievement[]) => boolean;
  unlockedAt?: string;
}

export const BUDGET_ACHIEVEMENTS: BudgetAchievement[] = [
  {
    id: 'first-entry',
    name: 'Premier pas',
    description: 'Enregistre ta première dépense',
    icon: '🎯',
    condition: (stats) => stats.monthlySpend > 0,
  },
  {
    id: 'under-budget',
    name: 'Dans les clous',
    description: 'Reste sous ton budget pendant 1 mois',
    icon: '✅',
    condition: (stats, achieved) => {
      return achieved.some((a) => a.id === 'first-entry') && stats.vsPreviousMonth < 0;
    },
  },
  {
    id: 'saver-50',
    name: 'Économiste',
    description: 'Économise 50€ sur ton budget annuel',
    icon: '💰',
    condition: (stats) => stats.potentialSavings >= 50,
  },
  {
    id: 'saver-100',
    name: 'Trésorier',
    description: 'Économise 100€ sur ton budget annuel',
    icon: '🏆',
    condition: (stats) => stats.potentialSavings >= 100,
  },
  {
    id: 'saver-500',
    name: 'Millionnaire',
    description: 'Économise 500€ sur ton budget annuel',
    icon: '💎',
    condition: (stats) => stats.potentialSavings >= 500,
  },
  {
    id: 'consistent',
    name: 'Consistant',
    description: 'Dépenses stables 3 mois de suite',
    icon: '📊',
    condition: (stats) => Math.abs(stats.vsPreviousMonth) < 10,
  },
  {
    id: 'conscious',
    name: 'Conscient',
    description: 'Aucun dépassement de budget en 30 jours',
    icon: '🧠',
    condition: (stats, achieved) => {
      return achieved.some((a) => a.id === 'under-budget') && stats.vsPreviousMonth <= 0;
    },
  },
  {
    id: 'minimalist',
    name: 'Minimaliste',
    description: 'Moins de 30€ par semaine',
    icon: '✨',
    condition: (stats) => stats.weeklySpend < 30,
  },
  {
    id: 'weekend-warrior',
    name: 'Guerrier du week-end',
    description: 'Dépenses du week-end inférieures à la semaine',
    icon: '🎉',
    condition: (stats) => stats.avgDailySpend < 10,
  },
  {
    id: 'monthly-master',
    name: 'Maître du mois',
    description: 'Objectif atteint 3 mois consécutifs',
    icon: '👑',
    condition: (stats, achieved) => {
      const underAchievements = achieved.filter((a) => a.id === 'under-budget').length;
      return underAchievements >= 3;
    },
  },
];

export interface BudgetProfile {
  id: string;
  userId: string;
  monthlyBudget: number;
  alcoholLimit: number;
  alertThresholds: number[];
  achievements: string[];
  createdAt: string;
  updatedAt: string;
}

export const wellbeingBudgetService = {
  async getBudgetProfile(userId: string): Promise<BudgetProfile | null> {
    const response = await listDocuments(COLLECTIONS.BUDGET_ENTRIES, [
      Query.equal('createdBy', userId),
      Query.limit(1),
    ]);

    if (response.documents.length === 0) {
      return null;
    }

    return {
      id: response.documents[0].$id,
      userId,
      monthlyBudget: 100,
      alcoholLimit: 30,
      alertThresholds: [50, 75, 90, 100],
      achievements: [],
      createdAt: response.documents[0].$createdAt,
      updatedAt: response.documents[0].$updatedAt,
    };
  },

  async checkAchievements(userId: string, stats: FinancialStats): Promise<BudgetAchievement[]> {
    const profile = await this.getBudgetProfile(userId);
    const unlockedIds = profile?.achievements || [];

    const unlocked: BudgetAchievement[] = [];
    const achievedList = unlockedIds.map((id: string) => BUDGET_ACHIEVEMENTS.find(a => a.id === id)).filter(Boolean) as BudgetAchievement[];

    for (const achievement of BUDGET_ACHIEVEMENTS) {
      if (!unlockedIds.includes(achievement.id) && achievement.condition(stats, achievedList)) {
        unlocked.push({ ...achievement, unlockedAt: new Date().toISOString() });
      }
    }

    return unlocked;
  },

  async getAllAchievements(userId: string): Promise<BudgetAchievement[]> {
    const profile = await this.getBudgetProfile(userId);
    const unlockedIds = profile?.achievements || [];

    return BUDGET_ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      unlockedAt: unlockedIds.includes(achievement.id) ? new Date().toISOString() : undefined,
    }));
  },

  getAlertMessage(spent: number, limit: number): { shouldAlert: boolean; message: string; type: 'info' | 'warning' | 'critical' } | null {
    if (limit <= 0) return null;
    const percentage = (spent / limit) * 100;

    if (percentage >= 100) {
      return { shouldAlert: true, message: '⚠️ Budget dépassé !', type: 'critical' };
    }
    if (percentage >= 90) {
      return { shouldAlert: true, message: '🚨 Alerte ! 90% du budget utilisé.', type: 'warning' };
    }
    if (percentage >= 75) {
      return { shouldAlert: true, message: '📊 75% du budget utilisé.', type: 'warning' };
    }
    if (percentage >= 50) {
      return { shouldAlert: true, message: '💡 Moitié du budget atteint.', type: 'info' };
    }
    return null;
  },
};