import { createDocument, listDocuments, updateDocument, deleteDocument, Query } from '@/lib/appwrite';
import { COLLECTIONS } from '@/lib/appwrite';
import type { DrinkType } from '../types';

export interface Drink {
  id: string;
  name: string;
  type: DrinkType;
  abv: number;
  defaultServingSize: number;
  emoji: string;
  country?: string;
  isFavorite: boolean;
  usageCount: number;
  userId?: string;
  createdAt: string;
}

export const drinksService = {
  async getAllDrinks(): Promise<Drink[]> {
    try {
      const response = await listDocuments(COLLECTIONS.DRINKS, []);
      return response.documents.map((doc: any) => ({
        id: doc.$id,
        name: doc.name,
        type: doc.type as DrinkType,
        abv: doc.abv,
        defaultServingSize: doc.defaultServingSize,
        emoji: doc.emoji,
        country: doc.country,
        isFavorite: doc.isFavorite || false,
        usageCount: doc.usageCount || 0,
        userId: doc.userId,
        createdAt: doc.$createdAt,
      }));
    } catch (error) {
      console.warn('[drinksService] Error:', error);
      return [];
    }
  },

  async getDrinksByUser(userId: string): Promise<Drink[]> {
    try {
      const response = await listDocuments(COLLECTIONS.DRINKS, [Query.equal('userId', userId)]);
      return response.documents.map((doc: any) => ({
        id: doc.$id,
        name: doc.name,
        type: doc.type as DrinkType,
        abv: doc.abv,
        defaultServingSize: doc.defaultServingSize,
        emoji: doc.emoji,
        country: doc.country,
        isFavorite: doc.isFavorite || false,
        usageCount: doc.usageCount || 0,
        userId: doc.userId,
        createdAt: doc.$createdAt,
      }));
    } catch (error) {
      console.warn('[drinksService] getDrinksByUser failed:', error);
      return [];
    }
  },

  async getUserDrinkPreference(userId: string, drinkType: DrinkType): Promise<Drink | null> {
    try {
      const response = await listDocuments(COLLECTIONS.DRINKS, [
        Query.equal('userId', userId),
        Query.equal('type', drinkType),
      ]);
      
      if (response.documents.length > 0) {
        const doc = response.documents[0];
        return {
          id: doc.$id,
          name: doc.name,
          type: doc.type as DrinkType,
          abv: doc.abv,
          defaultServingSize: doc.defaultServingSize,
          emoji: doc.emoji,
          country: doc.country,
          isFavorite: doc.isFavorite || false,
          usageCount: doc.usageCount || 0,
          userId: doc.userId,
          createdAt: doc.$createdAt,
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  async createDrink(data: {
    name: string;
    type: DrinkType;
    abv: number;
    defaultServingSize: number;
    emoji: string;
    country?: string;
    userId?: string;
  }): Promise<Drink> {
    const doc: any = await createDocument(COLLECTIONS.DRINKS, {
      name: data.name,
      type: data.type,
      abv: data.abv,
      defaultServingSize: data.defaultServingSize,
      emoji: data.emoji,
      country: data.country || null,
      isFavorite: false,
      usageCount: 0,
      userId: data.userId || null,
    });
    
    return {
      id: doc.$id,
      name: doc.name,
      type: doc.type as DrinkType,
      abv: doc.abv,
      defaultServingSize: doc.defaultServingSize,
      emoji: doc.emoji,
      country: doc.country,
      isFavorite: false,
      usageCount: 0,
      userId: doc.userId,
      createdAt: doc.$createdAt,
    };
  },

  async setUserDrinkPreference(
    userId: string,
    data: {
      type: DrinkType;
      name: string;
      abv: number;
      defaultServingSize: number;
      emoji: string;
      country?: string;
    }
  ): Promise<Drink> {
    const existing = await this.getUserDrinkPreference(userId, data.type);
    
    if (existing) {
      const doc: any = await updateDocument(COLLECTIONS.DRINKS, existing.id, {
        name: data.name,
        abv: data.abv,
        defaultServingSize: data.defaultServingSize,
        emoji: data.emoji,
        country: data.country || null,
      });
      
      return {
        id: doc.$id,
        name: doc.name,
        type: doc.type as DrinkType,
        abv: doc.abv,
        defaultServingSize: doc.defaultServingSize,
        emoji: doc.emoji,
        country: doc.country,
        isFavorite: doc.isFavorite || false,
        usageCount: doc.usageCount || 0,
        userId: doc.userId,
        createdAt: doc.$createdAt,
      };
    }
    
    return this.createDrink({ ...data, userId });
  },

  async incrementUsage(drinkId: string): Promise<void> {
    try {
      await updateDocument(COLLECTIONS.DRINKS, drinkId, {
        usageCount: { increment: 1 },
      });
    } catch (error) {
      console.warn('[drinksService] incrementUsage failed:', error);
    }
  },

  async deleteDrink(drinkId: string): Promise<void> {
    try {
      await deleteDocument(COLLECTIONS.DRINKS, drinkId);
    } catch (error) {
      console.warn('[drinksService] deleteDrink failed:', error);
    }
  },
};