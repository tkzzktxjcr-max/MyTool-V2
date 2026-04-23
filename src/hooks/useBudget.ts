"use client";

import { useState, useCallback, useMemo } from 'react';
import { 
  createDocument, 
  listDocuments, 
  deleteDocument,
  COLLECTIONS,
  databases,
  APPWRITE_CONFIG,
  Query,
} from '@/lib/appwrite';
import { useFamily } from '@/contexts/FamilyContext';
import type { BudgetEntry, CreateBudgetEntryForm, BudgetCategory } from '@/types';

export const useBudget = () => {
  const { family } = useFamily();
  const [entries, setEntries] = useState<BudgetEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const loadEntries = useCallback(async () => {
    if (!family?.id) return;

    setLoading(true);
    try {
      // Use proper server-side query filtering
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        COLLECTIONS.BUDGET_ENTRIES,
        [Query.equal('familyId', family.id)]
      );
      
      const familyEntries = response.documents.map((doc: any) => ({
        id: doc.$id,
        familyId: doc.familyId,
        amount: doc.amount,
        category: doc.category as BudgetCategory,
        description: doc.description,
        date: doc.date,
        type: doc.type,
        createdBy: doc.createdBy,
      }));
      
      setEntries(familyEntries);
    } catch (error) {
      console.error('Error loading budget entries:', error);
    } finally {
      setLoading(false);
    }
  }, [family?.id]);

  const createEntry = async (form: CreateBudgetEntryForm): Promise<BudgetEntry> => {
    if (!family?.id) throw new Error('No family selected');

    const doc: any = await createDocument(COLLECTIONS.BUDGET_ENTRIES, {
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

  const deleteEntry = async (entryId: string): Promise<void> => {
    await deleteDocument(COLLECTIONS.BUDGET_ENTRIES, entryId);
    setEntries(prev => prev.filter(e => e.id !== entryId));
  };

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

  return {
    entries,
    loading,
    loadEntries,
    createEntry,
    deleteEntry,
    totalExpenses,
    totalIncome,
    balance,
    budgetUsed,
    expensesByCategory,
  };
};