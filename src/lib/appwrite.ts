import { Client, Account, Databases, ID, Query } from 'appwrite';

export const APPWRITE_CONFIG = {
  endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID || '',
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || '',
};

export const COLLECTIONS = {
  USERS_PROFILE: import.meta.env.VITE_COLLECTION_USERS_PROFILE || 'users_profile',
  FAMILIES: import.meta.env.VITE_COLLECTION_FAMILIES || 'families',
  FAMILY_MEMBERS: import.meta.env.VITE_COLLECTION_FAMILY_MEMBERS || 'family_members',
  EVENTS: import.meta.env.VITE_COLLECTION_EVENTS || 'events',
  CHORES: import.meta.env.VITE_COLLECTION_CHORES || 'chores',
  BUDGET_ENTRIES: import.meta.env.VITE_COLLECTION_BUDGET_ENTRIES || 'budget_entries',
  ALCOHOL_LOGS: import.meta.env.VITE_COLLECTION_ALCOHOL_LOGS || 'alcohol_logs',
  DRINKS: import.meta.env.VITE_COLLECTION_DRINKS || 'drinks',
  GOALS: import.meta.env.VITE_COLLECTION_GOALS || 'goals',
  USER_PROFILES: import.meta.env.VITE_COLLECTION_USER_PROFILES || 'user_profiles',
};

const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId);

export const account = new Account(client);
export const databases = new Databases(client);

export const createDocument = async (collectionId: string, data: Record<string, unknown>) => {
  console.log('[Appwrite] Creating document in collection:', collectionId);
  console.log('[Appwrite] Document data:', JSON.stringify(data, null, 2));
  try {
    const result = await databases.createDocument(APPWRITE_CONFIG.databaseId, collectionId, ID.unique(), data);
    console.log('[Appwrite] Document created:', result.$id);
    return result;
  } catch (error) {
    console.error('[Appwrite] Error creating document:', error);
    throw error;
  }
};

export const listDocuments = async (collectionId: string, queries: string[] = []) => {
  console.log('[Appwrite] Listing documents from collection:', collectionId);
  try {
    const result = await databases.listDocuments(APPWRITE_CONFIG.databaseId, collectionId, queries);
    console.log('[Appwrite] Found', result.documents.length, 'documents');
    return result;
  } catch (error) {
    console.error('[Appwrite] Error listing documents:', error);
    throw error;
  }
};

export const updateDocument = async (collectionId: string, documentId: string, data: Record<string, unknown>) => {
  console.log('[Appwrite] Updating document:', collectionId, documentId);
  return databases.updateDocument(APPWRITE_CONFIG.databaseId, collectionId, documentId, data);
};

export const deleteDocument = async (collectionId: string, documentId: string) => {
  console.log('[Appwrite] Deleting document:', collectionId, documentId);
  return databases.deleteDocument(APPWRITE_CONFIG.databaseId, collectionId, documentId);
};

export { client, ID, Query };