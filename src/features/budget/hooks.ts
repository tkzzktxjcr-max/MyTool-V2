import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context';
import { budgetService } from './service';
import { alcoholService } from '@/features/alcohol/services';
import { profileService } from '@/features/alcohol/services';
import { wellbeingBudgetService, type BudgetAchievement } from '@/features/wellbeing/services/budget';
import { calculateFinancialStats, getBudgetStatus, getBudgetFeedback } from '@/features/wellbeing/utils/financial';
import type { BudgetEntry, CreateBudgetEntryForm, BudgetCategory } from './types';

const STALE_TIME = 2 * 60 * 1000;

export interface UseBudgetResult {
  entries: BudgetEntry[];
  isLoading: boolean;
  isError: boolean;
  createEntry: (form: CreateBudgetEntryForm) => Promise<BudgetEntry>;
  deleteEntry: (entryId: string) => Promise<void>;
  updateEntry: (entryId: string, data: Partial<BudgetEntry>) => Promise<BudgetEntry>;
  financialStats: ReturnType<typeof calculateFinancialStats>;
  totalExpenses: number;
  totalIncome: number;
  balance: number;
  budgetUsed: number;
  budgetStatus: 'under' | 'near' | 'over' | 'none';
  budgetFeedback: string;
  expensesByCategory: Record<BudgetCategory, number>;
  monthlyBudgetGoal: number;
  setMonthlyBudgetGoal: (goal: number) => void;
  achievements: BudgetAchievement[];
  newAchievements: BudgetAchievement[];
  checkAchievements: () => Promise<void>;
  budgetAlert: { shouldAlert: boolean; message: string; type: 'info' | 'warning' | 'critical' } | null;
}

