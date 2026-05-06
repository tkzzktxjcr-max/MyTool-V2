import { listDocuments, Query } from '@/lib/appwrite';
import { COLLECTIONS } from '@/lib/appwrite';
import { drinksService } from './drinks';
import type { DrinkType } from '../types';

export interface DefaultDrink {
  name: string;
  type: DrinkType;
  abv: number;
  defaultServingSize: number;
  emoji: string;
  popularity: number;
  country?: string;
}

export const DEFAULT_GLOBAL_DRINKS: DefaultDrink[] = [
  // Bières Blondes / Lagers
  { name: 'Heineken', type: 'lager', abv: 5.0, defaultServingSize: 33, emoji: '🍺', popularity: 95, country: 'Pays-Bas' },
  { name: 'Corona Extra', type: 'lager', abv: 4.5, defaultServingSize: 33, emoji: '🍺', popularity: 90, country: 'Mexique' },
  { name: 'Kronenbourg 1664', type: 'lager', abv: 5.5, defaultServingSize: 25, emoji: '🍺', popularity: 88, country: 'France' },
  { name: 'Stella Artois', type: 'lager', abv: 5.2, defaultServingSize: 33, emoji: '🍺', popularity: 85, country: 'Belgique' },
  { name: 'Carlsberg', type: 'lager', abv: 5.0, defaultServingSize: 33, emoji: '🍺', popularity: 80, country: 'Danemark' },
  { name: 'Budweiser', type: 'lager', abv: 5.0, defaultServingSize: 33, emoji: '🍺', popularity: 78, country: 'USA' },
  { name: 'Peroni Nastro Azzurro', type: 'lager', abv: 5.1, defaultServingSize: 33, emoji: '🍺', popularity: 75, country: 'Italie' },
  { name: 'San Miguel', type: 'lager', abv: 5.4, defaultServingSize: 33, emoji: '🍺', popularity: 72, country: 'Espagne' },
  { name: 'Desperados', type: 'beer', abv: 5.9, defaultServingSize: 33, emoji: '🍺', popularity: 82, country: 'France' },
  { name: 'Pilsner Urquell', type: 'pilsner', abv: 4.4, defaultServingSize: 33, emoji: '🍺', popularity: 70, country: 'Rép. tchèque' },

  // Bières Artisanales / Spéciales
  { name: 'Guinness Draught', type: 'stout', abv: 4.2, defaultServingSize: 44, emoji: '🍺', popularity: 85, country: 'Irlande' },
  { name: 'Leffe Blonde', type: 'ale', abv: 6.6, defaultServingSize: 33, emoji: '🍺', popularity: 80, country: 'Belgique' },
  { name: 'Leffe Brune', type: 'ale', abv: 6.5, defaultServingSize: 33, emoji: '🍺', popularity: 75, country: 'Belgique' },
  { name: 'Hoegaarden', type: 'wheat_beer', abv: 4.9, defaultServingSize: 33, emoji: '🍺', popularity: 78, country: 'Belgique' },
  { name: 'IPA Craft', type: 'ipa', abv: 6.5, defaultServingSize: 33, emoji: '🍺', popularity: 72, country: 'USA' },
  { name: 'Chimay Bleue', type: 'ale', abv: 9.0, defaultServingSize: 33, emoji: '🍺', popularity: 68, country: 'Belgique' },
  { name: 'Tripel Karmeliet', type: 'ale', abv: 8.4, defaultServingSize: 33, emoji: '🍺', popularity: 65, country: 'Belgique' },
  { name: 'Duvel', type: 'ale', abv: 8.5, defaultServingSize: 33, emoji: '🍺', popularity: 70, country: 'Belgique' },

  // Vins Rouges
  { name: 'Bordeaux Rouge', type: 'red_wine', abv: 13.0, defaultServingSize: 12, emoji: '🍷', popularity: 90, country: 'France' },
  { name: 'Bourgogne Pinot Noir', type: 'red_wine', abv: 12.5, defaultServingSize: 12, emoji: '🍷', popularity: 85, country: 'France' },
  { name: 'Côtes du Rhône', type: 'red_wine', abv: 13.5, defaultServingSize: 12, emoji: '🍷', popularity: 82, country: 'France' },
  { name: 'Chianti Classico', type: 'red_wine', abv: 13.0, defaultServingSize: 12, emoji: '🍷', popularity: 78, country: 'Italie' },
  { name: 'Rioja Reserva', type: 'red_wine', abv: 13.5, defaultServingSize: 12, emoji: '🍷', popularity: 75, country: 'Espagne' },
  { name: 'Cabernet Sauvignon', type: 'red_wine', abv: 13.5, defaultServingSize: 12, emoji: '🍷', popularity: 80, country: 'France' },

  // Vins Blancs & Rosés
  { name: 'Sancerre Blanc', type: 'white_wine', abv: 12.5, defaultServingSize: 12, emoji: '🍷', popularity: 82, country: 'France' },
  { name: 'Chardonnay', type: 'white_wine', abv: 13.0, defaultServingSize: 12, emoji: '🍷', popularity: 80, country: 'France' },
  { name: 'Sauvignon Blanc', type: 'white_wine', abv: 12.5, defaultServingSize: 12, emoji: '🍷', popularity: 78, country: 'France' },
  { name: 'Côtes de Provence Rosé', type: 'rose_wine', abv: 13.0, defaultServingSize: 12, emoji: '🍷', popularity: 88, country: 'France' },
  { name: 'Tavel Rosé', type: 'rose_wine', abv: 13.5, defaultServingSize: 12, emoji: '🍷', popularity: 72, country: 'France' },
  { name: 'Muscadet', type: 'white_wine', abv: 12.0, defaultServingSize: 12, emoji: '🍷', popularity: 70, country: 'France' },

  // Champagnes & Effervescents
  { name: 'Champagne Moët & Chandon', type: 'champagne', abv: 12.0, defaultServingSize: 12, emoji: '🍾', popularity: 92, country: 'France' },
  { name: 'Champagne Veuve Clicquot', type: 'champagne', abv: 12.0, defaultServingSize: 12, emoji: '🍾', popularity: 88, country: 'France' },
  { name: 'Prosecco', type: 'sparkling', abv: 11.0, defaultServingSize: 12, emoji: '🍾', popularity: 85, country: 'Italie' },
  { name: 'Crémant d\'Alsace', type: 'sparkling', abv: 11.5, defaultServingSize: 12, emoji: '🍾', popularity: 75, country: 'France' },

  // Whiskies
  { name: 'Jack Daniel\'s', type: 'whisky', abv: 40.0, defaultServingSize: 4, emoji: '🥃', popularity: 95, country: 'USA' },
  { name: 'Jameson Irish Whiskey', type: 'whisky', abv: 40.0, defaultServingSize: 4, emoji: '🥃', popularity: 88, country: 'Irlande' },
  { name: 'Johnnie Walker Black Label', type: 'whisky', abv: 40.0, defaultServingSize: 4, emoji: '🥃', popularity: 90, country: 'Écosse' },
  { name: 'Glenfiddich 12 Ans', type: 'whisky', abv: 40.0, defaultServingSize: 4, emoji: '🥃', popularity: 82, country: 'Écosse' },
  { name: 'Lagavulin 16 Ans', type: 'whisky', abv: 43.0, defaultServingSize: 4, emoji: '🥃', popularity: 75, country: 'Écosse' },
  { name: 'Yamazaki', type: 'whisky', abv: 43.0, defaultServingSize: 4, emoji: '🥃', popularity: 72, country: 'Japon' },

  // Vodkas & Gins
  { name: 'Absolut Vodka', type: 'vodka', abv: 40.0, defaultServingSize: 4, emoji: '🥃', popularity: 90, country: 'Suède' },
  { name: 'Grey Goose', type: 'vodka', abv: 40.0, defaultServingSize: 4, emoji: '🥃', popularity: 85, country: 'France' },
  { name: 'Bombay Sapphire', type: 'gin', abv: 40.0, defaultServingSize: 4, emoji: '🥃', popularity: 88, country: 'UK' },
  { name: 'Hendrick\'s Gin', type: 'gin', abv: 41.4, defaultServingSize: 4, emoji: '🥃', popularity: 82, country: 'Écosse' },
  { name: 'Tanqueray', type: 'gin', abv: 43.1, defaultServingSize: 4, emoji: '🥃', popularity: 78, country: 'UK' },

  // Rhums
  { name: 'Bacardi Carta Blanca', type: 'rum', abv: 37.5, defaultServingSize: 4, emoji: '🥃', popularity: 88, country: 'Cuba' },
  { name: 'Havana Club 3 Ans', type: 'rum', abv: 40.0, defaultServingSize: 4, emoji: '🥃', popularity: 85, country: 'Cuba' },
  { name: 'Havana Club 7 Ans', type: 'rum', abv: 40.0, defaultServingSize: 4, emoji: '🥃', popularity: 82, country: 'Cuba' },
  { name: 'Captain Morgan Spiced', type: 'rum', abv: 35.0, defaultServingSize: 4, emoji: '🥃', popularity: 80, country: 'Jamaïque' },
  { name: 'Diplomatico Reserva', type: 'rum', abv: 40.0, defaultServingSize: 4, emoji: '🥃', popularity: 72, country: 'Venezuela' },

  // Autres Spiritueux
  { name: 'Jose Cuervo Silver', type: 'tequila', abv: 38.0, defaultServingSize: 4, emoji: '🥃', popularity: 85, country: 'Mexique' },
  { name: 'Patrón Silver', type: 'tequila', abv: 40.0, defaultServingSize: 4, emoji: '🥃', popularity: 80, country: 'Mexique' },
  { name: 'Hennessy VS', type: 'cognac', abv: 40.0, defaultServingSize: 4, emoji: '🥃', popularity: 88, country: 'France' },
  { name: 'Rémy Martin VSOP', type: 'cognac', abv: 40.0, defaultServingSize: 4, emoji: '🥃', popularity: 82, country: 'France' },
  { name: 'Calvados Boulard', type: 'calvados', abv: 40.0, defaultServingSize: 4, emoji: '🥃', popularity: 75, country: 'France' },

  // Cocktails Classiques
  { name: 'Mojito', type: 'mojito', abv: 15.0, defaultServingSize: 25, emoji: '🍹', popularity: 92, country: 'Cuba' },
  { name: 'Margarita', type: 'margarita', abv: 20.0, defaultServingSize: 12, emoji: '🍹', popularity: 90, country: 'Mexique' },
  { name: 'Aperol Spritz', type: 'aperol_spritz', abv: 11.0, defaultServingSize: 15, emoji: '🍹', popularity: 95, country: 'Italie' },
  { name: 'Pina Colada', type: 'pina_colada', abv: 15.0, defaultServingSize: 25, emoji: '🍹', popularity: 85, country: 'Porto Rico' },
  { name: 'Cosmopolitan', type: 'cosmopolitan', abv: 20.0, defaultServingSize: 10, emoji: '🍹', popularity: 82, country: 'USA' },
  { name: 'Old Fashioned', type: 'old_fashioned', abv: 35.0, defaultServingSize: 8, emoji: '🍹', popularity: 88, country: 'USA' },
  { name: 'Daiquiri', type: 'daiquiri', abv: 15.0, defaultServingSize: 10, emoji: '🍹', popularity: 78, country: 'Cuba' },
  { name: 'Dry Martini', type: 'martini', abv: 25.0, defaultServingSize: 8, emoji: '🍹', popularity: 85, country: 'USA' },

  // Autres Boissons
  { name: 'Cidre Brut', type: 'cider', abv: 5.0, defaultServingSize: 25, emoji: '🍎', popularity: 80, country: 'France' },
  { name: 'Cidre Doux', type: 'cider', abv: 3.0, defaultServingSize: 25, emoji: '🍎', popularity: 72, country: 'France' },
  { name: 'Sangria', type: 'sangria', abv: 10.0, defaultServingSize: 25, emoji: '🍷', popularity: 85, country: 'Espagne' },
  { name: 'Porto Ruby', type: 'port', abv: 20.0, defaultServingSize: 6, emoji: '🍷', popularity: 78, country: 'Portugal' },
  { name: 'Porto Tawny', type: 'port', abv: 20.0, defaultServingSize: 6, emoji: '🍷', popularity: 75, country: 'Portugal' },
  { name: 'Sherry', type: 'sherry', abv: 17.0, defaultServingSize: 6, emoji: '🍷', popularity: 70, country: 'Espagne' },
  { name: 'Sake', type: 'sake', abv: 15.0, defaultServingSize: 15, emoji: '🍶', popularity: 72, country: 'Japon' },
];

