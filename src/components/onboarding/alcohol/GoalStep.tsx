"use client";

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Target, Scale, TrendingDown, Dumbbell, Ban, Check } from 'lucide-react';
import type { AlcoholGoal } from './useAlcoholOnboarding';

interface GoalOption {
  id: AlcoholGoal;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
}

const GOALS: GoalOption[] = [
  { id: 'discover', icon: Target, label: 'Découvrir', description: 'Je veux juste suivre ma consommation' },
  { id: 'moderate', icon: Scale, label: 'Modérer', description: 'Boire de manière responsable' },
  { id: 'reduce', icon: TrendingDown, label: 'Réduire', description: 'Diminuer progressivement' },
  { id: 'sport', icon: Dumbbell, label: 'Sport', description: 'Optimiser ma récupération' },
  { id: 'quit', icon: Ban, label: 'Arrêter', description: 'Zéro alcool' },
];

interface GoalStepProps {
  selectedGoal: AlcoholGoal;
  onSelectGoal: (goal: AlcoholGoal) => void;
}

export function GoalStep({ selectedGoal, onSelectGoal }: GoalStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-secondary" />
        </div>
        <h2 className="text-xl font-bold">Quel est votre objectif ?</h2>
        <p className="text-sm text-muted-foreground">
          Choisissez l'objectif qui vous correspond le mieux
        </p>
      </div>

      <div className="space-y-3">
        {GOALS.map((goal, index) => {
          const isSelected = selectedGoal === goal.id;
          const IconComponent = goal.icon;
          
          return (
            <motion.button
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectGoal(goal.id)}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left",
                isSelected
                  ? "border-secondary bg-secondary/10 shadow-lg shadow-secondary/20"
                  : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
              )}
            >
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
                isSelected ? "bg-secondary/20" : "bg-white/10"
              )}>
                <IconComponent className={cn("w-6 h-6", isSelected ? "text-secondary" : "text-muted-foreground")} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-semibold text-base transition-all",
                  isSelected ? "text-secondary" : ""
                )}>
                  {goal.label}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {goal.description}
                </p>
              </div>

              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                isSelected
                  ? "border-secondary bg-secondary"
                  : "border-white/30"
              )}>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 rounded-full bg-white"
                  />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Vos données sont privées et vous appartiennent
      </p>
    </div>
  );
}