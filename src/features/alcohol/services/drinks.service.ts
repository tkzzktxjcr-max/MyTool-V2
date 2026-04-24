import { createDocument, listDocuments, updateDocument, deleteDocument, Query } from '@/lib/appwrite';
import { COLLECTIONS } from '@/lib/appwrite';
import type { DrinkType } from '../types';
import { DRINK_TYPES } from '../types';

export interface Drink {
  id: string;
  name: string;
  type: DrinkType;
  abv: number;
  defaultServingSize: number;
  emoji: string;
  isFavorite: boolean;
  usageCount: number;
  userId?: string;
  createdAt: string;
}

// Default serving sizes per type
const DEFAULT_SIZES: Record<string, number> = {
  beer: 33,
  lager: 33,
  pilsner: 33,
  stout: 44,
  wheat_beer: 50,
  ipa: 33,
  ale: 33,
  wine: 15,
  red_wine: 15,
  white_wine: 15,
  rose_wine: 15,
  champagne: 10,
  sparkling: 10,
  spirit: 4,
  whisky: 4,
  vodka: 4,
  rum: 4,
  tequila: 4,
  gin: 4,
  brandy: 4,
  cognac: 4,
  calvados: 4,
  cocktail: 20,
  martini: 10,
  mojito: 30,
  margarita: 25,
  old_fashioned: 8,
  cosmopolitan: 15,
  daiquiri: 15,
  pina_colada: 30,
  aperol_spritz: 20,
  sake: 10,
  soju: 4,
  sangria: 25,
  sherry: 8,
  port: 8,
  cider: 33,
  other: 25,
  custom: 25,
};

export const drinksService = {
  /**
   * Get all drinks from database (global + user-specific)
   * Returns empty array if no drinks in database
   */
  async getAllDrinks(): Promise<Drink[]> {
    try {
      const response = await listDocuments(COLLECTIONS.DRINKS, []);
      
      if (response.documents.length === 0) {
        console.log('[drinksService] No drinks in database yet');
        return [];
      }
      
      return response.documents.map((doc: any) => ({
        id: doc.$id,
        name: doc.name,
        type: doc.type as DrinkType,
        abv: doc.abv,
        defaultServingSize: doc.defaultServingSize,
        emoji: doc.emoji,
        isFavorite: doc.isFavorite || false,
        usageCount: doc.usageCount || 0,
        userId: doc.userId || undefined,
        createdAt: doc.$createdAt,
      }));
    } catch (error) {
      console.warn('[drinksService] Error getting drinks from database:', error);
      return [];
    }
  },

  /**
   * Get user-specific drinks
   */
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
        isFavorite: doc.isFavorite || false,
        usageCount: doc.usageCount || 0,
        userId: doc.userId,
        createdAt: doc.$createdAt,
      }));
    } catch (error) {
      console.warn('[drinksService] getDrinksByUser failed', error);
      return [];
    }
  },

  /**
   * Get user's custom preference for a specific drink type
   */
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
          isFavorite: doc.isFavorite || false,
          usageCount: doc.usageCount || 0,
          userId: doc.userId,
          createdAt: doc.$createdAt,
        };
      }
      return null;
    } catch (error) {
      console.warn('[drinksService] getUserDrinkPreference failed', error);
      return null;
    }
  },

  /**
   * Create a new drink in the database
   */
  async createDrink(data: {
    name: string;
    type: DrinkType;
    abv: number;
    defaultServingSize: number;
    emoji: string;
    userId?: string;
  }): Promise<Drink> {
    const doc: any = await createDocument(COLLECTIONS.DRINKS, {
      name: data.name,
      type: data.type,
      abv: data.abv,
      defaultServingSize: data.defaultServingSize,
      emoji: data.emoji,
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
      isFavorite: false,
      usageCount: 0,
      userId: doc.userId || undefined,
      createdAt: doc.$createdAt,
    };
  },

  /**
   * Create or update user preference for a drink type
   */
  async setUserDrinkPreference(
    userId: string,
    data: {
      type: DrinkType;
      name: string;
      abv: number;
      defaultServingSize: number;
      emoji: string;
    }
  ): Promise<Drink> {
    const existing = await this.getUserDrinkPreference(userId, data.type);
    
    if (existing) {
      const doc: any = await updateDocument(COLLECTIONS.DRINKS, existing.id, {
        name: data.name,
        abv: data.abv,
        defaultServingSize: data.defaultServingSize,
        emoji: data.emoji,
      });
      
      return {
        id: doc.$id,
        name: doc.name,
        type: doc.type as DrinkType,
        abv: doc.abv,
        defaultServingSize: doc.defaultServingSize,
        emoji: doc.emoji,
        isFavorite: doc.isFavorite || false,
        usageCount: doc.usageCount || 0,
        userId: doc.userId,
        createdAt: doc.$createdAt,
      };
    }
    
    return this.createDrink({ ...data, userId });
  },

  /**
   * Increment usage count for a drink
   */
  async incrementUsage(drinkId: string): Promise<void> {
    try {
      await updateDocument(COLLECTIONS.DRINKS, drinkId, {
        usageCount: { increment: 1 },
      });
    } catch (error) {
      console.warn('[drinksService] incrementUsage failed', error);
    }
  },

  /**
   * Delete a user-specific drink
   */
  async deleteDrink(drinkId: string): Promise<void> {
    try {
      await deleteDocument(COLLECTIONS.DRINKS, drinkId);
    } catch (error) {
      console.warn('[drinksService] deleteDrink failed', error);
    }
  },

  /**
   * Delete all user-specific drinks
   */
  async deleteAllUserDrinks(userId: string): Promise<void> {
    try {
      const drinks = await this.getDrinksByUser(userId);
      for (const drink of drinks) {
        await this.deleteDrink(drink.id);
      }
    } catch (error) {
      console.warn('[drinksService] deleteAllUserDrinks failed', error);
    }
  },

  /**
   * Get drinks with user preferences merged
   * Returns only drinks that exist in the database
   */
  async getDrinksWithPreferences(userId: string): Promise<Drink[]> {
    const allDrinks = await this.getAllDrinks();
    const userDrinks = await this.getDrinksByUser(userId);
    
    // User drinks override global drinks of same type
    const userTypes = new Set(userDrinks.map(d => d.type));
    
    const globalDrinks = allDrinks.filter(d => !d.userId && !userTypes.has(d.type));
    
    return [...userDrinks, ...globalDrinks];
  },
};