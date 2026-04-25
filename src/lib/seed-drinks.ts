/**
 * Seed Drinks to Appwrite
 * Run this once to populate the drinks collection with library drinks
 */

import { Client, Databases, ID } from 'appwrite';
import { APPWRITE_CONFIG, COLLECTIONS } from './appwrite';

const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId);

const databases = new Databases(client);

export const LIBRARY_DRINKS = [
  // === BEERS (Lagers) ===
  { name: 'Heineken 33cl', type: 'lager', abv: 5, servingSize: 33, emoji: '🍺', isGlobal: true, popularity: 100, category: 'lager', brand: 'Heineken' },
  { name: 'Heineken 50cl', type: 'lager', abv: 5, servingSize: 50, emoji: '🍺', isGlobal: true, popularity: 95, category: 'lager', brand: 'Heineken' },
  { name: 'Corona Extra', type: 'lager', abv: 4.5, servingSize: 35, emoji: '🍺', isGlobal: true, popularity: 95, category: 'lager', brand: 'Corona' },
  { name: 'Stella Artois', type: 'lager', abv: 5, servingSize: 33, emoji: '🍺', isGlobal: true, popularity: 92, category: 'lager', brand: 'Stella Artois' },
  { name: 'Carlsberg', type: 'lager', abv: 5, servingSize: 33, emoji: '🍺', isGlobal: true, popularity: 85, category: 'lager', brand: 'Carlsberg' },
  { name: 'Budweiser', type: 'lager', abv: 5, servingSize: 33, emoji: '🍺', isGlobal: true, popularity: 80, category: 'lager', brand: 'Budweiser' },
  { name: '1664 Blanc', type: 'wheat_beer', abv: 5, servingSize: 33, emoji: '🍺', isGlobal: true, popularity: 88, category: 'wheat_beer', brand: 'Kronenbourg' },
  { name: 'Hoegaarden', type: 'wheat_beer', abv: 4.9, servingSize: 33, emoji: '🍺', isGlobal: true, popularity: 82, category: 'wheat_beer', brand: 'Hoegaarden' },
  { name: 'Leffe Blonde', type: 'ale', abv: 6.6, servingSize: 33, emoji: '🍺', isGlobal: true, popularity: 80, category: 'ale', brand: 'Leffe' },
  { name: 'Grimbergen Blonde', type: 'ale', abv: 6.5, servingSize: 33, emoji: '🍺', isGlobal: true, popularity: 75, category: 'ale', brand: 'Grimbergen' },
  
  // === STOUTS & PORTERS ===
  { name: 'Guinness', type: 'stout', abv: 7, servingSize: 44, emoji: '🖤', isGlobal: true, popularity: 85, category: 'stout', brand: 'Guinness' },
  { name: "Murphy's", type: 'stout', abv: 4, servingSize: 44, emoji: '🖤', isGlobal: true, popularity: 70, category: 'stout', brand: "Murphy's" },
  
  // === IPA & CRAFT ===
  { name: 'BrewDog Punk IPA', type: 'ipa', abv: 5.6, servingSize: 33, emoji: '🍺', isGlobal: true, popularity: 78, category: 'ipa', brand: 'BrewDog' },
  { name: 'IPA Craft', type: 'ipa', abv: 6.5, servingSize: 44, emoji: '🍺', isGlobal: true, popularity: 72, category: 'ipa', brand: '' },
  
  // === PILSNERS ===
  { name: 'Budvar', type: 'pilsner', abv: 5, servingSize: 50, emoji: '🍺', isGlobal: true, popularity: 75, category: 'pilsner', brand: 'Budvar' },
  { name: 'Pilsner Urquell', type: 'pilsner', abv: 4.4, servingSize: 50, emoji: '🍺', isGlobal: true, popularity: 78, category: 'pilsner', brand: 'Pilsner Urquell' },
  
  // === CIDERS ===
  { name: 'Strongbow', type: 'cider', abv: 5, servingSize: 44, emoji: '🍎', isGlobal: true, popularity: 75, category: 'cider', brand: 'Strongbow' },
  { name: 'Savanna Dry', type: 'cider', abv: 5, servingSize: 33, emoji: '🍎', isGlobal: true, popularity: 65, category: 'cider', brand: 'Savanna' },
  
  // === RED WINES ===
  { name: 'Merlot', type: 'red_wine', abv: 13.5, servingSize: 15, emoji: '🍷', isGlobal: true, popularity: 92, category: 'red_wine', brand: '' },
  { name: 'Cabernet Sauvignon', type: 'red_wine', abv: 13.5, servingSize: 15, emoji: '🍷', isGlobal: true, popularity: 90, category: 'red_wine', brand: '' },
  { name: 'Pinot Noir', type: 'red_wine', abv: 13, servingSize: 15, emoji: '🍷', isGlobal: true, popularity: 88, category: 'red_wine', brand: '' },
  { name: 'Chianti', type: 'red_wine', abv: 13, servingSize: 15, emoji: '🍷', isGlobal: true, popularity: 85, category: 'red_wine', brand: '' },
  { name: 'Rioja', type: 'red_wine', abv: 13.5, servingSize: 15, emoji: '🍷', isGlobal: true, popularity: 82, category: 'red_wine', brand: '' },
  
  // === WHITE WINES ===
  { name: 'Chardonnay', type: 'white_wine', abv: 12.5, servingSize: 15, emoji: '🥂', isGlobal: true, popularity: 90, category: 'white_wine', brand: '' },
  { name: 'Sauvignon Blanc', type: 'white_wine', abv: 12, servingSize: 15, emoji: '🥂', isGlobal: true, popularity: 88, category: 'white_wine', brand: '' },
  { name: 'Pinot Grigio', type: 'white_wine', abv: 12, servingSize: 15, emoji: '🥂', isGlobal: true, popularity: 85, category: 'white_wine', brand: '' },
  { name: 'Riesling', type: 'white_wine', abv: 11.5, servingSize: 15, emoji: '🥂', isGlobal: true, popularity: 82, category: 'white_wine', brand: '' },
  
  // === ROSÉ WINES ===
  { name: 'Whispering Angel', type: 'rose_wine', abv: 13, servingSize: 15, emoji: '🌸', isGlobal: true, popularity: 85, category: 'rose_wine', brand: "Chateau d'Esclans" },
  { name: 'Rose de Provence', type: 'rose_wine', abv: 12.5, servingSize: 15, emoji: '🌸', isGlobal: true, popularity: 78, category: 'rose_wine', brand: '' },
  
  // === CHAMPAGNE & SPARKLING ===
  { name: 'Champagne', type: 'champagne', abv: 12, servingSize: 12, emoji: '🍾', isGlobal: true, popularity: 88, category: 'champagne', brand: '' },
  { name: 'Veuve Clicquot', type: 'champagne', abv: 12, servingSize: 12, emoji: '🍾', isGlobal: true, popularity: 85, category: 'champagne', brand: 'Veuve Clicquot' },
  { name: 'Prosecco', type: 'sparkling', abv: 11, servingSize: 15, emoji: '🥂', isGlobal: true, popularity: 88, category: 'sparkling', brand: '' },
  
  // === WHISKY / WHISKEY ===
  { name: 'Johnnie Walker Black', type: 'whisky', abv: 40, servingSize: 4, emoji: '🥃', isGlobal: true, popularity: 90, category: 'whisky', brand: 'Johnnie Walker' },
  { name: 'Glenfiddich 12', type: 'whisky', abv: 40, servingSize: 4, emoji: '🥃', isGlobal: true, popularity: 85, category: 'whisky', brand: 'Glenfiddich' },
  { name: 'Jameson', type: 'whisky', abv: 40, servingSize: 4, emoji: '🥃', isGlobal: true, popularity: 82, category: 'whisky', brand: 'Jameson' },
  { name: "Jack Daniel's", type: 'whisky', abv: 40, servingSize: 4, emoji: '🥃', isGlobal: true, popularity: 85, category: 'whisky', brand: "Jack Daniel's" },
  
  // === VODKA ===
  { name: 'Grey Goose', type: 'vodka', abv: 40, servingSize: 4, emoji: '💧', isGlobal: true, popularity: 88, category: 'vodka', brand: 'Grey Goose' },
  { name: 'Absolut Vodka', type: 'vodka', abv: 40, servingSize: 4, emoji: '💧', isGlobal: true, popularity: 85, category: 'vodka', brand: 'Absolut' },
  { name: 'Smirnoff Red', type: 'vodka', abv: 40, servingSize: 4, emoji: '💧', isGlobal: true, popularity: 80, category: 'vodka', brand: 'Smirnoff' },
  
  // === GIN ===
  { name: "Gordon's", type: 'gin', abv: 37.5, servingSize: 4, emoji: '🌿', isGlobal: true, popularity: 85, category: 'gin', brand: "Gordon's" },
  { name: 'Tanqueray', type: 'gin', abv: 40, servingSize: 4, emoji: '🌿', isGlobal: true, popularity: 82, category: 'gin', brand: 'Tanqueray' },
  { name: "Hendrick's", type: 'gin', abv: 41.4, servingSize: 4, emoji: '🌿', isGlobal: true, popularity: 78, category: 'gin', brand: "Hendrick's" },
  
  // === RUM ===
  { name: 'Bacardi White', type: 'rum', abv: 37.5, servingSize: 4, emoji: '🏝️', isGlobal: true, popularity: 82, category: 'rum', brand: 'Bacardi' },
  { name: 'Havana Club', type: 'rum', abv: 40, servingSize: 4, emoji: '🏝️', isGlobal: true, popularity: 78, category: 'rum', brand: 'Havana Club' },
  { name: 'Captain Morgan', type: 'rum', abv: 40, servingSize: 4, emoji: '🏝️', isGlobal: true, popularity: 75, category: 'rum', brand: 'Captain Morgan' },
  
  // === TEQUILA ===
  { name: 'Jose Cuervo Silver', type: 'tequila', abv: 38, servingSize: 4, emoji: '🌵', isGlobal: true, popularity: 80, category: 'tequila', brand: 'Jose Cuervo' },
  { name: 'Don Julio Blanco', type: 'tequila', abv: 40, servingSize: 4, emoji: '🌵', isGlobal: true, popularity: 75, category: 'tequila', brand: 'Don Julio' },
  
  // === COGNAC & BRANDY ===
  { name: 'Hennessy VS', type: 'cognac', abv: 40, servingSize: 4, emoji: '🏰', isGlobal: true, popularity: 85, category: 'cognac', brand: 'Hennessy' },
  { name: 'Remy Martin VSOP', type: 'cognac', abv: 40, servingSize: 4, emoji: '🏰', isGlobal: true, popularity: 82, category: 'cognac', brand: 'Remy Martin' },
  
  // === COCKTAILS ===
  { name: 'Mojito', type: 'mojito', abv: 15, servingSize: 30, emoji: '🍹', isGlobal: true, popularity: 88, category: 'cocktail', brand: '' },
  { name: 'Margarita', type: 'margarita', abv: 20, servingSize: 25, emoji: '🍹', isGlobal: true, popularity: 85, category: 'cocktail', brand: '' },
  { name: 'Aperol Spritz', type: 'aperol_spritz', abv: 11, servingSize: 20, emoji: '🍊', isGlobal: true, popularity: 90, category: 'cocktail', brand: '' },
  { name: 'Old Fashioned', type: 'old_fashioned', abv: 35, servingSize: 6, emoji: '🥃', isGlobal: true, popularity: 82, category: 'cocktail', brand: '' },
  { name: 'Cosmopolitan', type: 'cosmopolitan', abv: 20, servingSize: 20, emoji: '🍸', isGlobal: true, popularity: 78, category: 'cocktail', brand: '' },
  { name: 'Daiquiri', type: 'daiquiri', abv: 15, servingSize: 20, emoji: '🍹', isGlobal: true, popularity: 75, category: 'cocktail', brand: '' },
  { name: 'Pina Colada', type: 'pina_colada', abv: 15, servingSize: 25, emoji: '🍍', isGlobal: true, popularity: 72, category: 'cocktail', brand: '' },
  { name: 'Martini', type: 'martini', abv: 25, servingSize: 8, emoji: '🍸', isGlobal: true, popularity: 80, category: 'cocktail', brand: '' },
  
  // === ASIAN SPIRITS ===
  { name: 'Soju', type: 'soju', abv: 20, servingSize: 5, emoji: '🥃', isGlobal: true, popularity: 75, category: 'spirit', brand: '' },
  { name: 'Sake', type: 'sake', abv: 15, servingSize: 10, emoji: '🍶', isGlobal: true, popularity: 70, category: 'spirit', brand: '' },
  
  // === OTHER ===
  { name: 'Sangria', type: 'sangria', abv: 10, servingSize: 20, emoji: '🍷', isGlobal: true, popularity: 65, category: 'fortified', brand: '' },
  { name: 'Calvados', type: 'calvados', abv: 40, servingSize: 4, emoji: '🍎', isGlobal: true, popularity: 65, category: 'spirit', brand: '' },
  { name: 'Biere Artisanale', type: 'ale', abv: 6, servingSize: 33, emoji: '🍺', isGlobal: true, popularity: 70, category: 'craft', brand: '' },
  { name: 'Vinyle', type: 'rose_wine', abv: 12, servingSize: 15, emoji: '🌸', isGlobal: true, popularity: 75, category: 'rose_wine', brand: '' },
];

