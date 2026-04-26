"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Star, Check, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Drink } from '@/features/alcohol/service';
import { calculateUnits } from './QuantitySelector';

interface QuickAddBarProps {
  favorites: Drink[];
  onQuickAdd: (drink: Drink) => void;
  onCreateDrink: () => void;
  onToggleFavorite: (drinkId: string) => void;
  userProfile?: {
    weightKg: number;
    sex: 'male' | 'female' | 'unspecified';
  };
  currentBAC?: number;
  legalLimit?: number;
}

export default function QuickAddBar({ 
  favorites, 
  onQuickAdd, 
  onCreateDrink, 
  onToggleFavorite,
  userProfile,
  currentBAC = 0,
  legalLimit = 0.5
}: QuickAddBarProps) {
  const [pressedId, setPressedId] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<string | null>(null);
  const [lastAddedDrink, setLastAddedDrink] = useState<Drink | null>(null);

  // Calculate BAC after adding this drink
  const calculatePreviewBAC = (drink: Drink): number => {
    if (!userProfile) return 0;
    const drinkUnits = calculateUnits(drink.defaultServingSize, drink.abv, 1);
    const r = userProfile.sex === 'female' ? 0.55 : 0.68;
    const additionalBAC = (drinkUnits * 10 * 0.789) / (userProfile.weightKg * r);
    return currentBAC + additionalBAC;
  };

  // Get driving status color
  const getBACStatus = (bac: number): 'safe' | 'caution' | 'danger' => {
    if (bac <= legalLimit * 0.8) return 'safe';
    if (bac <= legalLimit) return 'caution';
    return 'danger';
  };

  const formatBAC = (bac: number): string => {
    return bac.toFixed(2);
  };

  const handleQuickAdd = (drink: Drink) => {
    setPressedId(drink.id);
    setShowConfirmation(drink.id);
    setLastAddedDrink(drink);
    onQuickAdd(drink);
    
    setTimeout(() => setPressedId(null), 200);
    setTimeout(() => setShowConfirmation(null), 2000);
  };

  // Get badge color class based on BAC status
  const getBadgeColor = (status: 'safe' | 'caution' | 'danger') => {
    switch (status) {
      case 'safe': return 'bg-secondary/20 text-secondary';
      case 'caution': return 'bg-[hsl(38,92%,50%)]/20 text-[hsl(38,92%,50%)]';
      case 'danger': return 'bg-accent/20 text-accent';
    }
  };

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Accès rapide</span>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>Preview visible</span>
        </div>
      </div>

      {/* Favorites bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
        {/* Favorite drinks with always visible BAC preview */}
        {favorites.length > 0 ? (
          favorites.slice(0, 6).map((drink) => {
            const previewBAC = userProfile ? calculatePreviewBAC(drink) : null;
            const status = previewBAC !== null ? getBACStatus(previewBAC) : null;
            
            return (
              <motion.button
                key={drink.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => handleQuickAdd(drink)}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2.5 rounded-2xl min-w-[85px]",
                  "border transition-all duration-200 relative",
                  pressedId === drink.id 
                    ? "bg-secondary border-secondary shadow-lg" 
                    : showConfirmation === drink.id
                      ? "bg-secondary/30 border-secondary/50"
                      : "bg-card border-white/10 hover:bg-white/5 active:bg-secondary/20"
                )}
              >
                {/* Confirmation checkmark */}
                <AnimatePresence mode="wait">
                  {showConfirmation === drink.id ? (
                    <motion.span
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="text-2xl"
                    >
                      ✓
                    </motion.span>
                  ) : (
                    <motion.span
                      key="emoji"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="text-2xl"
                    >
                      {drink.emoji}
                    </motion.span>
                  )}
                </AnimatePresence>
                
                {/* Drink name */}
                <span className={cn(
                  "text-xs font-medium whitespace-nowrap max-w-[70px] truncate",
                  pressedId === drink.id || showConfirmation === drink.id ? "text-secondary" : ""
                )}>
                  {drink.name}
                </span>
                
                {/* Always visible BAC preview badge */}
                {previewBAC !== null && (
                  <div className={cn(
                    "absolute -top-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap",
                    getBadgeColor(status!)
                  )}>
                    ~{formatBAC(previewBAC)} g/L
                  </div>
                )}
              </motion.button>
            );
          })
        ) : (
          <div className="flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-2xl text-muted-foreground text-sm">
            <Star className="w-4 h-4" />
            <span>Ajoute des favoris pour accès rapide</span>
          </div>
        )}

        {/* Create button */}
        <Button
          variant="outline"
          onClick={onCreateDrink}
          className="flex-shrink-0 h-[72px] px-4 rounded-2xl border-dashed border-white/20 bg-transparent hover:bg-white/5"
        >
          <div className="flex flex-col items-center gap-1">
            <Plus className="w-5 h-5" />
            <span className="text-xs font-medium">Créer</span>
          </div>
        </Button>
      </div>

      {/* Legend */}
      {favorites.length > 0 && userProfile && (
        <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            OK
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[hsl(38,92%,50%)]" />
            Bientôt
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-accent" />
            Attendre
          </span>
        </div>
      )}

      {/* Quick tip */}
      {favorites.length === 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Ajoute des boissons en favoris pour voir l'impact BAC
        </p>
      )}
    </div>
  );
}