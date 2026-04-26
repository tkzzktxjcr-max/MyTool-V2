import { createDocument, listDocuments, updateDocument, Query } from '@/lib/appwrite';
import { COLLECTIONS } from '@/lib/appwrite';

export interface UserProfile {
  id: string;
  userId: string;
  weightKg: number;
  sex: 'male' | 'female' | 'unspecified';
  legalLimit: number;
  onboardingCompleted: boolean;
  updatedAt: string;
}

export const profileService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const response = await listDocuments(COLLECTIONS.USER_PROFILES, [Query.equal('userId', userId)]);
      if (response.documents.length === 0) return null;
      const doc = response.documents[0];
      return { id: doc.$id, userId: doc.userId, weightKg: doc.weightKg || 70, sex: doc.sex || 'unspecified', legalLimit: doc.legalLimit || 0.5, onboardingCompleted: doc.onboardingCompleted || false, updatedAt: doc.$updatedAt };
    } catch { return null; }
  },

  async createOrUpdateProfile(userId: string, data: { weightKg?: number; sex?: 'male' | 'female' | 'unspecified'; legalLimit?: number; onboardingCompleted?: boolean }): Promise<UserProfile> {
    try {
      const existing = await this.getProfile(userId);
      if (existing) {
        const doc: any = await updateDocument(COLLECTIONS.USER_PROFILES, existing.id, {
          weightKg: data.weightKg ?? existing.weightKg, sex: data.sex ?? existing.sex,
          legalLimit: data.legalLimit ?? existing.legalLimit, onboardingCompleted: data.onboardingCompleted ?? existing.onboardingCompleted,
        });
        return { id: doc.$id, userId: doc.userId, weightKg: doc.weightKg, sex: doc.sex, legalLimit: doc.legalLimit, onboardingCompleted: doc.onboardingCompleted ?? false, updatedAt: doc.$updatedAt };
      }
      const doc: any = await createDocument(COLLECTIONS.USER_PROFILES, {
        userId, weightKg: data.weightKg || 70, sex: data.sex || 'unspecified', legalLimit: data.legalLimit || 0.5, onboardingCompleted: data.onboardingCompleted || false,
      });
      return { id: doc.$id, userId: doc.userId, weightKg: doc.weightKg, sex: doc.sex, legalLimit: doc.legalLimit, onboardingCompleted: doc.onboardingCompleted ?? false, updatedAt: doc.$createdAt };
    } catch {
      return { id: 'local-profile', userId, weightKg: data.weightKg || 70, sex: data.sex || 'unspecified', legalLimit: data.legalLimit || 0.5, onboardingCompleted: data.onboardingCompleted || false, updatedAt: new Date().toISOString() };
    }
  },
};
