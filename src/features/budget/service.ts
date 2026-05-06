import { account, databases, APPWRITE_CONFIG, COLLECTIONS, ID, Query, Permission, Role } from '@/lib/appwrite';
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
    const currentUser = await account.get();
    if (currentUser.$id !== userId) throw new Error('Unauthorized');
    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      COLLECTIONS.BUDGET_ENTRIES,
      [Query.equal('createdBy', userId), Query.orderDesc('$createdAt')]
    );
    return (response.documents as unknown as BudgetEntryDoc[]).map(mapDocToEntry);
  },

  async createEntry(userId: string, form: CreateBudgetEntryForm): Promise<BudgetEntry> {
    const currentUser = await account.get();
    if (currentUser.$id !== userId) throw new Error('Unauthorized');
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
      },
      [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId)),
      ]
    );
    return mapDocToEntry(doc as unknown as BudgetEntryDoc);
  },

  async deleteEntry(entryId: string): Promise<void> {
    const currentUser = await account.get();
    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      COLLECTIONS.BUDGET_ENTRIES,
      [Query.equal('$id', entryId), Query.limit(1)]
    );
    if (response.documents.length === 0) return;
    const doc = response.documents[0] as unknown as BudgetEntryDoc;
    if (doc.createdBy !== currentUser.$id) throw new Error('Unauthorized');
    await databases.deleteDocument(APPWRITE_CONFIG.databaseId, COLLECTIONS.BUDGET_ENTRIES, entryId);
  },

  async updateEntry(entryId: string, data: Partial<BudgetEntry>): Promise<BudgetEntry> {
    const currentUser = await account.get();
    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      COLLECTIONS.BUDGET_ENTRIES,
      [Query.equal('$id', entryId), Query.limit(1)]
    );
    if (response.documents.length === 0) throw new Error('Not found');
    const doc = response.documents[0] as unknown as BudgetEntryDoc;
    if (doc.createdBy !== currentUser.$id) throw new Error('Unauthorized');
    const updated = await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      COLLECTIONS.BUDGET_ENTRIES,
      entryId,
      data
    );
    return mapDocToEntry(updated as unknown as BudgetEntryDoc);
  },

  async getMonthlyStats(userId: string, month: Date): Promise<{ income: number; expenses: number }> {
    const currentUser = await account.get();
    if (currentUser.$id !== userId) throw new Error('Unauthorized');
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
    const currentUser = await account.get();
    if (currentUser.$id !== userId) throw new Error('Unauthorized');
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