"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Check, X, Plus, Search, ChevronRight, Sparkles, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Drink } from '@/features/alcohol/services/drinks.service';
import type { DrinkType } from '@/features/alcohol/types';
import { DRINK_TYPES } from '@/features/alcohol/types';
import DrinkPicker from '@/features/alcohol/components/DrinkSearchWithPicker';
import MoodSelectorComponent from './MoodSelectorComponent';

interface QuickDrinkPanelProps {
  drinks: Drink[];
  recentlyUsed: Drink[];
  logs: any[];
  insights: any;
  goal: any;
  userProfile: any;
  bacState: any;
  onQuickLog: (drink: Drink, mood?: string) => Promise<any>;
  onCreateDrink: (data: { name: string; type: DrinkType; abv: number; defaultServingSize: number; emoji: string }) => Promise<Drink>;
  onDeleteLog: (logId: string) => Promise<any>;
  onSetWeeklyGoal: (limit: number) => Promise<any>;
  onUpdateProfile: (data: any) => Promise<any>;
  weeklyUnits: number;
  weeklyLimit: number;
}

export default function QuickDrinkPanel({
  drinks, recentlyUsed, logs, insights, goal, userProfile, bacState,
  onQuickLog, onCreateDrink, onDeleteLog, onSetWeeklyGoal, onUpdateProfile, weeklyUnits, weeklyLimit,
}: QuickDrinkPanelProps) {
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [success, setSuccess] = useState<Drink | null>(null);

  const handleDrinkSelect = (drink: Drink) => {
    setSelectedDrink(drink);
    setShowMoodSelector(true);
  };

  const handleConfirmLog = async (mood?: string) => {
    if (!selectedDrink) return;
    await onQuickLog(selectedDrink, mood);
    setShowMoodSelector(false);
    setSelectedDrink(null);
    setSuccess(selectedDrink);
    setTimeout(() => setSuccess(null), 2000);
  };

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
          <Activity className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <h2 className="font-semibold">Ajouter une consommation</h2>
          <p className="text-xs text-muted-foreground">Recherche, sélectionne ou crée</p>
        </div>
      </div>

      <DrinkPicker drinks={drinks} onSelect={handleDrinkSelect} onCreate={onCreateDrink} />

      <AnimatePresence>
        {showMoodSelector && selectedDrink && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="p-4 rounded-2xl bg-card border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedDrink.emoji}</span>
                <span className="font-medium">{selectedDrink.name}</span>
              </div>
              <button onClick={() => { setShowMoodSelector(false); setSelectedDrink(null); }} className="p-1 rounded-full hover:bg-white/10">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-2">Comment tu te sens ?</p>
              <MoodSelectorComponent onSelect={handleConfirmLog} />
            </div>
            <button onClick={() => handleConfirmLog()} className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Passer
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!showMoodSelector && recentlyUsed.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Récents
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {recentlyUsed.slice(0, 5).map(drink => (
              <button key={drink.id} onClick={() => handleDrinkSelect(drink)} className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 hover:bg-secondary/20 text-secondary transition-colors">
                <span>{drink.emoji}</span>
                <span className="text-sm font-medium whitespace-nowrap">{drink.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl bg-secondary text-white shadow-lg flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span className="font-medium">{success.name} ajouté !</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}