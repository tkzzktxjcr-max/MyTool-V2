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
  
  // Alcohol tracking
  ALCOHOL_LOGS: import.meta.env.VITE_COLLECTION_ALCOHOL_LOGS || 'alcohol_logs',
  CUSTOM_DRINKS: import.meta.env.VITE_COLLECTION_CUSTOM_DRINKS || 'custom_drinks',
  ALCOHOL_GOALS: import.meta.env.VITE_COLLECTION_ALCOHOL_GOALS || 'alcohol_goals',
};

const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId);

export const account = new Account(client);
export const databases = new Databases(client);

export const createDocument = async (collectionId: string, data: Record<string, unknown>) => {
  return databases.createDocument(APPWRITE_CONFIG.databaseId, collectionId, ID.unique(), data);
};

export const listDocuments = async (collectionId: string, queries: string[] = []) => {
  return databases.listDocuments(APPWRITE_CONFIG.databaseId, collectionId, queries);
};

export const updateDocument = async (collectionId: string, documentId: string, data: Record<string, unknown>) => {
  return databases.updateDocument(APPWRITE_CONFIG.databaseId, collectionId, documentId, data);
};

export const deleteDocument = async (collectionId: string, documentId: string) => {
  return databases.deleteDocument(APPWRITE_CONFIG.databaseId, collectionId, documentId);
};

export { client, ID, Query };