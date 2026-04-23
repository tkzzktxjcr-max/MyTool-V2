import { account, databases, APPWRITE_CONFIG, COLLECTIONS, ID, Query } from '@/lib/appwrite';
import type { AuthUser, UserProfile } from './types';

export const authService = {
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const user = await account.get();
      return { $id: user.$id, email: user.email, name: user.name };
    } catch { return null; }
  },

  async login(email: string, password: string): Promise<void> {
    await account.createEmailPasswordSession(email, password);
  },

  async register(email: string, password: string, name: string): Promise<AuthUser> {
    await account.create(ID.unique(), email, password, name);
    await account.createEmailPasswordSession(email, password);
    const user = await account.get();
    return { $id: user.$id, email: user.email, name: user.name };
  },

  async logout(): Promise<void> {
    await account.deleteSession('current');
  },

  async getProfile(userId: string): Promise<UserProfile | null> {
    const response = await databases.listDocuments(APPWRITE_CONFIG.databaseId, COLLECTIONS.USERS_PROFILE, [Query.equal('userId', userId)]);
    if (response.documents.length === 0) return null;
    const doc = response.documents[0];
    return { id: doc.$id, userId: doc.userId, email: doc.email, name: doc.name, familyId: doc.familyId, avatar: doc.avatar, createdAt: doc.$createdAt };
  },

  async createProfile(userId: string, email: string, name: string): Promise<UserProfile> {
    const doc = await databases.createDocument(APPWRITE_CONFIG.databaseId, COLLECTIONS.USERS_PROFILE, ID.unique(), { userId, email, name, createdAt: new Date().toISOString() });
    return { id: doc.$id, userId: doc.userId, email: doc.email, name: doc.name, createdAt: doc.$createdAt };
  },

  async updateProfile(profileId: string, data: Partial<UserProfile>): Promise<void> {
    await databases.updateDocument(APPWRITE_CONFIG.databaseId, COLLECTIONS.USERS_PROFILE, profileId, data);
  },
};