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
  favoriteRank?: number;
  usageCount: number;
  userId?: string;
  isGlobal: boolean;
  popularity: number;
  category?: string;
  brand?: string;
  createdAt: string;
}

const mapDocToDrink = (doc: any): Drink => ({
  id: doc.$id,
  name: doc.name,
  type: doc.type as DrinkType,
  abv: doc.abv,
  defaultServingSize: doc.defaultServingSize || doc.servingSize || 33,
  emoji: doc.emoji,
  country: doc.country,
  isFavorite: doc.isFavorite || false,
  favoriteRank: doc.favoriteRank,
  usageCount: doc.usageCount || 0,
  userId: doc.userId,
  isGlobal: doc.isGlobal || false,
  popularity: doc.popularity || 0,
  category: doc.category,
  brand: doc.brand,
  createdAt: doc.$createdAt,
});

// Helper to get all documents with pagination
async function getAllDocuments(collectionId: string): Promise<any[]> {
  const allDocs: any[] = [];
  let offset = 0;
  const limit = 100; // Get 100 at a time
  
  while (true) {
    const response = await listDocuments(collectionId, [
      Query.limit(limit),
      Query.offset(offset),
    ]);
    
    allDocs.push(...response.documents);
    
    // Check if there are more documents
    if (response.documents.length < limit) {
      break;
    }
    
    offset += limit;
    
    // Safety: don't fetch more than 1000 documents
    if (allDocs.length >= 1000) {
      console.warn('[drinksService] Stopped at 1000 documents');
      break;
    }
  }
  
  console.log(`[drinksService] Fetched ${allDocs.length} total documents`);
  return allDocs;
}

export const drinksService = {
  async getAllDrinks(): Promise<Drink[]> {
    console.log('[drinksService] getAllDrinks called, collection:', COLLECTIONS.DRINKS);
    try {
      const allDocs = await getAllDocuments(COLLECTIONS.DRINKS);
      console.log('[drinksService] Success! Found', allDocs.length, 'drinks');
      return allDocs.map(mapDocToDrink);
    } catch (error: any) {
      console.error('[drinksService] Error loading drinks:', error?.message || error);
      return [];
    }
  },

  async getLibraryDrinks(): Promise<Drink[]> {
    console.log('[drinksService] getLibraryDrinks called');
    try {
      const response = await listDocuments(COLLECTIONS.DRINKS, [
        Query.equal('isGlobal', true),
      ]);
      console.log('[drinksService] Found', response.documents.length, 'library drinks');
      return response.documents.map(mapDocToDrink);
    } catch (error: any) {
      console.error('[drinksService] getLibraryDrinks failed:', error?.message || error);
      return [];
    }
  },

  async getUserDrinks(userId: string): Promise<Drink[]> {
    try {
      const response = await listDocuments(COLLECTIONS.DRINKS, [
        Query.equal('userId', userId),
      ]);
      return response.documents.map(mapDocToDrink);
    } catch (error) {
      console.warn('[drinksService] getUserDrinks failed:', error);
      return [];
    }
  },

  async getDrinksByUser(userId: string): Promise<Drink[]> {
    return this.getUserDrinks(userId);
  },

  async getUserDrinkPreference(userId: string, drinkType: DrinkType): Promise<Drink | null> {
    try {
      const response = await listDocuments(COLLECTIONS.DRINKS, [
        Query.equal('userId', userId),
        Query.equal('type', drinkType),
      ]);
      
      if (response.documents.length > 0) {
        return mapDocToDrink(response.documents[0]);
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
    isGlobal?: boolean;
    category?: string;
    brand?: string;
  }): Promise<Drink> {
    const doc: any = await createDocument(COLLECTIONS.DRINKS, {
      name: data.name,
      type: data.type,
      abv: data.abv,
      defaultServingSize: data.defaultServingSize,
      emoji: data.emoji,
      country: data.country || null,
      isFavorite: false,
      favoriteRank: null,
      usageCount: 0,
      userId: data.userId || null,
      isGlobal: data.isGlobal || false,
      popularity: 0,
      category: data.category || null,
      brand: data.brand || null,
    });
    
    return mapDocToDrink(doc);
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
      
      return mapDocToDrink(doc);
    }
    
    return this.createDrink({ ...data, userId });
  },

  async toggleFavorite(drinkId: string, rank?: number): Promise<void> {
    try {
      const currentDoc = await listDocuments(COLLECTIONS.DRINKS, [
        Query.equal('$id', drinkId),
      ]);
      
      if (currentDoc.documents.length === 0) return;
      
      const doc = currentDoc.documents[0];
      const currentlyFavorite = doc.isFavorite || false;
      
      if (currentlyFavorite) {
        await updateDocument(COLLECTIONS.DRINKS, drinkId, {
          isFavorite: false,
          favoriteRank: null,
        });
      } else {
        await updateDocument(COLLECTIONS.DRINKS, drinkId, {
          isFavorite: true,
          favoriteRank: rank || 1,
        });
      }
    } catch (error) {
      console.warn('[drinksService] toggleFavorite failed:', error);
    }
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

  async updateDrink(drinkId: string, data: Partial<{
    name: string;
    abv: number;
    defaultServingSize: number;
    emoji: string;
    country?: string;
  }>): Promise<void> {
    try {
      await updateDocument(COLLECTIONS.DRINKS, drinkId, data);
    } catch (error) {
      console.warn('[drinksService] updateDrink failed:', error);
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