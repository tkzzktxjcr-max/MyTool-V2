"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Star, Check, Clock, ChevronRight, Beer, Wine, CupSoda, Apple, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PremiumEmptyState } from '@/components/ui/PremiumEmptyState';
import type { Drink } from '@/features/alcohol/services';
import { calculateUnits } from '@/features/alcohol/utils/units';
import { getTimeOfDay, type TimeOfDay } from '@/features/alcohol/services';
import { GlassWater, Sun, Sunset, Moon } from 'lucide-react';

interface QuickAddBarProps {
  favorites: Drink[];
  suggestedFavorites?: Drink[];
  onQuickAdd: (drink: Drink) => void;
  onCreateDrink: () => void;
  onToggleFavorite: (drinkId: string) => void;
  userProfile?: {
    weightKg: number;
    sex: 'male' | 'female' | 'unspecified';
  };
  currentBAC?: number;
  legalLimit?: number;
  onShowAllDrinks?: () => void;
}

const TIME_LABELS: Record<TimeOfDay, string> = {
  morning: 'le matin',
  afternoon: "l'apres-midi",
  evening: 'le soir',
  night: 'la nuit',
};

const getDrinkIconComponent = (type: string) => {
  switch (type) {
    case 'beer':
    case 'lager':
    case 'pilsner':
    case 'wheat_beer':
    case 'ipa':
    case 'ale':
      return Beer;
    case 'wine':
    case 'red_wine':
    case 'white_wine':
    case 'rose_wine':
    case 'champagne':
    case 'sangria':
      return Wine;
    case 'spirit':
    case 'whisky':
    case 'tequila':
    case 'brandy':
    case 'cognac':
    case 'cocktail':
    case 'martini':
    case 'mojito':
    case 'margarita':
    case 'old_fashioned':
    case 'cosmopolitan':
    case 'aperol_spritz':
    case 'sparkling':
      return CupSoda;
    case 'cider':
    case 'calvados':
      return Apple;
    case 'vodka':
    case 'rum':
    case 'gin':
    case 'soju':
      return GlassWater;
    default:
      return Beer;
  }
};

