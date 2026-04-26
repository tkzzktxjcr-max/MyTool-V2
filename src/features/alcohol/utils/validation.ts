/**
 * Validation et Tests pour les calculs d'alcool
 * 
 * Ce fichier contient des fonctions de validation et des tests
 * pour vérifier la cohérence des calculs d'unités et de BAC.
 */

import { calculateUnits, calculateUnitsWithQuantity, unitsToVolumeCl, STANDARD_DRINKS, getRiskLevel } from './units';
import { calculateAlcoholGrams, BODY_WATER, ELIMINATION_RATE } from './bac';

// =============================================================================
// TESTS DE VALIDATION
// =============================================================================

export interface ValidationResult {
  passed: boolean;
  expected: number;
  actual: number;
  tolerance: number;
  description: string;
}

/**
 * Teste le calcul d'unités pour un verre standard
 */
export const testStandardDrinks = (): ValidationResult[] => {
  const results: ValidationResult[] = [];
  
  // Test: 25cl bière 5% ≈ 1 unité
  const beerUnits = calculateUnits(25, 5);
  results.push({
    passed: Math.abs(beerUnits - 1) <= 0.2,
    expected: 1,
    actual: beerUnits,
    tolerance: 0.2,
    description: '25cl bière à 5% ≈ 1 unité',
  });
  
  // Test: 10cl vin 12% ≈ 1 unité
  const wineUnits = calculateUnits(10, 12);
  results.push({
    passed: Math.abs(wineUnits - 0.99) <= 0.2,
    expected: 1,
    actual: wineUnits,
    tolerance: 0.2,
    description: '10cl vin à 12% ≈ 1 unité',
  });
  
  // Test: 4cl whisky 40% ≈ 1.26 unités
  const spiritUnits = calculateUnits(4, 40);
  results.push({
    passed: Math.abs(spiritUnits - 1.26) <= 0.2,
    expected: 1.26,
    actual: spiritUnits,
    tolerance: 0.2,
    description: '4cl whisky à 40% ≈ 1.26 unités',
  });
  
  // Test: 33cl bière 5% ≈ 1.3 unités
  const canUnits = calculateUnits(33, 5);
  results.push({
    passed: Math.abs(canUnits - 1.3) <= 0.2,
    expected: 1.3,
    actual: canUnits,
    tolerance: 0.2,
    description: '33cl cannette à 5% ≈ 1.3 unités',
  });
  
  // Test: 12cl champagne 12% ≈ 1.2 unités
  const champagneUnits = calculateUnits(12, 12);
  results.push({
    passed: Math.abs(champagneUnits - 1.18) <= 0.2,
    expected: 1.2,
    actual: champagneUnits,
    tolerance: 0.2,
    description: '12cl champagne à 12% ≈ 1.2 unités',
  });
  
  return results;
};

/**
 * Teste la conversion inverse (unités → volume)
 */
export const testInverseConversion = (): ValidationResult[] => {
  const results: ValidationResult[] = [];
  
  // 2 unités de bière 5% = ~50cl
  const beerVolume = unitsToVolumeCl(2, 5);
  results.push({
    passed: Math.abs(beerVolume - 50.6) <= 2,
    expected: 50.6,
    actual: beerVolume,
    tolerance: 2,
    description: '2 unités bière 5% ≈ 50cl',
  });
  
  // 1 unité de vin 12% = ~10cl
  const wineVolume = unitsToVolumeCl(1, 12);
  results.push({
    passed: Math.abs(wineVolume - 10.6) <= 1,
    expected: 10.6,
    actual: wineVolume,
    tolerance: 1,
    description: '1 unité vin 12% ≈ 10cl',
  });
  
  return results;
};

/**
 * Teste le calcul du facteur r (Widmark)
 */
