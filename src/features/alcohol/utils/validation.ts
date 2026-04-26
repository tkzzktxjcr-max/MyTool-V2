/**
 * Validation et Tests pour les calculs d'alcool
 */

import { calculateUnits, calculateUnitsWithQuantity, unitsToVolumeCl } from './units';
import { calculateAlcoholGrams } from './bac';
import { ALCOHOL } from '@/lib/constants';

export interface ValidationResult {
  passed: boolean; expected: number; actual: number; tolerance: number; description: string;
}

export const testStandardDrinks = (): ValidationResult[] => [
  { passed: Math.abs(calculateUnits(25, 5) - 1) <= 0.2, expected: 1, actual: calculateUnits(25, 5), tolerance: 0.2, description: '25cl bière à 5% ≈ 1 unité' },
  { passed: Math.abs(calculateUnits(10, 12) - 0.99) <= 0.2, expected: 1, actual: calculateUnits(10, 12), tolerance: 0.2, description: '10cl vin à 12% ≈ 1 unité' },
  { passed: Math.abs(calculateUnits(4, 40) - 1.26) <= 0.2, expected: 1.26, actual: calculateUnits(4, 40), tolerance: 0.2, description: '4cl whisky à 40% ≈ 1.26 unités' },
  { passed: Math.abs(calculateUnits(33, 5) - 1.3) <= 0.2, expected: 1.3, actual: calculateUnits(33, 5), tolerance: 0.2, description: '33cl cannette à 5% ≈ 1.3 unités' },
];

export const testInverseConversion = (): ValidationResult[] => [
  { passed: Math.abs(unitsToVolumeCl(2, 5) - 50.6) <= 2, expected: 50.6, actual: unitsToVolumeCl(2, 5), tolerance: 2, description: '2 unités bière 5% ≈ 50cl' },
  { passed: Math.abs(unitsToVolumeCl(1, 12) - 10.6) <= 1, expected: 10.6, actual: unitsToVolumeCl(1, 12), tolerance: 1, description: '1 unité vin 12% ≈ 10cl' },
];

export const testWidmarkFactors = (): ValidationResult[] => {
  const rMale = ALCOHOL.BODY_WATER.male;
  const rFemale = ALCOHOL.BODY_WATER.female;
  const alcoholGrams = 2 * calculateUnits(25, 5) * 10;
  return [
    { passed: Math.abs((alcoholGrams / (70 * rMale)) - 0.42) <= 0.05, expected: 0.42, actual: Math.round((alcoholGrams / (70 * rMale)) * 100) / 100, tolerance: 0.05, description: 'Homme 70kg + 2 bières ≈ 0.42 g/L' },
    { passed: Math.abs((alcoholGrams / (60 * rFemale)) - 0.60) <= 0.05, expected: 0.60, actual: Math.round((alcoholGrams / (60 * rFemale)) * 100) / 100, tolerance: 0.05, description: 'Femme 60kg + 2 bières ≈ 0.60 g/L' },
  ];
};

export const testEliminationRate = (): ValidationResult[] => [
  { passed: Math.abs(Math.max(0, 0.6 - (ALCOHOL.ELIMINATION_RATE * 4))) <= 0.01, expected: 0, actual: Math.max(0, 0.6 - (ALCOHOL.ELIMINATION_RATE * 4)), tolerance: 0.01, description: 'BAC 0.6 → 0.0 après 4h' },
  { passed: Math.abs((0.8 / ALCOHOL.ELIMINATION_RATE) - 5.33) <= 0.1, expected: 5.33, actual: 0.8 / ALCOHOL.ELIMINATION_RATE, tolerance: 0.1, description: 'BAC 0.8 → 0.0 en ~5.33h' },
];

export const runAllTests = () => {
  const allResults = [...testStandardDrinks(), ...testInverseConversion(), ...testWidmarkFactors(), ...testEliminationRate()];
  return { passed: allResults.filter(r => r.passed).length, failed: allResults.filter(r => !r.passed).length, results: allResults };
};

export const logTestResults = (): void => {
  const { passed, failed, results } = runAllTests();
  results.forEach((result, i) => {
    console.log(`${result.passed ? '✅' : '❌'} ${result.description} | Attendu: ${result.expected} | Réel: ${result.actual}`);
  });
  console.log(`Résultat: ${passed} réussi(s), ${failed} échoué(s)`);
};

export const calculateCohesionStats = (logs: Array<{ units: number; servingSize: number; abv: number }>) => {
  const totalUnits = logs.reduce((sum, log) => sum + (log.units || 0), 0);
  const calculatedUnits = logs.reduce((sum, log) => sum + calculateUnits(log.servingSize, log.abv), 0);
  return { totalUnits: Math.round(totalUnits * 10) / 10, calculatedUnits: Math.round(calculatedUnits * 10) / 10, difference: Math.round(Math.abs(totalUnits - calculatedUnits) * 10) / 10, isCohesive: Math.abs(totalUnits - calculatedUnits) <= totalUnits * 0.1 };
};
