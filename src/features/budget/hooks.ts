import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '@/features/auth/context';
import { budgetService } from './service';
import type { BudgetEntry, CreateBudgetEntryForm, BudgetCategory } from './types';

export const useBudget = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<BudgetEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [familyId, setFamilyId] = useState<string | undefined>(undefined);

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

  const createEntry = async (form: CreateBudgetEntryForm): Promise<BudgetEntry> => {
    if (!familyId || !user) throw new Error('No family or user');
    const entry = await budgetService.createEntry(familyId, user.$id, form);
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
  const budgetUsed = useMemo(() => (familyId ? (totalExpenses / 100) * 100 : 0), [totalExpenses, familyId]);
  const expensesByCategory = useMemo(() => {
    const cats: Record<BudgetCategory, number> = { groceries: 0, leisure: 0, bills: 0, transport: 0, health: 0, education: 0, gifts: 0, savings: 0, other: 0 };
    entries.filter(e => e.type === 'expense').forEach(e => { cats[e.category] += e.amount; });
    return cats;
  }, [entries]);

  useEffect(() => { if (familyId) loadEntries(); }, [familyId, loadEntries]);

  return { entries, loading, loadEntries, createEntry, deleteEntry, totalExpenses, totalIncome, balance, budgetUsed, expensesByCategory, setFamilyId };
};