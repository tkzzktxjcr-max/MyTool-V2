import { databases, APPWRITE_CONFIG, COLLECTIONS, createDocument, deleteDocument, Query } from '@/lib/appwrite';
import type { AlcoholLog, CreateAlcoholLogForm, DrinkType } from './types';

export const alcoholService = {
  async getLogs(userId: string): Promise<AlcoholLog[]> {
    const response = await databases.listDocuments(APPWRITE_CONFIG.databaseId, COLLECTIONS.ALCOHOL_LOGS, [Query.equal('userId', userId)]);
    return response.documents.map((doc: any) => ({ id: doc.$id, userId: doc.userId, date: doc.date, drinkType: doc.drinkType as DrinkType, volumeCl: doc.volumeCl, abv: doc.abv, units: doc.units }));
  },

  async createLog(userId: string, form: CreateAlcoholLogForm): Promise<AlcoholLog> {
    const units = (form.volumeCl * form.abv) / 10;
    const doc = await createDocument(COLLECTIONS.ALCOHOL_LOGS, { userId, date: new Date().toISOString(), drinkType: form.drinkType, volumeCl: form.volumeCl, abv: form.abv, units });
    return { id: doc.$id, userId: doc.userId, date: doc.date, drinkType: doc.drinkType as DrinkType, volumeCl: doc.volumeCl, abv: doc.abv, units: doc.units };
  },

  async deleteLog(logId: string): Promise<void> { await deleteDocument(COLLECTIONS.ALCOHOL_LOGS, logId); },
};