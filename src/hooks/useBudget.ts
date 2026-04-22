"use client";

import { useState, useCallback, useMemo } from 'react';
import { 
  createDocument, 
  listDocuments, 
  updateDocument, 
  deleteDocument,
  COLLECTIONS,
} from '@/lib/appwrite';
import { useFamily } from '@/contexts/FamilyContext';
import type { BudgetEntry, CreateBudgetEntryForm, BudgetCategory } from '@/types';

export const useBudget = () => {
  const { family } = useFamily();
  const [entries, setEntries] = useState<BudgetEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const loadEntries = useCallback(async (startDate?: Date, endDate?: Date) => {
    if (!family?.id) return;

    setLoading(true);
    try {
      let queries = [`familyId=${family.id}`];
      
      if (startDate) {
        queries.push(`date>="${startDate.toISOString()}"`);
      }
      if (endDate) {
        queries.push(`date<="${endDate.toISOString()}"`);
      }

      const response = await listDocuments(COLLECTIONS.BUDGET_ENTRIES, queries);
      
      setEntries(
        response.documents.map(doc => ({
          id: doc.$id,
          familyId: doc.familyId,
          amount: doc.amount,
          category: doc.category as BudgetCategory,
          description: doc.description,
          date: doc.date,
          type: doc.type,
          createdBy: doc.createdBy,
        }))
      );
    } catch (error) {
      console.error('Error loading budget entries:', error);
    } finally {
      setLoading(false);
    }
  }, [family?.id]);

  const createEntry = async (form: CreateBudgetEntryForm): Promise<BudgetEntry> => {
    if (!family?.id) throw new Error('No family selected');

    const doc = await createDocument(COLLECTIONS.BUDGET_ENTRIES, {
      familyId: family.id,
      amount: form.amount,
      category: form.category,
      description: form.description,
      date: form.date.toISOString(),
      type: form.type,
      createdBy: family.ownerId,
    });

    const entry: BudgetEntry = {
      id: doc.$id,
      familyId: doc.familyId,
      amount: doc.amount,
      category: doc.category as BudgetCategory,
      description: doc.description,
      date: doc.date,
      type: doc.type,
      createdBy: doc.createdBy,
    };

    setEntries(prev => [...prev, entry]);
    return entry;
  };

  const updateEntry = async (entryId: string, data: Partial<CreateBudgetEntryForm>): Promise<void> => {
    await updateDocument(COLLECTIONS.BUDGET_ENTRIES, entryId, {
      ...data,
      date: data.date?.toISOString(),
    });

    setEntries(prev =>
      prev.map(e =>
        e.id === entryId
          ? { ...e, ...data, date: data.date?.toISOString() || e.date }
          : e
      )
    );
  };

  const deleteEntry = async (entryId: string): Promise<void> => {
    await deleteDocument(COLLECTIONS.BUDGET_ENTRIES, entryId);
    setEntries(prev => prev.filter(e => e.id !== entryId));
  };

  // Calculs
  const totalExpenses = useMemo(() => {
    return entries
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [entries]);

  const totalIncome = useMemo(() => {
    return entries
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [entries]);

  const balance = useMemo(() => {
    return totalIncome - totalExpenses;
  }, [totalIncome, totalExpenses]);

  const budgetUsed = useMemo(() => {
    if (!family?.monthlyBudget || family.monthlyBudget === 0) return 0;
    return (totalExpenses / family.monthlyBudget) * 100;
  }, [totalExpenses, family?.monthlyBudget]);

  const expensesByCategory = useMemo(() => {
    const categories: Record<BudgetCategory, number> = {
      groceries: 0,
      leisure: 0,
      bills: 0,
      transport: 0,
      health: 0,
      education: 0,
      gifts: 0,
      savings: 0,
      other: 0,
    };

    entries
      .filter(e => e.type === 'expense')
      .forEach(e => {
        categories[e.category] += e.amount;
      });

    return categories;
  }, [entries]);

  const getEntriesByMonth = (year: number, month: number): BudgetEntry[] => {
    return entries.filter(e => {
      const date = new Date(e.date);
      return date.getFullYear() === year && date.getMonth() === month;
    });
  };

  return {
    entries,
    loading,
    loadEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    totalExpenses,
    totalIncome,
    balance,
    budgetUsed,
    expensesByCategory,
    getEntriesByMonth,
  };
};