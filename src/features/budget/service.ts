import { databases, APPWRITE_CONFIG, COLLECTIONS, ID, Query } from '@/lib/appwrite';
import type { BudgetEntry, CreateBudgetEntryForm, BudgetCategory } from './types';

interface BudgetEntryDoc {
  $id: string;
  familyId: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
  type: string;
  createdBy: string;
  $createdAt: string;
}

const mapDocToEntry = (doc: BudgetEntryDoc): BudgetEntry => ({
  id: doc.$id,
  userId: doc.createdBy,
  amount: doc.amount,
  category: doc.category as BudgetCategory,
  description: doc.description || '',
  date: doc.date,
  type: doc.type as 'income' | 'expense',
  createdBy: doc.createdBy,
});

export const budgetService = {
  async getEntries(userId: string): Promise<BudgetEntry[]> {
    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      COLLECTIONS.BUDGET_ENTRIES,
      [Query.equal('createdBy', userId), Query.orderDesc('$createdAt')]
    );
    return (response.documents as unknown as BudgetEntryDoc[]).map(mapDocToEntry);
  },

  async createEntry(userId: string, form: CreateBudgetEntryForm): Promise<BudgetEntry> {
    const doc = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      COLLECTIONS.BUDGET_ENTRIES,
      ID.unique(),
      {
        familyId: userId,
        amount: form.amount,
        category: form.category,
        description: form.description || '',
        date: form.date instanceof Date ? form.date.toISOString() : form.date,
        type: form.type,
        createdBy: userId,
      }
    );
    return mapDocToEntry(doc as unknown as BudgetEntryDoc);
  },

  async deleteEntry(entryId: string): Promise<void> {
    await databases.deleteDocument(APPWRITE_CONFIG.databaseId, COLLECTIONS.BUDGET_ENTRIES, entryId);
  },

  async updateEntry(entryId: string, data: Partial<BudgetEntry>): Promise<BudgetEntry> {
    const doc = await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      COLLECTIONS.BUDGET_ENTRIES,
      entryId,
      data
    );
    return mapDocToEntry(doc as unknown as BudgetEntryDoc);
  },

  async getMonthlyStats(userId: string, month: Date): Promise<{ income: number; expenses: number }> {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59);

    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      COLLECTIONS.BUDGET_ENTRIES,
      [
        Query.equal('createdBy', userId),
        Query.greaterThanEqual('date', startOfMonth.toISOString()),
        Query.lessThanEqual('date', endOfMonth.toISOString())
      ]
    );

    let income = 0;
    let expenses = 0;

    (response.documents as unknown as BudgetEntryDoc[]).forEach((doc) => {
      if (doc.type === 'income') income += doc.amount;
      else if (doc.type === 'expense') expenses += doc.amount;
    });

    return { income, expenses };
  },

  async getStatsByCategory(userId: string): Promise<Record<BudgetCategory, number>> {
    const entries = await this.getEntries(userId);
    const stats: Record<BudgetCategory, number> = {
      alcohol: 0, groceries: 0, leisure: 0, bills: 0, transport: 0,
      health: 0, education: 0, gifts: 0, savings: 0, other: 0
    };

    entries
      .filter(e => e.type === 'expense')
      .forEach(entry => {
        stats[entry.category] = (stats[entry.category] || 0) + entry.amount;
      });

    return stats;
  }
};