/**
 * Seed Drinks Script
 * 
 * Run this script to populate the Appwrite drinks collection with library drinks.
 * 
 * Usage:
 *   1. Install Appwrite SDK: npm install appwrite
 *   2. Set environment variables:
 *      - VITE_APPWRITE_ENDPOINT
 *      - VITE_APPWRITE_PROJECT_ID
 *      - VITE_APPWRITE_DATABASE_ID
 *      - APPWRITE_API_KEY (admin key)
 *   3. Run: npx tsx scripts/seed-drinks.ts
 */

import { Client, Databases, ID, Query } from 'appwrite';

const LIBRARY_DRINKS = [
  // === BEERS (Lagers) ===
  { name: 'Heineken', type: 'lager', abv: 5, servingSize: 33, emoji: '🍺', isGlobal: true, popularity: 100, category: 'lager', brand: 'Heineken' },
  { name: 'Heineken', type: 'lager', abv: 5, servingSize: 50, emoji: '🍺', isGlobal: true, popularity: 95, category: 'lager', brand: 'Heineken' },
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
  { name: 'Murphy\'s', type: 'stout', abv: 4, servingSize: 44, emoji: '🖤', isGlobal: true, popularity: 70, category: 'stout', brand: 'Murphy\'s' },
  { name: 'Young\'s Double Chocolate', type: 'stout', abv: 5.2, servingSize: 44, emoji: '🍫', isGlobal: true, popularity: 65, category: 'stout', brand: 'Young\'s' },
  
  // === IPA & CRAFT ===
  { name: 'BrewDog Punk IPA', type: 'ipa', abv: 5.6, servingSize: 33, emoji: '🍺', isGlobal: true, popularity: 78, category: 'ipa', brand: 'BrewDog' },
  { name: 'Cloudwater IPA', type: 'ipa', abv: 6.5, servingSize: 44, emoji: '🍺', isGlobal: true, popularity: 72, category: 'ipa', brand: 'Cloudwater' },
  { name: 'Magic Rock High Wire', type: 'ipa', abv: 6, servingSize: 44, emoji: '🍺', isGlobal: true, popularity: 68, category: 'ipa', brand: 'Magic Rock' },
  
  // === PILSNERS ===
  { name: 'Budvar', type: 'pilsner', abv: 5, servingSize: 50, emoji: '🍺', isGlobal: true, popularity: 75, category: 'pilsner', brand: 'Budvar' },
  { name: 'Kozel', type: 'pilsner', abv: 4.8, servingSize: 50, emoji: '🍺', isGlobal: true, popularity: 70, category: 'pilsner', brand: 'Kozel' },
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
  { name: 'Whispering Angel', type: 'rose_wine', abv: 13, servingSize: 15, emoji: '🌸', isGlobal: true, popularity: 85, category: 'rose_wine', brand: 'Chateau d\'Esclans' },
  { name: 'Jadeo Rose', type: 'rose_wine', abv: 12.5, servingSize: 15, emoji: '🌸', isGlobal: true, popularity: 78, category: 'rose_wine', brand: '' },
  
  // === CHAMPAGNE & SPARKLING ===
  { name: 'Moet & Chandon', type: 'champagne', abv: 12, servingSize: 12, emoji: '🍾', isGlobal: true, popularity: 88, category: 'champagne', brand: 'Moet & Chandon' },
  { name: 'Veuve Clicquot', type: 'champagne', abv: 12, servingSize: 12, emoji: '🍾', isGlobal: true, popularity: 85, category: 'champagne', brand: 'Veuve Clicquot' },
  { name: 'Prosecco', type: 'sparkling', abv: 11, servingSize: 15, emoji: '🥂', isGlobal: true, popularity: 88, category: 'sparkling', brand: '' },
  
  // === WHISKY / WHISKEY ===
  { name: 'Johnnie Walker Black', type: 'whisky', abv: 40, servingSize: 4, emoji: '🥃', isGlobal: true, popularity: 90, category: 'whisky', brand: 'Johnnie Walker' },
  { name: 'Glenfiddich 12', type: 'whisky', abv: 40, servingSize: 4, emoji: '🥃', isGlobal: true, popularity: 85, category: 'whisky', brand: 'Glenfiddich' },
  { name: 'Jameson', type: 'whisky', abv: 40, servingSize: 4, emoji: '🥃', isGlobal: true, popularity: 82, category: 'whisky', brand: 'Jameson' },
  { name: 'Chivas Regal 12', type: 'whisky', abv: 40, servingSize: 4, emoji: '🥃', isGlobal: true, popularity: 78, category: 'whisky', brand: 'Chivas' },
  { name: 'Jack Daniel\'s', type: 'whisky', abv: 40, servingSize: 4, emoji: '🥃', isGlobal: true, popularity: 85, category: 'whisky', brand: 'Jack Daniel\'s' },
  
  // === VODKA ===
  { name: 'Grey Goose', type: 'vodka', abv: 40, servingSize: 4, emoji: '💧', isGlobal: true, popularity: 88, category: 'vodka', brand: 'Grey Goose' },
  { name: 'Absolut Vodka', type: 'vodka', abv: 40, servingSize: 4, emoji: '💧', isGlobal: true, popularity: 85, category: 'vodka', brand: 'Absolut' },
  { name: 'Smirnoff Red', type: 'vodka', abv: 40, servingSize: 4, emoji: '💧', isGlobal: true, popularity: 80, category: 'vodka', brand: 'Smirnoff' },
  
  // === GIN ===
  { name: 'Gordon\'s', type: 'gin', abv: 37.5, servingSize: 4, emoji: '🌿', isGlobal: true, popularity: 85, category: 'gin', brand: 'Gordon\'s' },
  { name: 'Tanqueray', type: 'gin', abv: 40, servingSize: 4, emoji: '🌿', isGlobal: true, popularity: 82, category: 'gin', brand: 'Tanqueray' },
  { name: 'Hendrick\'s', type: 'gin', abv: 41.4, servingSize: 4, emoji: '🌿', isGlobal: true, popularity: 78, category: 'gin', brand: 'Hendrick\'s' },
  
  // === RUM ===
  { name: 'Bacardi White', type: 'rum', abv: 37.5, servingSize: 4, emoji: '🏝️', isGlobal: true, popularity: 82, category: 'rum', brand: 'Bacardi' },
  { name: 'Havana Club', type: 'rum', abv: 40, servingSize: 4, emoji: '🏝️', isGlobal: true, popularity: 78, category: 'rum', brand: 'Havana Club' },
  { name: 'Captain Morgan', type: 'rum', abv: 40, servingSize: 4, emoji: '🏝️', isGlobal: true, popularity: 75, category: 'rum', brand: 'Captain Morgan' },
  
  // === TEQUILA ===
  { name: 'Jose Cuervo Silver', type: 'tequila', abv: 38, servingSize: 4, emoji: '🌵', isGlobal: true, popularity: 80, category: 'tequila', brand: 'Jose Cuervo' },
  { name: 'Don Julio Blanco', type: 'tequila', abv: 40, servingSize: 4, emoji: '🌵', isGlobal: true, popularity: 75, category: 'tequila', brand: 'Don Julio' },
  
  // === COGNAC & BRANDY ===
  { name: 'Hennessy VS', type: 'cognac', abv: 40, servingSize: 4, emoji: '🏰', isGlobal: true, popularity: 85, category: 'cognac', brand: 'Hennessy' },
  { name: 'Rémy Martin VSOP', type: 'cognac', abv: 40, servingSize: 4, emoji: '🏰', isGlobal: true, popularity: 82, category: 'cognac', brand: 'Rémy Martin' },
  { name: 'Courvoisier VS', type: 'cognac', abv: 40, servingSize: 4, emoji: '🏰', isGlobal: true, popularity: 75, category: 'cognac', brand: 'Courvoisier' },
  
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
  
  // === OTHER WINES ===
  { name: 'Sangria', type: 'sangria', abv: 10, servingSize: 20, emoji: '🍷', isGlobal: true, popularity: 65, category: 'fortified', brand: '' },
  { name: 'Sherry', type: 'sherry', abv: 17, servingSize: 10, emoji: '🍷', isGlobal: true, popularity: 60, category: 'fortified', brand: '' },
  { name: 'Porto', type: 'port', abv: 20, servingSize: 10, emoji: '🍷', isGlobal: true, popularity: 60, category: 'fortified', brand: '' },
  { name: 'Calvados', type: 'calvados', abv: 40, servingSize: 4, emoji: '🍎', isGlobal: true, popularity: 65, category: 'spirit', brand: '' },
];

