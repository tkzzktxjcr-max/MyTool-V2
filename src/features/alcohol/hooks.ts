import { useDrinks } from './hooks/useDrinks';
import { useAlcoholLogs } from './hooks/useAlcoholLogs';
import { useAlcoholInsights } from './hooks/useAlcoholInsights';

export { type Drink } from './services';

export const useAlcohol = () => {
  const {
    drinks, libraryDrinks, userDrinks, favorites,
    isLoading: drinksLoading, isError: drinksError,
    createDrink, deleteDrink, toggleFavorite,
  } = useDrinks();

  const {
    logs, lastDeletedLog,
    isLoading: logsLoading, isError: logsError,
    quickLog: _quickLog, deleteLog, undoDelete,
    getTodayUnits, getWeeklyUnits,
  } = useAlcoholLogs();

  const {
    goal, userProfile,
    insights, bacState, isSafeToDrive,
    smartDrinks, suggestedFavorites, currentTimeOfDay, recentlyUsed,
    setWeeklyGoal, updateUserProfile, triggerCircleAlert,
    isLoading: insightsLoading, isError: insightsError,
  } = useAlcoholInsights(logs, drinks);

  // ── Cross-cutting: circle alerts after successful log ────────────────
  const quickLog = async (drink: any, mood?: any, quantity: number = 1, timestamp?: string) => {
    const result = await _quickLog(drink, mood, quantity, timestamp);
    const weeklyUnits = getWeeklyUnits();
    const weeklyLimit = goal?.weeklyLimit || 14;
    triggerCircleAlert(bacState.currentBAC, weeklyUnits, weeklyLimit);
    return result;
  };

  const isLoading = drinksLoading || logsLoading || insightsLoading;
  const isError = drinksError || logsError || insightsError;

  return {
    drinks, libraryDrinks, userDrinks, smartDrinks, favorites, recentlyUsed,
    suggestedFavorites, currentTimeOfDay,
    logs, goal, userProfile, isLoading, isError, insights, lastDeletedLog,
    bacState, isSafeToDrive,
    createDrink, quickLog, deleteLog, undoDelete, deleteDrink, toggleFavorite,
    setWeeklyGoal, updateUserProfile, getTodayUnits, getWeeklyUnits,
  };
};