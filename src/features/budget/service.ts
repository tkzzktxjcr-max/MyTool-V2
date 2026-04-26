import { databases, APPWRITE_CONFIG, COLLECTIONS, ID, Query } from '@/lib/appwrite';
import type { BudgetEntry, CreateBudgetEntryForm, BudgetCategory } from './types';

export const budgetService = {
  async getEntries(familyId: string): Promise<BudgetEntry[]> {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId, 
        COLLECTIONS.BUDGET_ENTRIES, 
        [Query.equal('familyId', familyId), Query.orderDesc('$createdAt')]
      );
      return response.documents.map((doc: any) => ({
        id: doc.$id, 
        familyId: doc.familyId, 
        amount: doc.amount, 
        category: doc.category as BudgetCategory, 
        description: doc.description || '', 
        date: doc.date, 
        type: doc.type, 
        createdBy: doc.createdBy
      }));
    } catch (error) {
      console.error('[BudgetService] Error getting entries:', error);
      return [];
    }
  },

  async createEntry(familyId: string, ownerId: string, form: CreateBudgetEntryForm): Promise<BudgetEntry> {
    try {
      const doc = await databases.createDocument(
        APPWRITE_CONFIG.databaseId, 
        COLLECTIONS.BUDGET_ENTRIES, 
        ID.unique(), 
        { 
          familyId, 
          amount: form.amount, 
          category: form.category, 
          description: form.description || '', 
          date: form.date instanceof Date ? form.date.toISOString() : form.date, 
          type: form.type, 
          createdBy: ownerId 
        }
      );
      return {
        id: doc.$id, 
        familyId: doc.familyId, 
        amount: doc.amount, 
        category: doc.category as BudgetCategory, 
        description: doc.description || '', 
        date: doc.date, 
        type: doc.type, 
        createdBy: doc.createdBy
      };
    } catch (error) {
      console.error('[BudgetService] Error creating entry:', error);
      throw error;
    }
  },

  async deleteEntry(entryId: string): Promise<void> {
    try {
      await databases.deleteDocument(APPWRITE_CONFIG.databaseId, COLLECTIONS.BUDGET_ENTRIES, entryId);
    } catch (error) {
      console.error('[BudgetService] Error deleting entry:', error);
      throw error;
    }
  },

  async updateEntry(entryId: string, data: Partial<BudgetEntry>): Promise<BudgetEntry> {
    try {
      const doc = await databases.updateDocument(
        APPWRITE_CONFIG.databaseId, 
        COLLECTIONS.BUDGET_ENTRIES, 
        entryId, 
        data
      );
      return {
        id: doc.$id, 
        familyId: doc.familyId, 
        amount: doc.amount, 
        category: doc.category as BudgetCategory, 
        description: doc.description || '', 
        date: doc.date, 
        type: doc.type, 
        createdBy: doc.createdBy
      };
    } catch (error) {
      console.error('[BudgetService] Error updating entry:', error);
      throw error;
    }
  },

  async getMonthlyStats(familyId: string, month: Date): Promise<{ income: number; expenses: number }> {
    try {
      const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
      const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59);
      
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        COLLECTIONS.BUDGET_ENTRIES,
        [
          Query.equal('familyId', familyId),
          Query.greaterThanEqual('date', startOfMonth.toISOString()),
          Query.lessThanEqual('date', endOfMonth.toISOString())
        ]
      );

      let income = 0;
      let expenses = 0;

      response.documents.forEach((doc: any) => {
        if (doc.type === 'income') income += doc.amount;
        else if (doc.type === 'expense') expenses += doc.amount;
      });

      return { income, expenses };
    } catch (error) {
      console.error('[BudgetService] Error getting monthly stats:', error);
      return { income: 0, expenses: 0 };
    }
  },

  async getStatsByCategory(familyId: string): Promise<Record<BudgetCategory, number>> {
    try {
      const entries = await this.getEntries(familyId);
      const stats: Record<BudgetCategory, number> = {
        groceries: 0, leisure: 0, bills: 0, transport: 0,
        health: 0, education: 0, gifts: 0, savings: 0, other: 0
      };

      entries
        .filter(e => e.type === 'expense')
        .forEach(entry => {
          stats[entry.category] = (stats[entry.category] || 0) + entry.amount;
        });

      return stats;
    } catch (error) {
      console.error('[BudgetService] Error getting stats by category:', error);
      return {
        groceries: 0, leisure: 0, bills: 0, transport: 0,
        health: 0, education: 0, gifts: 0, savings: 0, other: 0
      };
    }
  }
};