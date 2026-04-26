"use client";

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeeklyGoalProgressProps {
  currentUnits: number;
  goalUnits: number;
}

export default function WeeklyGoalProgress({ currentUnits, goalUnits }: WeeklyGoalProgressProps) {
  const progress = goalUnits > 0 ? Math.min((currentUnits / goalUnits) * 100, 150) : 0;
  const remaining = Math.max(goalUnits - currentUnits, 0);
  const isOverLimit = currentUnits > goalUnits;
  const isGoalAchieved = currentUnits <= goalUnits * 0.8;

  const getProgressColor = () => {
    if (isOverLimit) return 'bg-accent';
    if (progress <= 70) return 'bg-secondary';
    return 'bg-[hsl(38,92%,50%)]';
  };

  return (
    <Card className={cn(!isOverLimit && "border-secondary/20")}>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className={cn("w-5 h-5", isOverLimit ? "text-accent" : "text-secondary")} />
            <span className="font-semibold">Objectif hebdomadaire</span>
          </div>
          <span className={cn("text-sm font-medium", isOverLimit ? "text-accent" : "text-secondary")}>
            {currentUnits.toFixed(1)} / {goalUnits}
          </span>
        </div>
        <div className="h-4 rounded-full bg-white/10 overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(progress, 100)}%` }} className={cn("h-full rounded-full", getProgressColor())} />
        </div>
        <div className="flex justify-between">
          <span className={cn("text-sm font-medium", isOverLimit ? "text-accent" : "text-secondary")}>
            {currentUnits === 0 ? 'Semaine parfaite' : isGoalAchieved ? 'Excellente semaine' : !isOverLimit ? 'Dans les clous' : 'Au-dela'}
          </span>
          {!isOverLimit && remaining > 0 && <span className="text-sm text-muted-foreground">{remaining.toFixed(1)} restantes</span>}
        </div>
        <div className="text-center">
          <span className={cn("text-3xl font-bold", progress <= 80 && "text-secondary", progress > 80 && progress <= 100 && "text-[hsl(38,92%,50%)]", progress > 100 && "text-accent")}>{Math.round(progress)}%</span>
          <span className="text-sm text-muted-foreground ml-1">de l'objectif</span>
        </div>
        {isGoalAchieved && currentUnits > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-2 p-3 rounded-xl bg-secondary/10">
            <Check className="w-5 h-5 text-secondary" />
            <span className="text-sm text-secondary font-medium">Sous ton objectif</span>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}