"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Flame, CheckCircle2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { calculateWeeklyProgress, getRiskLevel, getFeedbackMessage } from '@/features/alcohol/utils/units';

interface WeeklyProgressCardProps {
  weeklyUnits: number;
  weeklyLimit: number;
  streak?: number;
}

export default function WeeklyProgressCard({ weeklyUnits, weeklyLimit, streak }: WeeklyProgressCardProps) {
  const progress = calculateWeeklyProgress(weeklyUnits, weeklyLimit);
  const remaining = Math.max(weeklyLimit - weeklyUnits, 0);
  const isOverLimit = weeklyUnits > weeklyLimit;
  const isGoalAchieved = weeklyUnits <= weeklyLimit * 0.8;
  const riskLevel = getRiskLevel(weeklyUnits, weeklyLimit);

  const getStatusConfig = () => {
    if (isGoalAchieved) {
      return {
        color: 'text-secondary',
        bgClass: 'bg-secondary/20',
        progressClass: 'bg-secondary',
        icon: CheckCircle2,
        message: 'Excellente semaine !',
        emoji: '🌟',
      };
    }
    if (!isOverLimit) {
      return {
        color: 'text-[hsl(38,92%,50%)]',
        bgClass: 'bg-[hsl(38,92%,50%)]/20',
        progressClass: 'bg-[hsl(38,92%,50%)]',
        icon: Sparkles,
        message: 'Dans les clous',
        emoji: '✨',
      };
    }
    return {
      color: 'text-accent',
      bgClass: 'bg-accent/20',
      progressClass: 'bg-accent',
      icon: Calendar,
      message: 'Au-delà de la limite',
      emoji: '📊',
    };
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <Card className={cn("border-0", config.bgClass)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <IconComponent className={cn("w-4 h-4", config.color)} />
            <span className="text-sm text-muted-foreground">Cette semaine</span>
          </div>
          <span className="text-sm">
            <span className={cn("font-bold", config.color)}>{weeklyUnits.toFixed(1)}</span>
            <span className="text-muted-foreground"> / {weeklyLimit} unités</span>
          </span>
        </div>

        {/* Progress bar with shimmer */}
        <div className="relative">
          <div className="h-3 rounded-full bg-white/10 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={cn("h-full rounded-full shimmer", config.progressClass)}
            />
          </div>
          
          {/* Milestone markers */}
          <div className="absolute inset-0 flex justify-between px-0.5">
            <div className="w-px h-3 bg-white/20" />
            <div className="w-px h-3 bg-white/20" />
          </div>
        </div>

        {/* Status message */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{config.emoji}</span>
            <span className={cn("text-sm font-medium", config.color)}>{config.message}</span>
          </div>
          {remaining > 0 && !isOverLimit && (
            <span className="text-xs text-muted-foreground">
              {remaining.toFixed(1)} restantes
            </span>
          )}
        </div>

        {/* Progress percentage */}
        <div className="mt-2 text-center">
          <span className={cn(
            "text-2xl font-bold",
            progress <= 80 ? "text-secondary" : 
            progress <= 100 ? "text-[hsl(38,92%,50%)]" : 
            "text-accent"
          )}>
            {Math.round(progress)}%
          </span>
          <span className="text-xs text-muted-foreground ml-1">de l'objectif</span>
        </div>

        {/* Risk level indicator */}
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Niveau de risque</span>
            <span className={cn(
              "text-xs font-medium",
              riskLevel === 'low' && "text-secondary",
              riskLevel === 'moderate' && "text-[hsl(38,92%,50%)]",
              riskLevel === 'high' && "text-accent"
            )}>
              {riskLevel === 'low' && '✨ Faible'}
              {riskLevel === 'moderate' && '🌿 Modéré'}
              {riskLevel === 'high' && '📈 Élevé'}
            </span>
          </div>
        </div>

        {/* Streak */}
        {streak && streak > 0 && (
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              Série sans alcool
            </span>
            <span className="text-sm font-bold text-secondary">
              {streak}j
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}