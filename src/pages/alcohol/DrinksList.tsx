"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, RotateCcw, Settings, Trash2, Star } from 'lucide-react';
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
  onDelete: (drinkId: string) => void;
  onReset: () => void;
}

export default function DrinksList({ drinks, recentlyUsed, onQuickLog, onCustomize, onDelete, onReset }: DrinksListProps) {
  const [expandedDrink, setExpandedDrink] = useState<string | null>(null);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);

  // Séparer les drinks personnalisés (userId) des defaults
  const customDrinks = drinks.filter(d => d.userId);
  const defaultDrinks = drinks.filter(d => !d.userId || d.id.startsWith('default-'));
  
  // Tous les drinks uniques par type (custom écrase default)
  const drinksByType = drinks.reduce((acc, drink) => {
    if (!acc[drink.type]) acc[drink.type] = [];
    if (!acc[drink.type].find(d => d.id === drink.id)) {
      acc[drink.type].push(drink);
    }
    return acc;
  }, {} as Record<DrinkType, typeof drinks>);

  const handleQuickLog = (drink: Drink) => { 
    setSelectedDrink(drink); 
    setShowMoodSelector(true); 
  };
  
  const confirmLog = (mood?: string) => { 
    if (selectedDrink) { 
      onQuickLog(selectedDrink, mood); 
      setShowMoodSelector(false); 
      setSelectedDrink(null); 
    } 
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-sm">Mes boissons</h3>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onReset} className="text-xs h-7">
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </Button>
          </div>
        </div>

        {/* Recently used */}
        {recentlyUsed.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Récents</p>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
              {recentlyUsed.map(drink => (
                <motion.button
                  key={drink.id}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleQuickLog(drink)}
                  className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-full bg-secondary/20 text-secondary"
                >
                  <span>{drink.emoji}</span>
                  <span className="text-sm font-medium whitespace-nowrap">{drink.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Custom drinks section */}
        {customDrinks.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Star className="w-3 h-3 text-accent" />
              Mes créations
            </p>
            <div className="space-y-2">
              {customDrinks.map(drink => (
                <div key={drink.id} className="flex items-center gap-3 p-3 rounded-xl bg-accent/10 border border-accent/20">
                  <button
                    onClick={() => handleQuickLog(drink)}
                    className="flex items-center gap-3 flex-1"
                  >
                    <span className="text-2xl">{drink.emoji}</span>
                    <div className="text-left">
                      <p className="font-medium text-sm">{drink.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {drink.defaultServingSize} cl · {drink.abv}%
                      </p>
                    </div>
                  </button>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onCustomize(drink.type)}
                      className="text-xs h-7"
                    >
                      <Settings className="w-3 h-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onDelete(drink.id)}
                      className="text-xs h-7 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Default drinks */}
        <div className="space-y-2">
          {Object.entries(drinksByType).map(([type, typeDrinks]) => {
            const defaultDrink = typeDrinks.find(d => !d.userId || d.id.startsWith('default-'));
            if (!defaultDrink) return null;
            
            return (
              <div key={type} className="rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedDrink(expandedDrink === type ? null : type)}
                  className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{defaultDrink.emoji}</span>
                    <div className="text-left">
                      <p className="font-medium text-sm">{defaultDrink.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {defaultDrink.defaultServingSize} cl · {defaultDrink.abv}%
                        {typeDrinks.length > 1 && <span className="ml-2 text-accent">✎</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => { e.stopPropagation(); onCustomize(type as DrinkType); }}
                      className="text-xs h-7"
                    >
                      <Settings className="w-3 h-3" />
                    </Button>
                    {expandedDrink === type ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                <AnimatePresence>
                  {expandedDrink === type && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 border-t border-white/10 space-y-2">
                        <p className="text-xs text-muted-foreground mb-2">Consommation rapide</p>
                        <div className="grid grid-cols-3 gap-2">
                          {typeDrinks.map(drink => (
                            <motion.button
                              key={drink.id}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleQuickLog(drink)}
                              className="p-3 rounded-xl bg-white/5 hover:bg-secondary/20 text-center"
                            >
                              <p className="text-lg font-bold">{drink.defaultServingSize}</p>
                              <p className="text-xs text-muted-foreground">cl</p>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Mood selector */}
        <AnimatePresence>
          {showMoodSelector && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Comment vous sentez-vous ?</span>
                <button onClick={() => confirmLog()} className="text-xs text-secondary">
                  Passer
                </button>
              </div>
              <MoodSelectorComponent onSelect={confirmLog} />
            </div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}