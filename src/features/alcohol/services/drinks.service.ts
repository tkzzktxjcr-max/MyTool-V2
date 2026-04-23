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

// Tailles par défaut en cl pour chaque type
const DEFAULT_SIZES: Record<DrinkType, number> = {
  beer: 33,      // Bière blonde
  wine: 12,      // Verre de vin
  spirit: 4,     // Shot spiritueux
  cocktail: 20,  // Cocktail
  cider: 33,     // Cidre
  other: 25,     // Autre
  custom: 25,    // Personnalisé
};

export const drinksService = {
  async getAllDrinks(): Promise<Drink[]> {
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
  },

  async getDrinksByUser(userId: string): Promise<Drink[]> {
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
  },

  async getUserDrinkPreference(userId: string, drinkType: DrinkType): Promise<Drink | null> {
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

  async incrementUsage(drinkId: string): Promise<void> {
    const response = await listDocuments(COLLECTIONS.DRINKS, []);
    const drink = response.documents.find((d: any) => d.$id === drinkId);
    if (drink) {
      await updateDocument(COLLECTIONS.DRINKS, drinkId, {
        usageCount: (drink.usageCount || 0) + 1,
      });
    }
  },

  async toggleFavorite(drinkId: string): Promise<boolean> {
    const response = await listDocuments(COLLECTIONS.DRINKS, []);
    const drink = response.documents.find((d: any) => d.$id === drinkId);
    if (drink) {
      const newFavorite = !drink.isFavorite;
      await updateDocument(COLLECTIONS.DRINKS, drinkId, { isFavorite: newFavorite });
      return newFavorite;
    }
    return false;
  },

  async updateDrink(drinkId: string, data: Partial<Drink>): Promise<Drink> {
    const doc: any = await updateDocument(COLLECTIONS.DRINKS, drinkId, data);
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
  },

  async deleteDrink(drinkId: string): Promise<void> {
    await deleteDocument(COLLECTIONS.DRINKS, drinkId);
  },

  async deleteAllUserDrinks(userId: string): Promise<void> {
    const drinks = await this.getDrinksByUser(userId);
    for (const drink of drinks) {
      await this.deleteDrink(drink.id);
    }
  },

  async resetToDefaults(userId: string): Promise<Drink[]> {
    await this.deleteAllUserDrinks(userId);
    
    const drinks: Drink[] = [];
    for (const [type, data] of Object.entries(DRINK_TYPES)) {
      const drinkType = type as DrinkType;
      const drink = await this.createDrink({
        name: data.label,
        type: drinkType,
        abv: data.defaultAbv,
        defaultServingSize: DEFAULT_SIZES[drinkType],
        emoji: data.icon,
        userId,
      });
      drinks.push(drink);
    }
    return drinks;
  },

  async ensureUserHasDrinks(userId: string): Promise<Drink[]> {
    const userDrinks = await this.getDrinksByUser(userId);
    
    if (userDrinks.length > 0) {
      return userDrinks;
    }
    
    return this.resetToDefaults(userId);
  },

  async getDrinksWithPreferences(userId: string): Promise<Drink[]> {
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
  },
};