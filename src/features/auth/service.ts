import { account, databases, APPWRITE_CONFIG, COLLECTIONS, ID, Query } from '@/lib/appwrite';
import type { AuthUser, UserProfile } from './types';

// Custom error thrown when account is created but session fails due to Appwrite propagation latency
export class LoginPendingError extends Error {
  constructor(message: string = 'Inscription réussie mais connexion en attente') {
    super(message);
    this.name = 'LoginPendingError';
  }
}

// Retry helper with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number,
  baseDelayMs: number
): Promise<T> {
  let lastError: any;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

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
    try {
      await withRetry(() => account.createEmailPasswordSession(email, password), 4, 200);
    } catch {
      throw new LoginPendingError();
    }
    try {
      const user = await account.get();
      return { $id: user.$id, email: user.email, name: user.name };
    } catch {
      // Session was created but account.get failed transiently — treat as pending login
      throw new LoginPendingError('Inscription réussie ! Veuillez vous connecter');
    }
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