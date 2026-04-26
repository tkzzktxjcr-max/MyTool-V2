import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '@/features/auth/context';
import { budgetService } from './service';
import { alcoholService } from '@/features/alcohol/services';
import { budgetService as wellbeingBudgetService } from '@/features/wellbeing/services/budget';
import { calculateFinancialStats, getBudgetStatus, getBudgetFeedback } from '@/features/wellbeing/utils/financial';
import type { BudgetEntry, CreateBudgetEntryForm, BudgetCategory } from './types';

export interface UseBudgetResult {
  entries: BudgetEntry[];
  loading: boolean;
  loadEntries: () => Promise<void>;
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
  achievements: any[];
  newAchievements: any[];
  checkAchievements: () => Promise<void>;
  budgetAlert: { shouldAlert: boolean; message: string; type: 'info' | 'warning' | 'critical' } | null;
  familyId: string | undefined;
  setFamilyId: (id: string) => void;
}

export const useBudget = (): UseBudgetResult => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<BudgetEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [familyId, setFamilyId] = useState<string | undefined>(undefined);
  const [alcoholLogs, setAlcoholLogs] = useState<any[]>([]);
  const [monthlyBudgetGoal, setMonthlyBudgetGoal] = useState(100);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [newAchievements, setNewAchievements] = useState<any[]>([]);

  const loadEntries = useCallback(async () => {
    if (!familyId) return;
    setLoading(true);
    try {
      const data = await budgetService.getEntries(familyId);
      setEntries(data);
    } finally {
      setLoading(false);
    }
  }, [familyId]);

  const loadAlcoholLogs = useCallback(async () => {
    if (!user?.$id) return;
    try {
      const logs = await alcoholService.getLogs(user.$id);
      setAlcoholLogs(logs);
    } catch {
      setAlcoholLogs([]);
    }
  }, [user?.$id]);

  const loadAchievements = useCallback(async () => {
    if (!user?.$id) return;
    try {
      const allAchievements = await wellbeingBudgetService.getAllAchievements(user.$id);
      setAchievements(allAchievements);
    } catch {
      setAchievements([]);
    }
  }, [user?.$id]);

  const createEntry = async (form: CreateBudgetEntryForm): Promise<BudgetEntry> => {
    if (!familyId || !user) throw new Error('No family or user');
    const entry = await budgetService.createEntry(familyId, user.$id, form);
    setEntries(prev => [entry, ...prev]);
    return entry;
  };

  const deleteEntry = async (entryId: string): Promise<void> => {
    await budgetService.deleteEntry(entryId);
    setEntries(prev => prev.filter(e => e.id !== entryId));
  };

  const updateEntry = async (entryId: string, data: Partial<BudgetEntry>): Promise<BudgetEntry> => {
    const updated = await budgetService.updateEntry(entryId, data);
    setEntries(prev => prev.map(e => e.id === entryId ? updated : e));
    return updated;
  };

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
      groceries: 0, leisure: 0, bills: 0, transport: 0,
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

  const checkAchievements = useCallback(async () => {
    if (!user?.$id) return;
    try {
      const newUnlocked = await wellbeingBudgetService.checkAchievements(user.$id, financialStats);
      if (newUnlocked.length > 0) {
        setNewAchievements(newUnlocked);
        await loadAchievements();
      }
    } catch { /* silent */ }
  }, [user?.$id, financialStats, loadAchievements]);

  const budgetAlert = useMemo((): { shouldAlert: boolean; message: string; type: 'info' | 'warning' | 'critical' } | null => {
    return wellbeingBudgetService.getAlertMessage(combinedExpenses, monthlyBudgetGoal);
  }, [combinedExpenses, monthlyBudgetGoal]);

  useEffect(() => { if (familyId) loadEntries(); }, [familyId, loadEntries]);
  useEffect(() => { loadAlcoholLogs(); loadAchievements(); }, [loadAlcoholLogs, loadAchievements]);
  useEffect(() => { if (financialStats.monthlySpend > 0) checkAchievements(); }, [financialStats.monthlySpend, checkAchievements]);

  return {
    entries, loading, loadEntries, createEntry, deleteEntry, updateEntry,
    financialStats, totalExpenses, totalIncome, balance, budgetUsed, budgetStatus, budgetFeedback, expensesByCategory,
    monthlyBudgetGoal, setMonthlyBudgetGoal, achievements, newAchievements, checkAchievements, budgetAlert, familyId, setFamilyId,
  };
};