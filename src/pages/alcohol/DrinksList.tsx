"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, RotateCcw, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import MoodSelectorComponent from './MoodSelectorComponent';
import type { Drink } from '@/features/alcohol/hooks';
import type { DrinkType } from '@/features/alcohol/types';
import { DRINK_TYPES } from '@/features/alcohol/types';

interface DrinksListProps {
  drinks: Drink[];
  recentlyUsed: Drink[];
  onQuickLog: (drink: Drink, mood?: string) => void;
  onCustomize: (drinkType: DrinkType) => void;
  onReset: () => void;
}

export default function DrinksList({ drinks, recentlyUsed, onQuickLog, onCustomize, onReset }: DrinksListProps) {
  const [expandedDrink, setExpandedDrink] = useState<string | null>(null);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);

  const drinksByType = drinks.reduce((acc, drink) => {
    if (!acc[drink.type]) acc[drink.type] = [];
    acc[drink.type].push(drink);
    return acc;
  }, {} as Record<DrinkType, typeof drinks>);

  const handleQuickLog = (drink: Drink) => { setSelectedDrink(drink); setShowMoodSelector(true); };
  const confirmLog = (mood?: string) => { if (selectedDrink) { onQuickLog(selectedDrink, mood); setShowMoodSelector(false); setSelectedDrink(null); } };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-sm">Mes boissons</h3>
          <Button variant="ghost" size="sm" onClick={onReset}><RotateCcw className="w-4 h-4 mr-1" />Réinitialiser</Button>
        </div>
        {recentlyUsed.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Récents</p>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
              {recentlyUsed.map(drink => (
                <motion.button key={drink.id} whileTap={{ scale: 0.9 }} onClick={() => handleQuickLog(drink)} className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-full bg-secondary/20 text-secondary">
                  <span>{drink.emoji}</span><span className="text-sm font-medium whitespace-nowrap">{drink.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-2">
          {Object.entries(drinksByType).map(([type, typeDrinks]) => (
            <div key={type} className="rounded-xl overflow-hidden">
              <button onClick={() => setExpandedDrink(expandedDrink === type ? null : type)} className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{typeDrinks[0]?.emoji}</span>
                  <div className="text-left">
                    <p className="font-medium text-sm">{typeDrinks[0]?.name}</p>
                    <p className="text-xs text-muted-foreground">{typeDrinks[0]?.defaultServingSize} cl · {typeDrinks[0]?.abv}%{typeDrinks[0]?.userId && <span className="ml-2 text-secondary">✎</span>}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onCustomize(type as DrinkType); }} className="text-xs"><Settings className="w-3 h-3" /></Button>
                  {expandedDrink === type ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>
              <AnimatePresence>
                {expandedDrink === type && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="p-4 border-t border-white/10 space-y-2">
                      <p className="text-xs text-muted-foreground mb-2">Consommation rapide</p>
                      <div className="grid grid-cols-3 gap-2">
                        {typeDrinks.map(drink => (
                          <motion.button key={drink.id} whileTap={{ scale: 0.95 }} onClick={() => handleQuickLog(drink)} className="p-3 rounded-xl bg-white/5 hover:bg-secondary/20 text-center">
                            <p className="text-lg font-bold">{drink.defaultServingSize}</p><p className="text-xs text-muted-foreground">cl</p>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
        <AnimatePresence>
          {showMoodSelector && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Comment vous sentez-vous ?</span>
                <button onClick={() => confirmLog()} className="text-xs text-secondary">Passer</button>
              </div>
              <MoodSelectorComponent onSelect={confirmLog} />
            </div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}