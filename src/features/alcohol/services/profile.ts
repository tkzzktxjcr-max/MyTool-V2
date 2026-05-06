import { account, createDocument, listDocuments, updateDocument, Query, Permission, Role } from '@/lib/appwrite';
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
    const currentUser = await account.get();
    if (currentUser.$id !== userId) throw new Error('Unauthorized');
    const response = await listDocuments(COLLECTIONS.USER_PROFILES, [Query.equal('userId', userId)]);
    if (response.documents.length === 0) return null;
    const doc = response.documents[0] as unknown as ProfileDoc;
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
    const currentUser = await account.get();
    if (currentUser.$id !== userId) throw new Error('Unauthorized');
    const existing = await this.getProfile(userId);
    if (existing) {
      if (existing.userId !== userId) throw new Error('Unauthorized');
      const doc = await updateDocument(COLLECTIONS.USER_PROFILES, existing.id, {
        weightKg: data.weightKg ?? existing.weightKg,
        sex: data.sex ?? existing.sex,
        legalLimit: data.legalLimit ?? existing.legalLimit,
        monthlyBudgetGoal: data.monthlyBudgetGoal ?? existing.monthlyBudgetGoal,
        onboardingCompleted: data.onboardingCompleted ?? existing.onboardingCompleted,
      });
      const updated = doc as unknown as ProfileDoc;
      return {
        id: updated.$id,
        userId: updated.userId,
        weightKg: updated.weightKg || 70,
        sex: (updated.sex as 'male' | 'female' | 'unspecified') || 'unspecified',
        legalLimit: updated.legalLimit || 0.5,
        monthlyBudgetGoal: updated.monthlyBudgetGoal || 100,
        onboardingCompleted: updated.onboardingCompleted ?? false,
        updatedAt: updated.$updatedAt,
      };
    }
    const doc = await createDocument(COLLECTIONS.USER_PROFILES, {
      userId,
      weightKg: data.weightKg || 70,
      sex: data.sex || 'unspecified',
      legalLimit: data.legalLimit || 0.5,
      monthlyBudgetGoal: data.monthlyBudgetGoal || 100,
      onboardingCompleted: data.onboardingCompleted || false,
    }, [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ]);
    const created = doc as unknown as ProfileDoc;
    return {
      id: created.$id,
      userId: created.userId,
      weightKg: created.weightKg || 70,
      sex: (created.sex as 'male' | 'female' | 'unspecified') || 'unspecified',
      legalLimit: created.legalLimit || 0.5,
      monthlyBudgetGoal: created.monthlyBudgetGoal || 100,
      onboardingCompleted: created.onboardingCompleted ?? false,
      updatedAt: created.$createdAt,
    };
  },
};