export interface SeedDrinkResult {
  success: boolean;
  name: string;
  error?: string;
}

export async function seedDrinks(): Promise<{ success: number; failed: number; results: SeedDrinkResult[] }> {
  const results: SeedDrinkResult[] = [];
  let success = 0;
  let failed = 0;

  console.log(`[Seed] Starting to seed ${LIBRARY_DRINKS.length} drinks...`);

  for (const drink of LIBRARY_DRINKS) {
    try {
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        COLLECTIONS.DRINKS,
        ID.unique(),
        {
          name: drink.name,
          type: drink.type,
          abv: drink.abv,
          defaultServingSize: drink.servingSize,
          emoji: drink.emoji,
          country: null,
          isFavorite: false,
          favoriteRank: null,
          usageCount: 0,
          userId: null,
          isGlobal: true,
          popularity: drink.popularity,
          category: drink.category,
          brand: drink.brand || null,
        }
      );
      
      success++;
      results.push({ success: true, name: drink.name });
      console.log(`✓ ${drink.emoji} ${drink.name}`);
    } catch (error: any) {
      failed++;
      const errorMsg = error?.message || 'Unknown error';
      
      // Ignore duplicate errors
      if (error?.code === 409) {
        results.push({ success: true, name: drink.name });
        console.log(`⊘ ${drink.emoji} ${drink.name} (already exists)`);
      } else {
        results.push({ success: false, name: drink.name, error: errorMsg });
        console.error(`✗ ${drink.emoji} ${drink.name}: ${errorMsg}`);
      }
    }
  }

  console.log(`\n[Seed] Done! Success: ${success}, Failed: ${failed}`);
  
  return { success, failed, results };
}

