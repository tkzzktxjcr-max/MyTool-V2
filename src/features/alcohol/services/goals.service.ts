import { databases, APPWRITE_CONFIG, COLLECTIONS, createDocument, listDocuments, updateDocument, Query } from '@/lib/appwrite';
import type { AlcoholGoal } from '../types';

export const goalsService = {
  async getGoal(userId: string): Promise<AlcoholGoal | null> {
    const response = await listDocuments(COLLECTIONS.GOALS, [
      Query.equal('userId', userId),
    ]);
    
    if (response.documents.length === 0) return null;
    
    const doc = response.documents[0];
    return {
      id: doc.$id,
      userId: doc.userId,
      weeklyLimit: doc.weeklyLimit || 14,
      reductionGoal: doc.reductionGoal,
      isActive: doc.isActive ?? true,
      createdAt: doc.$createdAt,
    };
  },

  async createOrUpdateGoal(userId: string, data: {
    weeklyLimit: number;
    reductionGoal?: number;
    isActive?: boolean;
  }): Promise<AlcoholGoal> {
    const existing = await this.getGoal(userId);
    
    if (existing) {
      const doc: any = await updateDocument(COLLECTIONS.GOALS, existing.id, {
        weeklyLimit: data.weeklyLimit,
        reductionGoal: data.reductionGoal ?? null,
        isActive: data.isActive ?? true,
      });
      
      return {
        id: doc.$id,
        userId: doc.userId,
        weeklyLimit: doc.weeklyLimit,
        reductionGoal: doc.reductionGoal,
        isActive: doc.isActive,
        createdAt: doc.$createdAt,
      };
    }
    
    const doc: any = await createDocument(COLLECTIONS.GOALS, {
      userId,
      weeklyLimit: data.weeklyLimit,
      reductionGoal: data.reductionGoal ?? null,
      isActive: data.isActive ?? true,
      createdAt: new Date().toISOString(),
    });
    
    return {
      id: doc.$id,
      userId: doc.userId,
      weeklyLimit: doc.weeklyLimit,
      reductionGoal: doc.reductionGoal,
      isActive: doc.isActive,
      createdAt: doc.$createdAt,
    };
  },

  async deleteGoal(goalId: string): Promise<void> {
    const { deleteDocument } = await import('@/lib/appwrite');
    await deleteDocument(COLLECTIONS.GOALS, goalId);
  },
};