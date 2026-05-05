import { createDocument, listDocuments, updateDocument, Query } from '@/lib/appwrite';
import { COLLECTIONS } from '@/lib/appwrite';
import type { AlcoholGoal } from '../types';

interface GoalDoc {
  $id: string;
  userId: string;
  weeklyLimit: number;
  reductionGoal?: number | null;
  isActive?: boolean;
  $createdAt: string;
}

export const goalsService = {
  async getGoal(userId: string): Promise<AlcoholGoal | null> {
    const response = await listDocuments(COLLECTIONS.GOALS, [Query.equal('userId', userId)]);
    if (response.documents.length === 0) return null;
    const doc = response.documents[0] as GoalDoc;
    return { id: doc.$id, userId: doc.userId, weeklyLimit: doc.weeklyLimit || 14, reductionGoal: doc.reductionGoal ?? undefined, isActive: doc.isActive ?? true, createdAt: doc.$createdAt };
  },

  async createOrUpdateGoal(userId: string, data: { weeklyLimit: number; reductionGoal?: number; isActive?: boolean }): Promise<AlcoholGoal> {
    const existing = await this.getGoal(userId);
    if (existing) {
      const doc: GoalDoc = await updateDocument(COLLECTIONS.GOALS, existing.id, {
        weeklyLimit: data.weeklyLimit, reductionGoal: data.reductionGoal ?? null, isActive: data.isActive ?? true,
      }) as GoalDoc;
      return { id: doc.$id, userId: doc.userId, weeklyLimit: doc.weeklyLimit, reductionGoal: doc.reductionGoal ?? undefined, isActive: doc.isActive, createdAt: doc.$createdAt };
    }
    const doc: GoalDoc = await createDocument(COLLECTIONS.GOALS, {
      userId, weeklyLimit: data.weeklyLimit, reductionGoal: data.reductionGoal ?? null, isActive: data.isActive ?? true,
    }) as GoalDoc;
    return { id: doc.$id, userId: doc.userId, weeklyLimit: doc.weeklyLimit, reductionGoal: doc.reductionGoal ?? undefined, isActive: doc.isActive, createdAt: doc.$createdAt };
  },
};