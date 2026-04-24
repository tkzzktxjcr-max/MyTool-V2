import { databases, APPWRITE_CONFIG, COLLECTIONS, createDocument, listDocuments, updateDocument, deleteDocument, Query } from '@/lib/appwrite';
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

const DEFAULT_SIZES: Record<DrinkType, number> = {
  beer: 33,
  wine: 12,
  spirit: 4,
  cocktail: 20,
  cider: 33,
  other: 25,
  custom: 25,
};

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
        isFavorite: doc.isFavorite || false,
        usageCount: doc.usageCount || 0,
        userId: doc.userId,
        createdAt: doc.$createdAt,
      }));
    } catch (error) {
      console.warn('[drinksService] Collection drinks non trouvée, utilisation des defaults', error);
      return this.getDefaultDrinks();
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
      createdAt: new Date().toISOString(),
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
    }
  ): Promise<Drink> {
    try {
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
    } catch (error) {
      console.warn('[drinksService] setUserDrinkPreference failed', error);
      // Retourner un drink local en cas d'erreur
      return {
        id: `local-${data.type}`,
        name: data.name,
        type: data.type,
        abv: data.abv,
        defaultServingSize: data.defaultServingSize,
        emoji: data.emoji,
        isFavorite: false,
        usageCount: 0,
        userId,
        createdAt: new Date().toISOString(),
      };
    }
  },

  async incrementUsage(drinkId: string): Promise<void> {
    try {
      await updateDocument(COLLECTIONS.DRINKS, drinkId, {
        usageCount: { increment: 1 },
      });
    } catch (error) {
      console.warn('[drinksService] incrementUsage failed for', drinkId, error);
    }
  },

  async deleteDrink(drinkId: string): Promise<void> {
    try {
      await deleteDocument(COLLECTIONS.DRINKS, drinkId);
    } catch (error) {
      console.warn('[drinksService] deleteDrink failed', error);
    }
  },

  async ensureUserHasDrinks(userId: string): Promise<Drink[]> {
    try {
      const userDrinks = await this.getDrinksByUser(userId);
      if (userDrinks.length > 0) {
        return userDrinks;
      }
      return this.resetToDefaults(userId);
    } catch (error) {
      console.warn('[drinksService] ensureUserHasDrinks failed, returning defaults', error);
      return this.getDefaultDrinks();
    }
  },

  async resetToDefaults(userId: string): Promise<Drink[]> {
    const drinks: Drink[] = [];
    for (const [type, data] of Object.entries(DRINK_TYPES)) {
      const drinkType = type as DrinkType;
      try {
        const drink = await this.createDrink({
          name: data.label,
          type: drinkType,
          abv: data.defaultAbv,
          defaultServingSize: DEFAULT_SIZES[drinkType],
          emoji: data.icon,
          userId,
        });
        drinks.push(drink);
      } catch (error) {
        console.warn('[drinksService] Failed to create drink', drinkType, error);
        drinks.push({
          id: `local-${drinkType}`,
          name: data.label,
          type: drinkType,
          abv: data.defaultAbv,
          defaultServingSize: DEFAULT_SIZES[drinkType],
          emoji: data.icon,
          isFavorite: false,
          usageCount: 0,
          userId,
          createdAt: new Date().toISOString(),
        });
      }
    }
    return drinks;
  },

  async getDrinksWithPreferences(userId: string): Promise<Drink[]> {
    try {
      const userDrinks = await this.getDrinksByUser(userId);
      const userTypes = new Set(userDrinks.map(d => d.type));
      
      const missingDefaults: Drink[] = [];
      for (const [type, data] of Object.entries(DRINK_TYPES)) {
        const drinkType = type as DrinkType;
        if (!userTypes.has(drinkType)) {
          missingDefaults.push({
            id: `default-${drinkType}`,
            name: data.label,
            type: drinkType,
            abv: data.defaultAbv,
            defaultServingSize: DEFAULT_SIZES[drinkType],
            emoji: data.icon,
            isFavorite: false,
            usageCount: 0,
            userId: undefined,
            createdAt: '',
          });
        }
      }
      
      return [...userDrinks, ...missingDefaults];
    } catch (error) {
      console.warn('[drinksService] getDrinksWithPreferences failed, returning defaults', error);
      return this.getDefaultDrinks();
    }
  },

  getDefaultDrinks(): Drink[] {
    const drinks: Drink[] = [];
    for (const [type, data] of Object.entries(DRINK_TYPES)) {
      const drinkType = type as DrinkType;
      drinks.push({
        id: `default-${drinkType}`,
        name: data.label,
        type: drinkType,
        abv: data.defaultAbv,
        defaultServingSize: DEFAULT_SIZES[drinkType],
        emoji: data.icon,
        isFavorite: false,
        usageCount: 0,
        userId: undefined,
        createdAt: '',
      });
    }
    return drinks;
  },
};