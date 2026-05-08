import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Star, Check, Clock, ChevronRight, Beer, Wine, GlassWater, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PremiumEmptyState } from '@/components/ui/PremiumEmptyState';
import type { Drink } from '@/features/alcohol/services';
import { calculateUnits } from '@/features/alcohol/utils/units';
import { getTimeOfDay, type TimeOfDay } from '@/features/alcohol/services';

const TIME_LABELS: Record<TimeOfDay, string> = { morning: 'le matin', afternoon: "l'apres-midi", evening: 'le soir', night: 'la nuit' };

const getDrinkIcon = (type: string) => {
  switch (type) {
    case 'beer': case 'lager': case 'pilsner': case 'wheat_beer': case 'ipa': case 'ale':
      return Beer;
    case 'wine': case 'red_wine': case 'white_wine': case 'rose_wine': case 'champagne': case 'sangria':
      return Wine;
    default:
      return GlassWater;
  }
};

interface QuickAddBarProps {
  favorites: Drink[];
  suggestedFavorites?: Drink[];
  onQuickAdd: (drink: Drink) => void;
  onCreateDrink: () => void;
  onToggleFavorite: (drinkId: string) => void;
  userProfile?: { weightKg: number; sex: string };
  currentBAC?: number;
  legalLimit?: number;
  onShowAllDrinks?: () => void;
}

export default function QuickAddBar({ favorites, suggestedFavorites = [], onQuickAdd, onCreateDrink, onToggleFavorite, userProfile, currentBAC = 0, legalLimit = 0.5, onShowAllDrinks }: QuickAddBarProps) {
  const [pressedId, setPressedId] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<string | null>(null);
  const timeLabel = TIME_LABELS[getTimeOfDay()];

  const calcBAC = (drink: Drink): number => {
    if (!userProfile) return 0;
    const units = calculateUnits(drink.defaultServingSize, drink.abv);
    const r = userProfile.sex === 'female' ? 0.55 : 0.68;
    return currentBAC + (units * 10 * 0.789) / (userProfile.weightKg * r);
  };

  const getStatus = (bac: number) => {
    if (bac <= legalLimit * 0.8) return 'safe';
    if (bac <= legalLimit) return 'caution';
    return 'danger';
  };

  const handleQuickAdd = (drink: Drink) => {
    setPressedId(drink.id);
    setShowConfirmation(drink.id);
    onQuickAdd(drink);
    setTimeout(() => setPressedId(null), 200);
    setTimeout(() => setShowConfirmation(null), 2000);
  };

  const allDrinks = [...favorites];
  suggestedFavorites.forEach(d => { if (!allDrinks.find(x => x.id === d.id)) allDrinks.push(d); });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{favorites.length > 0 ? 'Accès rapide' : `Suggestions ${timeLabel}`}</span>
        <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />BAC preview</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
        {allDrinks.length > 0 ? allDrinks.slice(0, 6).map(drink => {
          const Icon = getDrinkIcon(drink.type);
          const previewBAC = userProfile ? calcBAC(drink) : null;
          const status = previewBAC !== null ? getStatus(previewBAC) : null;
          const units = calculateUnits(drink.defaultServingSize, drink.abv);
          const isFav = favorites.find(d => d.id === drink.id);
          return (
            <motion.button key={drink.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              onClick={() => handleQuickAdd(drink)} whileTap={{ scale: 0.95 }}
              className={cn("flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl min-w-[85px] border transition-all",
                pressedId === drink.id ? "bg-secondary border-secondary shadow-lg" : showConfirmation === drink.id ? "bg-secondary/30 border-secondary/50" : "bg-card border-white/10")}>
              <div className="flex items-center justify-between w-full mb-0.5">
                {previewBAC !== null && <span className={cn("px-1 py-0 rounded text-[9px] font-bold", status === 'safe' && "bg-secondary/20 text-secondary", status === 'caution' && "bg-[hsl(38,92%,50%)]/20 text-[hsl(38,92%,50%)]", status === 'danger' && "bg-accent/20 text-accent")}>~{previewBAC.toFixed(2)}</span>}
                {!isFav && <Star className="w-3 h-3 text-secondary/50" />}
              </div>
              <AnimatePresence mode="wait">
                {showConfirmation === drink.id ? (
                  <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-2xl"><Check className="w-6 h-6 text-secondary" /></motion.span>
                ) : (
                  <motion.span key="icon" initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-8 h-8 flex items-center justify-center">
                    <Icon className={cn("w-5 h-5", showConfirmation === drink.id ? "text-secondary" : "text-muted-foreground")} />
                  </motion.span>
                )}
              </AnimatePresence>
              <span className="text-xs font-medium whitespace-nowrap max-w-[70px] truncate">{drink.name}</span>
              <span className="text-[10px] text-muted-foreground">~{units.toFixed(1)} u</span>
            </motion.button>
          );
        }) : (
          <PremiumEmptyState icon={<Wine className="w-7 h-7 text-secondary" />} title="Pas encore de favoris" description="Ajoute tes boissons préférées" action={{ label: "Créer", onClick: onCreateDrink, variant: 'secondary' }} className="px-2 py-3" />
        )}
        <Button variant="outline" onClick={onCreateDrink} className="flex-shrink-0 h-[72px] px-4 rounded-2xl border-dashed border-white/20 bg-transparent hover:bg-white/5">
          <div className="flex flex-col items-center gap-1"><Plus className="w-5 h-5" /><span className="text-xs font-medium">Créer</span></div>
        </Button>
      </div>
      {onShowAllDrinks && allDrinks.length > 0 && (
        <button onClick={onShowAllDrinks} className="w-full py-2 text-sm text-muted-foreground hover:text-secondary flex items-center justify-center gap-1">
          <span>Voir toutes les boissons</span><ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}