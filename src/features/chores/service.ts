import { databases, APPWRITE_CONFIG, COLLECTIONS, createDocument, updateDocument, deleteDocument, Query } from '@/lib/appwrite';
import type { Chore, CreateChoreForm } from './types';

export const choresService = {
  async getChores(familyId: string): Promise<Chore[]> {
    const response = await databases.listDocuments(APPWRITE_CONFIG.databaseId, COLLECTIONS.CHORES, [Query.equal('familyId', familyId)]);
    return response.documents.map((doc: any) => ({ id: doc.$id, familyId: doc.familyId, title: doc.title, description: doc.description, frequency: doc.frequency, points: doc.points, assignedTo: doc.assignedTo, dueDate: doc.dueDate, status: doc.status, createdBy: doc.createdBy }));
  },

  async createChore(familyId: string, ownerId: string, form: CreateChoreForm): Promise<Chore> {
    const doc = await createDocument(COLLECTIONS.CHORES, { familyId, title: form.title, description: form.description, frequency: form.frequency, points: form.points || 10, assignedTo: form.assignedTo, dueDate: form.dueDate?.toISOString(), status: 'pending', createdBy: ownerId });
    return { id: doc.$id, familyId: doc.familyId, title: doc.title, description: doc.description, frequency: doc.frequency, points: doc.points, assignedTo: doc.assignedTo, dueDate: doc.dueDate, status: doc.status, createdBy: doc.createdBy };
  },

  async completeChore(choreId: string): Promise<void> { await updateDocument(COLLECTIONS.CHORES, choreId, { status: 'completed' }); },
  async deleteChore(choreId: string): Promise<void> { await deleteDocument(COLLECTIONS.CHORES, choreId); },
};