async function seedDrinks() {
  const endpoint = process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
  const projectId = process.env.VITE_APPWRITE_PROJECT_ID || '';
  const databaseId = process.env.VITE_APPWRITE_DATABASE_ID || '';
  const apiKey = process.env.APPWRITE_API_KEY || '';
  const collectionId = process.env.VITE_COLLECTION_DRINKS || 'drinks';

  if (!projectId || !databaseId) {
    console.error('Missing required environment variables');
    console.log('Required: VITE_APPWRITE_PROJECT_ID, VITE_APPWRITE_DATABASE_ID');
    process.exit(1);
  }

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

  const databases = new Databases(client);

  console.log(`Seeding ${LIBRARY_DRINKS.length} drinks...`);

  let successCount = 0;
  let errorCount = 0;

  for (const drink of LIBRARY_DRINKS) {
    try {
      await databases.createDocument(databaseId, collectionId, ID.unique(), {
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
      });
      successCount++;
      console.log(`✓ ${drink.emoji} ${drink.name}`);
    } catch (error: any) {
      errorCount++;
      if (error.code === 409) {
        console.log(`⊘ ${drink.emoji} ${drink.name} (already exists)`);
      } else {
        console.error(`✗ ${drink.emoji} ${drink.name}: ${error.message}`);
      }
    }
  }

  console.log('\n---');
  console.log(`Seeded: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log('Done!');
}

seedDrinks().catch(console.error);