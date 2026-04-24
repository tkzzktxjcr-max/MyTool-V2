import { databases, APPWRITE_CONFIG, COLLECTIONS, createDocument, listDocuments, updateDocument, Query } from '@/lib/appwrite';

export interface UserProfile {
  id: string;
  userId: string;
  weightKg: number;
  sex: 'male' | 'female' | 'unspecified';
  legalLimit: number;
  updatedAt: string;
}

export const profileService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const response = await listDocuments(COLLECTIONS.USER_PROFILES, [
        Query.equal('userId', userId),
      ]);
      
      if (response.documents.length === 0) return null;
      
      const doc = response.documents[0];
      return {
        id: doc.$id,
        userId: doc.userId,
        weightKg: doc.weightKg || 70,
        sex: doc.sex || 'unspecified',
        legalLimit: doc.legalLimit || 0.5,
        updatedAt: doc.$updatedAt,
      };
    } catch (error) {
      console.warn('[profileService] getProfile failed', error);
      return null;
    }
  },

  async createOrUpdateProfile(userId: string, data: {
    weightKg?: number;
    sex?: 'male' | 'female' | 'unspecified';
    legalLimit?: number;
  }): Promise<UserProfile> {
    try {
      const existing = await this.getProfile(userId);
      
      if (existing) {
        const doc: any = await updateDocument(COLLECTIONS.USER_PROFILES, existing.id, {
          weightKg: data.weightKg ?? existing.weightKg,
          sex: data.sex ?? existing.sex,
          legalLimit: data.legalLimit ?? existing.legalLimit,
        });
        
        return {
          id: doc.$id,
          userId: doc.userId,
          weightKg: doc.weightKg,
          sex: doc.sex,
          legalLimit: doc.legalLimit,
          updatedAt: doc.$updatedAt,
        };
      }
      
      const doc: any = await createDocument(COLLECTIONS.USER_PROFILES, {
        userId,
        weightKg: data.weightKg || 70,
        sex: data.sex || 'unspecified',
        legalLimit: data.legalLimit || 0.5,
        createdAt: new Date().toISOString(),
      });
      
      return {
        id: doc.$id,
        userId: doc.userId,
        weightKg: doc.weightKg,
        sex: doc.sex,
        legalLimit: doc.legalLimit,
        updatedAt: doc.$createdAt,
      };
    } catch (error) {
      console.warn('[profileService] createOrUpdateProfile failed, returning local profile', error);
      return {
        id: 'local-profile',
        userId,
        weightKg: data.weightKg || 70,
        sex: data.sex || 'unspecified',
        legalLimit: data.legalLimit || 0.5,
        updatedAt: new Date().toISOString(),
      };
    }
  },
};