export const useBudget = (): UseBudgetResult => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.$id;

  const [newAchievements, setNewAchievements] = useState<BudgetAchievement[]>([]);

  // ── Queries ──────────────────────────────────────────────────────────
  const entriesQuery = useQuery({
    queryKey: ['budget-entries', userId],
    queryFn: () => budgetService.getEntries(userId!),
    enabled: !!userId,
    staleTime: STALE_TIME,
  });

  const alcoholLogsQuery = useQuery({
    queryKey: ['alcohol-logs', userId],
    queryFn: () => alcoholService.getLogs(userId!),
    enabled: !!userId,
    staleTime: STALE_TIME,
  });

  const achievementsQuery = useQuery({
    queryKey: ['budget-achievements', userId],
    queryFn: () => wellbeingBudgetService.getAllAchievements(userId!),
    enabled: !!userId,
    staleTime: STALE_TIME,
  });

  const profileQuery = useQuery({
    queryKey: ['alcohol-profile', userId],
    queryFn: () => profileService.getProfile(userId!),
    enabled: !!userId,
    staleTime: STALE_TIME,
  });

  // ── Budget goal from profile ──────────────────────────────────────────
  const profileBudgetGoal = profileQuery.data?.monthlyBudgetGoal;
  const [localBudgetGoal, setLocalBudgetGoal] = useState(100);

  useEffect(() => {
    if (profileBudgetGoal !== undefined && profileBudgetGoal > 0) {
      setLocalBudgetGoal(profileBudgetGoal);
    }
  }, [profileBudgetGoal]);

  const monthlyBudgetGoal = localBudgetGoal;

  const setMonthlyBudgetGoal = useCallback((goal: number) => {
    setLocalBudgetGoal(goal);
    if (userId) {
      profileService.createOrUpdateProfile(userId, { monthlyBudgetGoal: goal }).then(() => {
        queryClient.invalidateQueries({ queryKey: ['alcohol-profile', userId] });
      }).catch(() => {});
    }
  }, [userId, queryClient]);

  // ── Derived data ──────────────────────────────────────────────────────
  const entries = entriesQuery.data ?? [];
  const alcoholLogs = alcoholLogsQuery.data ?? [];
  const achievements = achievementsQuery.data ?? [];

  const financialStats = useMemo(() => calculateFinancialStats(alcoholLogs), [alcoholLogs]);

  const totalExpenses = useMemo(() => 
    entries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0), [entries]
  );

  const totalIncome = useMemo(() => 
    entries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0), [entries]
  );

  const balance = useMemo(() => totalIncome - totalExpenses, [totalIncome, totalExpenses]);

  const expensesByCategory = useMemo(() => {
    const cats: Record<BudgetCategory, number> = {
      alcohol: 0, groceries: 0, leisure: 0, bills: 0, transport: 0,
      health: 0, education: 0, gifts: 0, savings: 0, other: 0,
    };
    entries.filter(e => e.type === 'expense').forEach(e => {
      cats[e.category] += e.amount;
    });
    return cats;
  }, [entries]);

  const combinedExpenses = totalExpenses + financialStats.monthlySpend;
  const budgetUsed = monthlyBudgetGoal > 0 ? (combinedExpenses / monthlyBudgetGoal) * 100 : 0;
  const budgetStatus = getBudgetStatus(combinedExpenses, monthlyBudgetGoal);
  const budgetFeedback = getBudgetFeedback(financialStats, monthlyBudgetGoal);

  const budgetAlert = useMemo((): { shouldAlert: boolean; message: string; type: 'info' | 'warning' | 'critical' } | null => {
    return wellbeingBudgetService.getAlertMessage(combinedExpenses, monthlyBudgetGoal);
  }, [combinedExpenses, monthlyBudgetGoal]);

  // ── Mutations ─────────────────────────────────────────────────────────
  const createEntryMutation = useMutation({
    mutationFn: (form: CreateBudgetEntryForm) => {
      if (!userId) throw new Error('Not authenticated');
      return budgetService.createEntry(userId, form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-entries', userId] });
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: (entryId: string) => budgetService.deleteEntry(entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-entries', userId] });
    },
  });

  const updateEntryMutation = useMutation({
    mutationFn: ({ entryId, data }: { entryId: string; data: Partial<BudgetEntry> }) => {
      return budgetService.updateEntry(entryId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-entries', userId] });
    },
  });

  // ── Wrapper functions ─────────────────────────────────────────────────
  const createEntry = async (form: CreateBudgetEntryForm): Promise<BudgetEntry> => {
    return createEntryMutation.mutateAsync(form);
  };

  const deleteEntry = async (entryId: string): Promise<void> => {
    await deleteEntryMutation.mutateAsync(entryId);
  };

  const updateEntry = async (entryId: string, data: Partial<BudgetEntry>): Promise<BudgetEntry> => {
    return updateEntryMutation.mutateAsync({ entryId, data });
  };

  // ── Achievement checking ──────────────────────────────────────────────
  const checkAchievements = useCallback(async () => {
    if (!userId) return;
    try {
      const newUnlocked = await wellbeingBudgetService.checkAchievements(userId, financialStats);
      if (newUnlocked.length > 0) {
        setNewAchievements(newUnlocked);
        queryClient.invalidateQueries({ queryKey: ['budget-achievements', userId] });
      }
    } catch { /* silent - achievements are non-critical */ }
  }, [userId, financialStats, queryClient]);

  useEffect(() => { 
    if (financialStats.monthlySpend > 0) checkAchievements(); 
  }, [financialStats.monthlySpend, checkAchievements]);

  const isLoading = entriesQuery.isLoading || alcoholLogsQuery.isLoading;
  const isError = entriesQuery.isError;

  return {
    entries, isLoading, isError, createEntry, deleteEntry, updateEntry,
    financialStats, totalExpenses, totalIncome, balance, budgetUsed, 
    budgetStatus, budgetFeedback, expensesByCategory,
    monthlyBudgetGoal, setMonthlyBudgetGoal, achievements, newAchievements, 
    checkAchievements, budgetAlert,
  };
};