export const testWidmarkFactors = (): ValidationResult[] => {
  const results: ValidationResult[] = [];
  
  // Homme 70kg, r = 0.68
  // BAC après 2 bières (25cl, 5%) = (2 × 9.86g) / (70 × 0.68) = 0.42 g/L
  const manWeight = 70;
  const rMale = BODY_WATER.male;
  const alcoholGrams = 2 * calculateUnits(25, 5) * 10; // 2 unités × 10g
  const maleBAC = alcoholGrams / (manWeight * rMale);
  
  results.push({
    passed: Math.abs(maleBAC - 0.42) <= 0.05,
    expected: 0.42,
    actual: Math.round(maleBAC * 100) / 100,
    tolerance: 0.05,
    description: 'Homme 70kg + 2 bières ≈ 0.42 g/L',
  });
  
  // Femme 60kg, r = 0.55
  // BAC après 2 bières = (19.72g) / (60 × 0.55) = 0.60 g/L
  const womanWeight = 60;
  const rFemale = BODY_WATER.female;
  const femaleBAC = alcoholGrams / (womanWeight * rFemale);
  
  results.push({
    passed: Math.abs(femaleBAC - 0.60) <= 0.05,
    expected: 0.60,
    actual: Math.round(femaleBAC * 100) / 100,
    tolerance: 0.05,
    description: 'Femme 60kg + 2 bières ≈ 0.60 g/L',
  });
  
  return results;
};

/**
 * Teste le taux d'élimination
 */
export const testEliminationRate = (): ValidationResult[] => {
  const results: ValidationResult[] = [];
  
  // BAC initial: 0.60 g/L
  // Après 4h à 0.15 g/L/h: 0.60 - (4 × 0.15) = 0 g/L
  const initialBAC = 0.6;
  const hours = 4;
  const expectedBAC = 0;
  const actualBAC = Math.max(0, initialBAC - (ELIMINATION_RATE * hours));
  
  results.push({
    passed: Math.abs(actualBAC - expectedBAC) <= 0.01,
    expected: expectedBAC,
    actual: actualBAC,
    tolerance: 0.01,
    description: 'BAC 0.6 → 0.0 après 4h à 0.15 g/L/h',
  });
  
  // Retour à 0 après combien d'heures pour 0.8 g/L?
  const bac = 0.8;
  const hoursToZero = bac / ELIMINATION_RATE;
  results.push({
    passed: Math.abs(hoursToZero - 5.33) <= 0.1,
    expected: 5.33,
    actual: hoursToZero,
    tolerance: 0.1,
    description: 'BAC 0.8 → 0.0 en ~5.33h',
  });
  
  return results;
};

/**
 * Exécute tous les tests et retourne un résumé
 */
export const runAllTests = (): {
  passed: number;
  failed: number;
  results: ValidationResult[];
} => {
  const allResults = [
    ...testStandardDrinks(),
    ...testInverseConversion(),
    ...testWidmarkFactors(),
    ...testEliminationRate(),
  ];
  
  const passed = allResults.filter(r => r.passed).length;
  const failed = allResults.filter(r => !r.passed).length;
  
  return { passed, failed, results: allResults };
};

/**
 * Affiche les résultats des tests dans la console
 */
export const logTestResults = (): void => {
  console.log('🧪 Tests de validation des calculs d\'alcool');
  console.log('='.repeat(50));
  
  const { passed, failed, results } = runAllTests();
  
  results.forEach((result, i) => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.description}`);
    console.log(`   Attendu: ${result.expected} | Réel: ${result.actual} | Tolérance: ±${result.tolerance}`);
  });
  
  console.log('='.repeat(50));
  console.log(`Résultat: ${passed} réussi(s), ${failed} échoué(s)`);
};

/**
 * Calcule et affiche les statistiques de cohérence
 */
export const calculateCohesionStats = (logs: Array<{ units: number; servingSize: number; abv: number }>): {
  totalUnits: number;
  calculatedUnits: number;
  difference: number;
  isCohesive: boolean;
} => {
  const totalUnits = logs.reduce((sum, log) => sum + (log.units || 0), 0);
  
  const calculatedUnits = logs.reduce((sum, log) => {
    return sum + calculateUnits(log.servingSize, log.abv);
  }, 0);
  
  const difference = Math.abs(totalUnits - calculatedUnits);
  const isCohesive = difference <= totalUnits * 0.1; // Tolérance de 10%
  
  return {
    totalUnits: Math.round(totalUnits * 10) / 10,
    calculatedUnits: Math.round(calculatedUnits * 10) / 10,
    difference: Math.round(difference * 10) / 10,
    isCohesive,
  };
};

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  testStandardDrinks,
  testInverseConversion,
  testWidmarkFactors,
  testEliminationRate,
  runAllTests,
  logTestResults,
  calculateCohesionStats,
};