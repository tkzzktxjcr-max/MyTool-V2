import { createDocument, listDocuments, updateDocument, deleteDocument, Query } from '@/lib/appwrite';
import { COLLECTIONS } from '@/lib/appwrite';
import type { DrinkType } from '../types';

interface DrinkDoc {
  $id: string;
  name: string;
  type: string;
  abv: number;
  defaultServingSize?: number;
  servingSize?: number;
  emoji: string;
  country?: string;
  isFavorite?: boolean;
  favoriteRank?: number | null;
  usageCount?: number;
  userId?: string | null;
  isGlobal?: boolean;
  popularity?: number;
  category?: string | null;
  brand?: string | null;
  $createdAt: string;
}

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

const mapDocToDrink = (doc: DrinkDoc): Drink => ({
  id: doc.$id, name: doc.name, type: doc.type as DrinkType, abv: doc.abv,
  defaultServingSize: doc.defaultServingSize || doc.servingSize || 33, emoji: doc.emoji,
  country: doc.country, isFavorite: doc.isFavorite || false, favoriteRank: doc.favoriteRank ?? undefined,
  usageCount: doc.usageCount || 0, userId: doc.userId ?? undefined, isGlobal: doc.isGlobal || false,
  popularity: doc.popularity || 0, category: doc.category ?? undefined, brand: doc.brand ?? undefined, createdAt: doc.$createdAt,
});

export const drinksService = {
  async getAllDrinks(): Promise<Drink[]> {
    const allDocs: DrinkDoc[] = [];
    let offset = 0;
    while (true) {
      const res = await listDocuments(COLLECTIONS.DRINKS, [Query.limit(100), Query.offset(offset)]);
      allDocs.push(...(res.documents as DrinkDoc[]));
      if (res.documents.length < 100) break;
      offset += 100;
      if (allDocs.length >= 1000) break;
    }
    return allDocs.map(mapDocToDrink);
  },

  async getUserDrinks(userId: string): Promise<Drink[]> {
    const res = await listDocuments(COLLECTIONS.DRINKS, [Query.equal('userId', userId)]);
    return (res.documents as DrinkDoc[]).map(mapDocToDrink);
  },

  async createDrink(data: { name: string; type: DrinkType; abv: number; defaultServingSize: number; emoji: string; country?: string; userId?: string }): Promise<Drink> {
    const doc: DrinkDoc = await createDocument(COLLECTIONS.DRINKS, {
      name: data.name, type: data.type, abv: data.abv, defaultServingSize: data.defaultServingSize,
      emoji: data.emoji, country: data.country || null, isFavorite: false, favoriteRank: null,
      usageCount: 0, userId: data.userId || null, isGlobal: false, popularity: 0, category: null, brand: null,
    }) as DrinkDoc;
    return mapDocToDrink(doc);
  },

  async toggleFavorite(drinkId: string, rank?: number): Promise<void> {
    const res = await listDocuments(COLLECTIONS.DRINKS, [Query.equal('$id', drinkId)]);
    if (res.documents.length === 0) return;
    const doc = res.documents[0];
    if (doc.isFavorite) {
      await updateDocument(COLLECTIONS.DRINKS, drinkId, { isFavorite: false, favoriteRank: null });
    } else {
      await updateDocument(COLLECTIONS.DRINKS, drinkId, { isFavorite: true, favoriteRank: rank || 1 });
    }
  },

  async incrementUsage(drinkId: string): Promise<void> {
    const res = await listDocuments(COLLECTIONS.DRINKS, [Query.equal('$id', drinkId)]);
    if (res.documents.length === 0) return;
    const currentUsageCount = res.documents[0].usageCount || 0;
    await updateDocument(COLLECTIONS.DRINKS, drinkId, { usageCount: currentUsageCount + 1 });
  },

  async deleteDrink(drinkId: string): Promise<void> {
    await deleteDocument(COLLECTIONS.DRINKS, drinkId);
  },
};