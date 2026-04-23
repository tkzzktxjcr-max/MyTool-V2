"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Props { weeklyUnits: number; weeklyLimit: number; streak?: number; }

export default function WeeklyProgressComponent({ weeklyUnits, weeklyLimit, streak }: Props) {
  const progress = Math.min((weeklyUnits / weeklyLimit) * 100, 100);
  const remaining = weeklyLimit - weeklyUnits;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">Cette semaine</span></div>
          <span className="text-sm"><span className={cn("font-bold", weeklyUnits > weeklyLimit ? "text-destructive" : "text-secondary")}>{weeklyUnits.toFixed(1)}</span><span className="text-muted-foreground"> / {weeklyLimit} unités</span></span>
        </div>
        <div className="h-3 rounded-full bg-white/10 overflow-hidden mb-3">
          <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className={cn("h-full rounded-full", progress < 70 && "bg-secondary", progress >= 70 && progress < 100 && "bg-accent", progress >= 100 && "bg-destructive")} />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{remaining > 0 ? `${remaining.toFixed(1)} restantes` : 'Objectif atteint 🎉'}</span>
          {streak && <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-500" />{streak}j sans alcool</span>}
        </div>
      </CardContent>
    </Card>
  );
}