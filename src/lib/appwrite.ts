import { Client, Account, Databases, Teams, ID, Query } from 'appwrite';

// Configuration Appwrite - À compléter dans le fichier .env
// ou directement ici si vous préférez

export const APPWRITE_CONFIG = {
  endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID || '',
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || '',
  isSelfHosted: import.meta.env.VITE_APPWRITE_SELF_HOSTED === 'true',
};

// IDs des Collections (à mettre à jour après création dans Appwrite)
export const COLLECTIONS = {
  USERS_PROFILE: import.meta.env.VITE_COLLECTION_USERS_PROFILE || 'users_profile',
  FAMILIES: import.meta.env.VITE_COLLECTION_FAMILIES || 'families',
  FAMILY_MEMBERS: import.meta.env.VITE_COLLECTION_FAMILY_MEMBERS || 'family_members',
  EVENTS: import.meta.env.VITE_COLLECTION_EVENTS || 'events',
  CHORES: import.meta.env.VITE_COLLECTION_CHORES || 'chores',
  BUDGET_ENTRIES: import.meta.env.VITE_COLLECTION_BUDGET_ENTRIES || 'budget_entries',
  BUDGET_CATEGORIES: import.meta.env.VITE_COLLECTION_BUDGET_CATEGORIES || 'budget_categories',
  ALCOHOL_LOGS: import.meta.env.VITE_COLLECTION_ALCOHOL_LOGS || 'alcohol_logs',
};

// Client Appwrite
const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId);

// Services
export const account = new Account(client);
export const databases = new Databases(client);
export const teams = new Teams(client);

// Helper pour créer un document
export const createDocument = async (
  collectionId: string,
  data: Record<string, unknown>
) => {
  return databases.createDocument(
    APPWRITE_CONFIG.databaseId,
    collectionId,
    ID.unique(),
    data
  );
};

// Helper pour lister des documents
export const listDocuments = async (
  collectionId: string,
  queries: string[] = []
) => {
  return databases.listDocuments(
    APPWRITE_CONFIG.databaseId,
    collectionId,
    queries
  );
};

// Helper pour mettre à jour un document
export const updateDocument = async (
  collectionId: string,
  documentId: string,
  data: Record<string, unknown>
) => {
  return databases.updateDocument(
    APPWRITE_CONFIG.databaseId,
    collectionId,
    documentId,
    data
  );
};

// Helper pour supprimer un document
export const deleteDocument = async (
  collectionId: string,
  documentId: string
) => {
  return databases.deleteDocument(
    APPWRITE_CONFIG.databaseId,
    collectionId,
    documentId
  );
};

export { client, ID, Query };