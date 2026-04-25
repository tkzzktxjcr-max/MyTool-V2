"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Star, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Drink } from '@/features/alcohol/service';

interface QuickAddBarProps {
  favorites: Drink[];
  onQuickAdd: (drink: Drink) => void;
  onCreateDrink: () => void;
  onToggleFavorite: (drinkId: string) => void;
}

export default function QuickAddBar({ 
  favorites, 
  onQuickAdd, 
  onCreateDrink, 
  onToggleFavorite 
}: QuickAddBarProps) {
  const [pressedId, setPressedId] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<string | null>(null);

  const handleQuickAdd = (drink: Drink) => {
    setPressedId(drink.id);
    setShowConfirmation(drink.id);
    onQuickAdd(drink);
    
    // Reset after animation
    setTimeout(() => {
      setPressedId(null);
    }, 200);
    
    setTimeout(() => {
      setShowConfirmation(null);
    }, 1500);
  };

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Acces rapide</span>
        <span className="text-xs text-muted-foreground">
          {favorites.length > 0 ? `${favorites.length} favori${favorites.length > 1 ? 's' : ''}` : 'Aucun favori'}
        </span>
      </div>

      {/* Favorites bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {/* Favorite drinks */}
        <AnimatePresence mode="wait">
          {favorites.length > 0 ? (
            favorites.slice(0, 6).map((drink) => (
              <motion.button
                key={drink.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => handleQuickAdd(drink)}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-2xl min-w-[120px]",
                  "border transition-all duration-200",
                  pressedId === drink.id 
                    ? "bg-secondary border-secondary shadow-lg glow-secondary" 
                    : showConfirmation === drink.id
                      ? "bg-secondary/30 border-secondary/50"
                      : "bg-card border-white/10 hover:bg-white/5 active:bg-secondary/20"
                )}
              >
                <AnimatePresence mode="wait">
                  {showConfirmation === drink.id ? (
                    <motion.span
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="text-xl"
                    >
                      ✓
                    </motion.span>
                  ) : (
                    <motion.span
                      key="emoji"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="text-xl"
                    >
                      {drink.emoji}
                    </motion.span>
                  )}
                </AnimatePresence>
                <span className={cn(
                  "text-sm font-medium whitespace-nowrap max-w-[70px] truncate transition-colors",
                  pressedId === drink.id || showConfirmation === drink.id ? "text-secondary" : ""
                )}>
                  {drink.name}
                </span>
              </motion.button>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-2xl text-muted-foreground text-sm"
            >
              <Star className="w-4 h-4" />
              <span>Ajoute des favoris pour un acces rapide</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create button */}
        <Button
          variant="outline"
          onClick={onCreateDrink}
          className="flex-shrink-0 h-14 px-5 rounded-2xl border-dashed border-white/20 bg-transparent hover:bg-white/5"
        >
          <Plus className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">Creer</span>
        </Button>
      </div>

      {/* Quick tip */}
      {favorites.length === 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Ajoute des boissons en favoris pour les retrouver ici
        </p>
      )}
    </div>
  );
}