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
    const doc = response.documents[0] as unknown as GoalDoc;
    return { id: doc.$id, userId: doc.userId, weeklyLimit: doc.weeklyLimit || 14, reductionGoal: doc.reductionGoal ?? undefined, isActive: doc.isActive ?? true, createdAt: doc.$createdAt };
  },

  async createOrUpdateGoal(userId: string, data: { weeklyLimit: number; reductionGoal?: number; isActive?: boolean }): Promise<AlcoholGoal> {
    const existing = await this.getGoal(userId);
    if (existing) {
      const doc = await updateDocument(COLLECTIONS.GOALS, existing.id, {
        weeklyLimit: data.weeklyLimit, reductionGoal: data.reductionGoal ?? null, isActive: data.isActive ?? true,
      });
      const updated = doc as unknown as GoalDoc;
      return { id: updated.$id, userId: updated.userId, weeklyLimit: updated.weeklyLimit, reductionGoal: updated.reductionGoal ?? undefined, isActive: updated.isActive, createdAt: updated.$createdAt };
    }
    const doc = await createDocument(COLLECTIONS.GOALS, {
      userId, weeklyLimit: data.weeklyLimit, reductionGoal: data.reductionGoal ?? null, isActive: data.isActive ?? true,
    });
    const created = doc as unknown as GoalDoc;
    return { id: created.$id, userId: created.userId, weeklyLimit: created.weeklyLimit, reductionGoal: created.reductionGoal ?? undefined, isActive: created.isActive, createdAt: created.$createdAt };
  },
};