import { motion } from 'framer-motion';
import { Check, Sparkles, Beer, Wine, CupSoda, Apple } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DrinkOption } from './useAlcoholOnboarding';

interface FavoritesStepProps {
  drinks: DrinkOption[];
  selectedDrinks: string[];
  onToggleDrink: (drinkId: string) => void;
}

export function FavoritesStep({ drinks, selectedDrinks, onToggleDrink }: FavoritesStepProps) {
  const canProceed = selectedDrinks.length > 0;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center mx-auto mb-4">
          <Beer className="w-8 h-8 text-secondary" />
        </div>
        <h2 className="text-xl font-bold">Vos boissons favorites</h2>
        <p className="text-sm text-muted-foreground">
          Sélectionnez vos consommations habituelles pour un accès rapide
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {drinks.map((drink, index) => {
          const isSelected = selectedDrinks.includes(drink.id);
          
          return (
            <motion.button
              key={drink.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onToggleDrink(drink.id)}
              className={cn(
                "relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                isSelected ? "border-secondary bg-secondary/10" : "border-white/10 bg-white/5 hover:bg-white/10"
              )}
            >
              <div className={cn(
                "absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                isSelected ? "border-secondary bg-secondary" : "border-white/30"
              )}>
                {isSelected && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <Check className="w-3.5 h-3.5 text-white" />
                  </motion.div>
                )}
              </div>

              <span className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                isSelected ? "bg-secondary/20" : "bg-white/10"
              )}>
                {drink.emoji === '🍺' && <Beer className={cn("w-6 h-6", isSelected ? "text-secondary" : "text-muted-foreground")} />}
                {drink.emoji === '🍷' && <Wine className={cn("w-6 h-6", isSelected ? "text-secondary" : "text-muted-foreground")} />}
                {drink.emoji === '🥃' && <CupSoda className={cn("w-6 h-6", isSelected ? "text-secondary" : "text-muted-foreground")} />}
                {drink.emoji === '🍹' && <CupSoda className={cn("w-6 h-6", isSelected ? "text-secondary" : "text-muted-foreground")} />}
                {drink.emoji === '🍎' && <Apple className={cn("w-6 h-6", isSelected ? "text-secondary" : "text-muted-foreground")} />}
                {!['🍺', '🍷', '🥃', '🍹', '🍎'].includes(drink.emoji) && (
                  <Beer className={cn("w-6 h-6", isSelected ? "text-secondary" : "text-muted-foreground")} />
                )}
              </span>
              <div className="text-center">
                <p className={cn("font-medium text-sm", isSelected ? "text-secondary" : "")}>
                  {drink.name}
                </p>
                <p className="text-xs text-muted-foreground">{drink.volumeCl}cl • {drink.abv}°</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className={cn(
        "text-center p-3 rounded-xl transition-all",
        canProceed ? "bg-secondary/10 text-secondary" : "bg-white/5 text-muted-foreground"
      )}>
        <p className="text-sm">
          {canProceed ? (
            <><span className="font-bold">{selectedDrinks.length}</span> sélectionnée{selectedDrinks.length > 1 ? 's' : ''}</>
          ) : (
            <><Sparkles className="w-4 h-4 inline mr-1" />Sélectionnez au moins 1 boisson</>
          )}
        </p>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Vous pourrez ajouter d'autres boissons ou créer les vôtres plus tard
      </p>
    </div>
  );
}