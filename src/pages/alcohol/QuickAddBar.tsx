"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Drink } from '@/features/alcohol/services/drinks.service';

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

  const handleQuickAdd = (drink: Drink) => {
    setPressedId(drink.id);
    onQuickAdd(drink);
    setTimeout(() => setPressedId(null), 200);
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {/* Favorite drinks */}
      {favorites.slice(0, 6).map((drink) => (
        <motion.button
          key={drink.id}
          onClick={() => handleQuickAdd(drink)}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "flex-shrink-0 flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-card border border-white/10",
            "hover:bg-white/5 active:bg-secondary/20 transition-all duration-150",
            pressedId === drink.id && "bg-secondary/20 border-secondary/30"
          )}
        >
          <span className="text-xl">{drink.emoji}</span>
          <span className="text-sm font-medium whitespace-nowrap max-w-[80px] truncate">
            {drink.name}
          </span>
        </motion.button>
      ))}

      {/* Add button */}
      <Button
        variant="outline"
        onClick={onCreateDrink}
        className="flex-shrink-0 h-11 px-4 rounded-2xl border-dashed border-white/20 bg-transparent hover:bg-white/5"
      >
        <Plus className="w-4 h-4 mr-1.5" />
        <span className="text-sm">Creer</span>
      </Button>

      {/* Favorite toggle hint if no favorites */}
      {favorites.length === 0 && (
        <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2.5 rounded-2xl text-muted-foreground text-xs">
          <Star className="w-3.5 h-3.5" />
          <span>Ajoute des favoris</span>
        </div>
      )}
    </div>
  );
}