const BATCH_SIZE = 10;

export async function initializeDefaultDrinks(): Promise<{ created: number; errors: number }> {
  // Idempotence check: if any global drink already exists, skip entirely
  const existingGlobals = await listDocuments(COLLECTIONS.DRINKS, [
    Query.equal('isGlobal', true),
    Query.limit(1),
  ]);

  if (existingGlobals.documents.length > 0) {
    return { created: 0, errors: 0 };
  }

  let created = 0;
  let errors = 0;

  // Process in batches to avoid overwhelming the API
  for (let i = 0; i < DEFAULT_GLOBAL_DRINKS.length; i += BATCH_SIZE) {
    const batch = DEFAULT_GLOBAL_DRINKS.slice(i, i + BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map(async (drink) => {
        // Skip if a drink with this exact name+type already exists (any scope)
        const existing = await drinksService.findExistingDrink(drink.name, drink.type);
        if (existing) {
          return null;
        }

        return drinksService.createDrink({
          name: drink.name,
          type: drink.type,
          abv: drink.abv,
          defaultServingSize: drink.defaultServingSize,
          emoji: drink.emoji,
          country: drink.country,
          userId: undefined,
          isGlobal: true,
          popularity: drink.popularity,
        });
      })
    );

    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value !== null) {
        created++;
      } else if (result.status === 'rejected') {
        errors++;
      }
    });
  }

  return { created, errors };
}