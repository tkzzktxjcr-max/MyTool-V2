import type { Drink } from '../services/drinks';

/**
 * Deduplicate drinks: if a user drink and a global drink share the same
 * name + type, keep the user drink (preserves favorite/usage data)
 * and drop the global duplicate.
 */
export function deduplicateDrinks(drinks: Drink[], userId?: string): Drink[] {
  const userDrinks = drinks.filter(d => d.userId === userId);
  const globalDrinks = drinks.filter(d => !d.userId);
  const otherUserDrinks = drinks.filter(d => d.userId && d.userId !== userId);

  // Build a set of (name|type) keys from user drinks
  const userKeys = new Set(
    userDrinks.map(d => `${d.name.toLowerCase()}|${d.type}`)
  );

  // Filter out global drinks that duplicate a user drink
  const filteredGlobals = globalDrinks.filter(
    d => !userKeys.has(`${d.name.toLowerCase()}|${d.type}`)
  );

  return [...userDrinks, ...filteredGlobals, ...otherUserDrinks];
}