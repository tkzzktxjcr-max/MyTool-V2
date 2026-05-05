import { createDocument, listDocuments, updateDocument, Query } from '@/lib/appwrite';
import { COLLECTIONS } from '@/lib/appwrite';

interface ProfileDoc {
  $id: string;
  userId: string;
  weightKg?: number;
  sex?: string;
  legalLimit?: number;
  monthlyBudgetGoal?: number;
  onboardingCompleted?: boolean;
  $createdAt: string;
  $updatedAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  weightKg: number;
  sex: 'male' | 'female' | 'unspecified';
  legalLimit: number;
  monthlyBudgetGoal: number;
  onboardingCompleted: boolean;
  updatedAt: string;
}

export const profileService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    const response = await listDocuments(COLLECTIONS.USER_PROFILES, [Query.equal('userId', userId)]);
    if (response.documents.length === 0) return null;
    const doc = response.documents[0] as ProfileDoc;
    return {
      id: doc.$id,
      userId: doc.userId,
      weightKg: doc.weightKg || 70,
      sex: (doc.sex as 'male' | 'female' | 'unspecified') || 'unspecified',
      legalLimit: doc.legalLimit || 0.5,
      monthlyBudgetGoal: doc.monthlyBudgetGoal || 100,
      onboardingCompleted: doc.onboardingCompleted || false,
      updatedAt: doc.$updatedAt,
    };
  },

  async createOrUpdateProfile(userId: string, data: {
    weightKg?: number;
    sex?: 'male' | 'female' | 'unspecified';
    legalLimit?: number;
    monthlyBudgetGoal?: number;
    onboardingCompleted?: boolean;
  }): Promise<UserProfile> {
    const existing = await this.getProfile(userId);
    if (existing) {
      const doc: ProfileDoc = await updateDocument(COLLECTIONS.USER_PROFILES, existing.id, {
        weightKg: data.weightKg ?? existing.weightKg,
        sex: data.sex ?? existing.sex,
        legalLimit: data.legalLimit ?? existing.legalLimit,
        monthlyBudgetGoal: data.monthlyBudgetGoal ?? existing.monthlyBudgetGoal,
        onboardingCompleted: data.onboardingCompleted ?? existing.onboardingCompleted,
      }) as ProfileDoc;
      return {
        id: doc.$id,
        userId: doc.userId,
        weightKg: doc.weightKg || 70,
        sex: (doc.sex as 'male' | 'female' | 'unspecified') || 'unspecified',
        legalLimit: doc.legalLimit || 0.5,
        monthlyBudgetGoal: doc.monthlyBudgetGoal || 100,
        onboardingCompleted: doc.onboardingCompleted ?? false,
        updatedAt: doc.$updatedAt,
      };
    }
    const doc: ProfileDoc = await createDocument(COLLECTIONS.USER_PROFILES, {
      userId,
      weightKg: data.weightKg || 70,
      sex: data.sex || 'unspecified',
      legalLimit: data.legalLimit || 0.5,
      monthlyBudgetGoal: data.monthlyBudgetGoal || 100,
      onboardingCompleted: data.onboardingCompleted || false,
    }) as ProfileDoc;
    return {
      id: doc.$id,
      userId: doc.userId,
      weightKg: doc.weightKg || 70,
      sex: (doc.sex as 'male' | 'female' | 'unspecified') || 'unspecified',
      legalLimit: doc.legalLimit || 0.5,
      monthlyBudgetGoal: doc.monthlyBudgetGoal || 100,
      onboardingCompleted: doc.onboardingCompleted ?? false,
      updatedAt: doc.$createdAt,
    };
  },
};