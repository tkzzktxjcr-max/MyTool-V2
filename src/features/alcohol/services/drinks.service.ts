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

// Default serving sizes in France (cl)
const DEFAULT_SERVING_SIZES: Record<DrinkType, number> = {
  beer: 33,      // 33cl bottle/half pint
  wine: 12,       // Standard wine glass
  spirit: 4,      // Whisky shot
  cocktail: 20,   // Cocktail glass
  cider: 33,      // Cider bottle
  other: 25,     // Default
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
    const response = await listDocuments(COLLECTIONS.DRINKS, [
      Query.equal('userId', userId),
    ]);
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
      isFavorite: doc.isFavorite || false,
      usageCount: doc.usageCount || 0,
      userId: doc.userId,
      createdAt: doc.$createdAt,
    };
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

  async deleteDrink(drinkId: string): Promise<void> {
    await deleteDocument(COLLECTIONS.DRINKS, drinkId);
  },

  // Seed default drinks with CORRECT serving sizes
  async seedDefaultDrinks(userId: string): Promise<Drink[]> {
    const drinks: Drink[] = [];
    
    for (const [type, data] of Object.entries(DRINK_TYPES)) {
      const drinkType = type as DrinkType;
      const drink = await this.createDrink({
        name: data.label,
        type: drinkType,
        abv: data.defaultAbv,
        defaultServingSize: DEFAULT_SERVING_SIZES[drinkType], // Correct size!
        emoji: data.icon,
        userId,
      });
      drinks.push(drink);
    }
    
    return drinks;
  },

  async ensureUserHasDrinks(userId: string): Promise<Drink[]> {
    const userDrinks = await this.getDrinksByUser(userId);
    
    if (userDrinks.length === 0) {
      return await this.seedDefaultDrinks(userId);
    }
    
    return userDrinks;
  },
};