// Hook version for use in React
import { useState, useCallback } from 'react';

export function useSeedDrinks() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);

  const seed = useCallback(async () => {
    setLoading(true);
    setProgress({ current: 0, total: LIBRARY_DRINKS.length });
    setResult(null);

    let success = 0;
    let failed = 0;

    for (let i = 0; i < LIBRARY_DRINKS.length; i++) {
      const drink = LIBRARY_DRINKS[i];
      setProgress({ current: i + 1, total: LIBRARY_DRINKS.length });

      try {
        await databases.createDocument(
          APPWRITE_CONFIG.databaseId,
          COLLECTIONS.DRINKS,
          ID.unique(),
          {
            name: drink.name,
            type: drink.type,
            abv: drink.abv,
            defaultServingSize: drink.servingSize,
            emoji: drink.emoji,
            country: null,
            isFavorite: false,
            favoriteRank: null,
            usageCount: 0,
            userId: null,
            isGlobal: true,
            popularity: drink.popularity,
            category: drink.category,
            brand: drink.brand || null,
          }
        );
        success++;
      } catch (error: any) {
        if (error?.code !== 409) {
          failed++;
        } else {
          success++; // Count existing as success
        }
      }
    }

    setResult({ success, failed });
    setLoading(false);
  }, []);

  return { seed, loading, progress, result };
}