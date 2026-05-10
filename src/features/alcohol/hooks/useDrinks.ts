import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context';
import { drinksService, initializeDefaultDrinks, type Drink } from '../services';
import type { CreateDrinkForm } from '../types';
import { deduplicateDrinks } from '../utils/dedup';
import { toast } from 'sonner';

const STALE_TIME = 2 * 60 * 1000;

export const useDrinks = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.$id;
  const [hasInitializedDefaults, setHasInitializedDefaults] = useState(false);

  const drinksQuery = useQuery({
    queryKey: ['drinks'],
    queryFn: () => drinksService.getAllDrinks(),
    staleTime: STALE_TIME,
  });

  useEffect(() => {
    if (!userId || hasInitializedDefaults || drinksQuery.isLoading) return;
    const globalDrinks = drinksQuery.data?.filter((d) => !d.userId) ?? [];
    if (globalDrinks.length > 0) {
      setHasInitializedDefaults(true);
      return;
    }
    initializeDefaultDrinks()
      .then((result) => {
        if (result.created > 0) queryClient.invalidateQueries({ queryKey: ['drinks'] });
        setHasInitializedDefaults(true);
      })
      .catch(() => setHasInitializedDefaults(true));
  }, [userId, drinksQuery.data, drinksQuery.isLoading, hasInitializedDefaults, queryClient]);

  const rawDrinks = drinksQuery.data ?? [];
  const drinks = useMemo(() => deduplicateDrinks(rawDrinks, userId), [rawDrinks, userId]);

  const libraryDrinks = useMemo(() =>
    drinks.filter(d => !d.userId).sort((a, b) => (b.popularity || 0) - (a.popularity || 0)),
    [drinks]
  );
  const userDrinks = useMemo(() =>
    drinks.filter(d => d.userId === userId).sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0)),
    [drinks, userId]
  );
  const favorites = useMemo(() =>
    drinks.filter(d => d.isFavorite).sort((a, b) => (a.favoriteRank || 5) - (b.favoriteRank || 5)),
    [drinks]
  );

  const createDrinkMutation = useMutation({
    mutationFn: async ({ form, emoji }: { form: CreateDrinkForm; emoji?: string }) => {
      if (!userId) throw new Error('Not authenticated');
      const existing = await drinksService.findExistingDrink(form.name, form.type);
      if (existing) return existing;
      return drinksService.createDrink({
        name: form.name, type: form.type, abv: form.abv,
        defaultServingSize: form.defaultServingSize, emoji: emoji || '🥤',
        country: form.country, userId,
      });
    },
    onSuccess: (drink) => {
      queryClient.invalidateQueries({ queryKey: ['drinks'] });
      if (!drink.userId || drink.isGlobal) {
        toast.info('Boisson déjà existante', { description: `"${drink.name}" existe déjà dans la bibliothèque.` });
      }
    },
  });

  const deleteDrinkMutation = useMutation({
    mutationFn: (drinkId: string) => drinksService.deleteDrink(drinkId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['drinks'] }),
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: (drinkId: string) => drinksService.toggleFavorite(drinkId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['drinks'] }),
  });

  return {
    drinks, libraryDrinks, userDrinks, favorites,
    isLoading: drinksQuery.isLoading,
    isError: drinksQuery.isError,
    createDrink: (form: CreateDrinkForm, emoji?: string) => createDrinkMutation.mutateAsync({ form, emoji }),
    deleteDrink: (drinkId: string) => deleteDrinkMutation.mutateAsync(drinkId),
    toggleFavorite: (drinkId: string) => toggleFavoriteMutation.mutateAsync(drinkId),
  };
};