"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Star, Check, ChevronUp, ChevronDown, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Drink } from '@/features/alcohol/service';
import { calculateUnits } from './QuantitySelector';

interface QuickAddBarProps {
  favorites: Drink[];
  onQuickAdd: (drink: Drink) => void;
  onCreateDrink: () => void;
  onToggleFavorite: (drinkId: string) => void;
  showBACPreview?: boolean;
  userProfile?: {
    weightKg: number;
    sex: 'male' | 'female' | 'unspecified';
  };
  currentBAC?: number;
  logs?: any[];
}

export default function QuickAddBar({ 
  favorites, 
  onQuickAdd, 
  onCreateDrink, 
  onToggleFavorite,
  showBACPreview = true,
  userProfile,
  currentBAC = 0,
  logs = []
}: QuickAddBarProps) {
  const [pressedId, setPressedId] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<string | null>(null);
  const [selectedForPreview, setSelectedForPreview] = useState<Drink | null>(null);

  const handleQuickAdd = (drink: Drink) => {
    setPressedId(drink.id);
    setShowConfirmation(drink.id);
    onQuickAdd(drink);
    
    setTimeout(() => setPressedId(null), 200);
    setTimeout(() => setShowConfirmation(null), 1500);
  };

  // Calculate BAC after adding this drink
  const calculatePreviewBAC = (drink: Drink): number => {
    if (!userProfile) return 0;
    
    const drinkUnits = calculateUnits(drink.defaultServingSize, drink.abv, 1);
    const eliminationRate = 0.15; // g/L per hour
    const peakTime = 0.75; // hours
    
    // Simple estimation: add drink units to current
    const additionalBAC = (drinkUnits * 10 * 0.789) / (userProfile.weightKg * 0.68);
    return currentBAC + additionalBAC;
  };

  const formatBAC = (bac: number): string => {
    return bac.toFixed(2);
  };

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Accès rapide</span>
        <span className="text-xs text-muted-foreground">
          {favorites.length > 0 ? `${favorites.length} favori${favorites.length > 1 ? 's' : ''}` : 'Aucun favori'}
        </span>
      </div>

      {/* BAC Preview */}
      <AnimatePresence>
        {showBACPreview && selectedForPreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-secondary" />
                <span className="text-sm text-secondary">Après ce verre :</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-lg font-bold",
                  calculatePreviewBAC(selectedForPreview) <= 0.5 ? "text-secondary" :
                  calculatePreviewBAC(selectedForPreview) <= 0.8 ? "text-[hsl(38,92%,50%)]" : "text-accent"
                )}>
                  ~{formatBAC(calculatePreviewBAC(selectedForPreview))} g/L
                </span>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  calculatePreviewBAC(selectedForPreview) <= 0.5 ? "bg-secondary/20 text-secondary" :
                  calculatePreviewBAC(selectedForPreview) <= 0.8 ? "bg-[hsl(38,92%,50%)]/20 text-[hsl(38,92%,50%)]" : "bg-accent/20 text-accent"
                )}>
                  {calculatePreviewBAC(selectedForPreview) <= 0.5 ? "✓ Conduite OK" :
                   calculatePreviewBAC(selectedForPreview) <= 0.8 ? "~ Bientôt" : "Attendre"}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Favorites bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {/* Favorite drinks */}
        <AnimatePresence mode="wait">
          {favorites.length > 0 ? (
            favorites.slice(0, 6).map((drink) => {
              const previewBAC = showBACPreview && userProfile ? calculatePreviewBAC(drink) : null;
              
              return (
                <motion.button
                  key={drink.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => handleQuickAdd(drink)}
                  onMouseEnter={() => setSelectedForPreview(drink)}
                  onMouseLeave={() => setSelectedForPreview(null)}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "flex-shrink-0 flex flex-col items-start gap-1 px-4 py-3 rounded-2xl min-w-[100px]",
                    "border transition-all duration-200 relative",
                    pressedId === drink.id 
                      ? "bg-secondary border-secondary shadow-lg" 
                      : showConfirmation === drink.id
                        ? "bg-secondary/30 border-secondary/50"
                        : "bg-card border-white/10 hover:bg-white/5 active:bg-secondary/20",
                    selectedForPreview?.id === drink.id && showBACPreview && "border-secondary/50 bg-secondary/10"
                  )}
                >
                  {/* BAC Preview badge */}
                  {previewBAC !== null && selectedForPreview?.id === drink.id && (
                    <div className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-secondary text-white text-[10px] font-bold">
                      ~{formatBAC(previewBAC)}
                    </div>
                  )}
                  
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
                    "text-xs font-medium whitespace-nowrap truncate max-w-[80px]",
                    pressedId === drink.id || showConfirmation === drink.id ? "text-secondary" : ""
                  )}>
                    {drink.name}
                  </span>
                </motion.button>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-2xl text-muted-foreground text-sm"
            >
              <Star className="w-4 h-4" />
              <span>Ajoute des favoris</span>
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
          <span className="text-sm font-medium">Créer</span>
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