export default function QuickAddBar({ 
  favorites, 
  suggestedFavorites = [],
  onQuickAdd, 
  onCreateDrink, 
  onToggleFavorite,
  userProfile,
  currentBAC = 0,
  legalLimit = 0.5,
  onShowAllDrinks
}: QuickAddBarProps) {
  const [pressedId, setPressedId] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<string | null>(null);

  const timeOfDay = getTimeOfDay();
  const timeLabel = TIME_LABELS[timeOfDay];

  const calculatePreviewBAC = (drink: Drink): number => {
    if (!userProfile) return 0;
    const drinkUnits = calculateUnits(drink.defaultServingSize, drink.abv);
    const r = userProfile.sex === 'female' ? 0.55 : 0.68;
    return currentBAC + (drinkUnits * 10 * 0.789) / (userProfile.weightKg * r);
  };

  const getBACStatus = (bac: number): 'safe' | 'caution' | 'danger' => {
    if (bac <= legalLimit * 0.8) return 'safe';
    if (bac <= legalLimit) return 'caution';
    return 'danger';
  };

  const formatBAC = (bac: number): string => bac.toFixed(2);

  const handleQuickAdd = (drink: Drink) => {
    setPressedId(drink.id);
    setShowConfirmation(drink.id);
    onQuickAdd(drink);
    setTimeout(() => setPressedId(null), 200);
    setTimeout(() => setShowConfirmation(null), 2000);
  };

  const getBadgeColor = (status: 'safe' | 'caution' | 'danger') => {
    switch (status) {
      case 'safe': return 'bg-secondary/20 text-secondary';
      case 'caution': return 'bg-[hsl(38,92%,50%)]/20 text-[hsl(38,92%,50%)]';
      case 'danger': return 'bg-accent/20 text-accent';
    }
  };

  const allQuickDrinks = [...favorites];
  suggestedFavorites.forEach(drink => {
    if (!allQuickDrinks.find(d => d.id === drink.id)) {
      allQuickDrinks.push(drink);
    }
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {favorites.length > 0 ? 'Accès rapide' : `Suggestions ${timeLabel}`}
        </span>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>BAC preview visible</span>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
        {allQuickDrinks.length > 0 ? (
          allQuickDrinks.slice(0, 6).map((drink) => {
            const previewBAC = userProfile ? calculatePreviewBAC(drink) : null;
            const status = previewBAC !== null ? getBACStatus(previewBAC) : null;
            const isFavorite = favorites.find(d => d.id === drink.id);
            const drinkUnits = calculateUnits(drink.defaultServingSize, drink.abv);
            const IconComponent = getDrinkIconComponent(drink.type);
            
            return (
              <motion.button
                key={drink.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => handleQuickAdd(drink)}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl min-w-[85px]",
                  "border transition-all duration-200 relative",
                  pressedId === drink.id
                    ? "bg-secondary border-secondary shadow-lg"
                    : showConfirmation === drink.id
                      ? "bg-secondary/30 border-secondary/50"
                      : "bg-card border-white/10 hover:bg-white/5 active:bg-secondary/20",
                  !isFavorite && suggestedFavorites.find(d => d.id === drink.id) && "border-dashed border-secondary/30"
                )}
              >
                <div className="flex items-center justify-between w-full mb-0.5">
                  {previewBAC !== null && (
                    <span className={cn("px-1 py-0 rounded text-[9px] font-bold", getBadgeColor(status))}>
                      ~{formatBAC(previewBAC)}
                    </span>
                  )}
                  {!isFavorite && <Star className="w-3 h-3 text-secondary/50" />}
                </div>
                
                <AnimatePresence mode="wait">
                  {showConfirmation === drink.id ? (
                    <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="text-2xl">
                      <Check className="w-6 h-6 text-secondary" />
                    </motion.span>
                  ) : (
                    <motion.span key="icon" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="w-8 h-8 flex items-center justify-center">
                      <IconComponent className={cn("w-5 h-5", pressedId === drink.id || showConfirmation === drink.id ? "text-secondary" : "text-muted-foreground")} />
                    </motion.span>
                  )}
                </AnimatePresence>
                
                <span className={cn(
                  "text-xs font-medium whitespace-nowrap max-w-[70px] truncate",
                  pressedId === drink.id || showConfirmation === drink.id ? "text-secondary" : ""
                )}>
                  {drink.name}
                </span>

                <span className="text-[10px] text-muted-foreground">~{drinkUnits.toFixed(1)} u</span>
              </motion.button>
            );
          })
        ) : (
          <PremiumEmptyState
            icon={<Wine className="w-7 h-7 text-secondary" />}
            title="Pas encore de favoris"
            description={`Ajoute tes boissons préférées pour un accès rapide ${timeLabel}`}
            action={{ label: "Créer une boissons", onClick: onCreateDrink, variant: 'secondary' }}
            className="px-2 py-3"
          />
        )}

        <Button variant="outline" onClick={onCreateDrink}
          className="flex-shrink-0 h-[72px] px-4 rounded-2xl border-dashed border-white/20 bg-transparent hover:bg-white/5">
          <div className="flex flex-col items-center gap-1">
            <Plus className="w-5 h-5" />
            <span className="text-xs font-medium">Créer</span>
          </div>
        </Button>
      </div>

      {onShowAllDrinks && allQuickDrinks.length > 0 && (
        <button onClick={onShowAllDrinks}
          className="w-full py-2 text-sm text-muted-foreground hover:text-secondary transition-colors flex items-center justify-center gap-1">
          <span>Voir toutes les boissons</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {allQuickDrinks.length > 0 && userProfile && (
        <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary" />OK</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[hsl(38,92%,50%)]" />Bientôt</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent" />Attendre</span>
        </div>
      )}

      {favorites.length === 0 && suggestedFavorites.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">Basé sur tes habitudes {timeLabel}</p>
      )}
    </div>
  );
}