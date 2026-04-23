import { databases, APPWRITE_CONFIG, COLLECTIONS, createDocument, deleteDocument, Query } from '@/lib/appwrite';
import type { BudgetEntry, CreateBudgetEntryForm, BudgetCategory } from './types';

export const budgetService = {
  async getEntries(familyId: string): Promise<BudgetEntry[]> {
    const response = await databases.listDocuments(APPWRITE_CONFIG.databaseId, COLLECTIONS.BUDGET_ENTRIES, [Query.equal('familyId', familyId)]);
    return response.documents.map((doc: any) => ({ id: doc.$id, familyId: doc.familyId, amount: doc.amount, category: doc.category as BudgetCategory, description: doc.description, date: doc.date, type: doc.type, createdBy: doc.createdBy }));
  },

  async createEntry(familyId: string, ownerId: string, form: CreateBudgetEntryForm): Promise<BudgetEntry> {
    const doc = await createDocument(COLLECTIONS.BUDGET_ENTRIES, { familyId, amount: form.amount, category: form.category, description: form.description, date: form.date.toISOString(), type: form.type, createdBy: ownerId });
    return { id: doc.$id, familyId: doc.familyId, amount: doc.amount, category: doc.category as BudgetCategory, description: doc.description, date: doc.date, type: doc.type, createdBy: doc.createdBy };
  },

  async deleteEntry(entryId: string): Promise<void> { await deleteDocument(COLLECTIONS.BUDGET_ENTRIES, entryId); },
};