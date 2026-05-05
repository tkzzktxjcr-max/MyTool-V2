import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import type { AlcoholLog } from '@/features/alcohol/types';

const AVERAGE_PRICES: Record<string, number> = {
  beer: 4, lager: 4, pilsner: 4, stout: 6, wheat_beer: 5, ipa: 6, ale: 5,
  wine: 5, red_wine: 6, white_wine: 6, rose_wine: 5, champagne: 10, sparkling: 8,
  spirit: 8, whisky: 10, vodka: 8, rum: 8, tequila: 9, gin: 9, brandy: 10, cognac: 12, calvados: 10,
  cocktail: 12, martini: 10, mojito: 12, margarita: 12, old_fashioned: 14, cosmopolitan: 13, daiquiri: 12, pina_colada: 13, aperol_spritz: 11,
  cider: 5, sake: 8, soju: 6, sangria: 6, sherry: 8, port: 9, other: 5, custom: 5,
};

const EQUIVALENTS = {
  coffee: { price: 3.5 },
  cinema: { price: 12 },
  concert: { price: 65 },
  streaming: { price: 10 },
  books: { price: 15 },
  weekend_trip: { price: 200 },
};

export interface FinancialStats {
  dailySpend: number;
  weeklySpend: number;
  monthlySpend: number;
  yearlySpend: number;
  monthlyProjection: number;
  yearlyProjection: number;
  vsPreviousMonth: number;
  vsAverage: number;
  avgDailySpend: number;
  yearlyEquivalents: {
    coffees: number;
    cinema: number;
    concert: number;
    streaming: number;
    books: number;
    weekendTrips: number;
  };
  potentialSavings: number;
  byCategory: Record<string, number>;
}

export const estimateSpendForLog = (log: AlcoholLog): number => {
  const basePrice = AVERAGE_PRICES[log.drinkType] || AVERAGE_PRICES.other;
  return basePrice * (log.quantity || 1);
};

export const calculateFinancialStats = (logs: AlcoholLog[]): FinancialStats => {
  const now = new Date();
  const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(now); monthAgo.setDate(monthAgo.getDate() - 30);
  const yearAgo = new Date(now); yearAgo.setFullYear(yearAgo.getFullYear() - 1);
  const prevMonthStart = subMonths(startOfMonth(now), 1);
  const prevMonthEnd = endOfMonth(prevMonthStart);

  const filterByDate = (start: Date, end?: Date) => logs.filter((log) => {
    const logDate = new Date(log.timestamp);
    return logDate >= start && (!end || logDate <= end);
  });

  const dailyLogs = filterByDate(new Date(now.setHours(0, 0, 0, 0)));
  const weeklyLogs = filterByDate(weekAgo);
  const monthlyLogs = filterByDate(monthAgo);
  const yearlyLogs = filterByDate(yearAgo);
  const prevMonthLogs = filterByDate(prevMonthStart, prevMonthEnd);

  const calcSpend = (arr: AlcoholLog[]) => arr.reduce((sum, log) => sum + estimateSpendForLog(log), 0);

  const dailySpend = calcSpend(dailyLogs);
  const weeklySpend = calcSpend(weeklyLogs);
  const monthlySpend = calcSpend(monthlyLogs);
  const yearlySpend = calcSpend(yearlyLogs);
  const prevMonthSpend = calcSpend(prevMonthLogs);

  const daysPassed = logs.length > 0 ? Math.max(1, Math.ceil((Date.now() - new Date(logs[0].timestamp).getTime()) / 86400000)) : 1;
  const monthlyProjection = (monthlySpend / daysPassed) * 30;
  const yearlyProjection = monthlyProjection * 12;
  const vsPreviousMonth = prevMonthSpend > 0 ? ((monthlySpend - prevMonthSpend) / prevMonthSpend) * 100 : 0;
  const avgDailySpend = daysPassed > 0 ? monthlySpend / daysPassed : 0;

  const yearlyEquivalents = {
    coffees: Math.floor(yearlySpend / EQUIVALENTS.coffee.price),
    cinema: Math.floor(yearlySpend / EQUIVALENTS.cinema.price),
    concert: Math.floor(yearlySpend / EQUIVALENTS.concert.price),
    streaming: Math.floor(yearlySpend / EQUIVALENTS.streaming.price),
    books: Math.floor(yearlySpend / EQUIVALENTS.books.price),
    weekendTrips: Math.floor(yearlySpend / EQUIVALENTS.weekend_trip.price),
  };

  const byCategory: Record<string, number> = {};
  logs.forEach((log) => {
    const cat = log.drinkType;
    byCategory[cat] = (byCategory[cat] || 0) + estimateSpendForLog(log);
  });

  return {
    dailySpend: Math.round(dailySpend * 100) / 100,
    weeklySpend: Math.round(weeklySpend * 100) / 100,
    monthlySpend: Math.round(monthlySpend * 100) / 100,
    yearlySpend: Math.round(yearlySpend * 100) / 100,
    monthlyProjection: Math.round(monthlyProjection * 100) / 100,
    yearlyProjection: Math.round(yearlyProjection * 100) / 100,
    vsPreviousMonth: Math.round(vsPreviousMonth * 10) / 10,
    vsAverage: 0,
    avgDailySpend: Math.round(avgDailySpend * 100) / 100,
    yearlyEquivalents,
    potentialSavings: Math.round(yearlySpend * 0.5 * 100) / 100,
    byCategory,
  };
};

export const generateBudgetProjections = (currentSpend: number, months: number = 6) => {
  const projections = [];
  const now = new Date();
  for (let i = 0; i < months; i++) {
    const futureMonth = new Date(now);
    futureMonth.setMonth(futureMonth.getMonth() + i);
    projections.push({
      label: format(futureMonth, 'MMM yyyy'),
      value: currentSpend * (1 + i * 0.02),
      percentage: 100 + i * 2,
    });
  }
  return projections;
};

export const getBudgetStatus = (spent: number, limit: number): 'under' | 'near' | 'over' | 'none' => {
  if (limit <= 0) return 'none';
  const percentage = (spent / limit) * 100;
  if (percentage <= 70) return 'under';
  if (percentage <= 100) return 'near';
  return 'over';
};

export const getBudgetFeedback = (stats: FinancialStats, monthlyGoal: number): string => {
  if (stats.monthlySpend === 0) return 'Ce mois-ci, pas de dépenses enregistrées.';
  const status = getBudgetStatus(stats.monthlySpend, monthlyGoal);
  const percentage = monthlyGoal > 0 ? (stats.monthlySpend / monthlyGoal) * 100 : 0;
  switch (status) {
    case 'under': return `Tu es à ${Math.round(percentage)}% de ton budget. Excellent !`;
    case 'near': return `Tu approches de ton budget (${Math.round(percentage)}%).`;
    case 'over': return `${stats.potentialSavings.toFixed(0)}€ auraient pu être économisés.`;
    default: return 'Configure un objectif de budget.';
  }
};