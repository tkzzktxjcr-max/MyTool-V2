import { useState, useCallback, useMemo } from 'react';
import { useFamily } from '@/features/family/context';
import { useAuth } from '@/features/auth/context';
import { budgetService } from './service';
import type { BudgetEntry, CreateBudgetEntryForm, BudgetCategory } from './types';

export const useBudget = () => {
  const { family } = useFamily();
  const { user } = useAuth();
  const [entries, setEntries] = useState<BudgetEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const loadEntries = useCallback(async () => {
    if (!family?.id) return;
    setLoading(true);
    try {
      const data = await budgetService.getEntries(family.id);
      setEntries(data);
    } catch (err) {
      console.error('Error loading entries:', err);
    } finally {
      setLoading(false);
    }
  }, [family?.id]);

  const createEntry = async (form: CreateBudgetEntryForm): Promise<BudgetEntry> => {
    if (!family?.id || !user) throw new Error('No family or user');
    const entry = await budgetService.createEntry(family.id, user.$id, form);
    setEntries(prev => [...prev, entry]);
    return entry;
  };

  const deleteEntry = async (entryId: string): Promise<void> => {
    await budgetService.deleteEntry(entryId);
    setEntries(prev => prev.filter(e => e.id !== entryId));
  };

  const totalExpenses = useMemo(() => entries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0), [entries]);
  const totalIncome = useMemo(() => entries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0), [entries]);
  const balance = useMemo(() => totalIncome - totalExpenses, [totalIncome, totalExpenses]);
  const budgetUsed = useMemo(() => (!family?.monthlyBudget || family.monthlyBudget === 0) ? 0 : (totalExpenses / family.monthlyBudget) * 100, [totalExpenses, family?.monthlyBudget]);
  const expensesByCategory = useMemo(() => {
    const cats: Record<BudgetCategory, number> = { groceries: 0, leisure: 0, bills: 0, transport: 0, health: 0, education: 0, gifts: 0, savings: 0, other: 0 };
    entries.filter(e => e.type === 'expense').forEach(e => { cats[e.category] += e.amount; });
    return cats;
  }, [entries]);

  return { entries, loading, loadEntries, createEntry, deleteEntry, totalExpenses, totalIncome, balance, budgetUsed, expensesByCategory };
};