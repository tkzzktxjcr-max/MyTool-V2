"use client";

import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Sparkles, Target, Flame, ThumbsUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { AlcoholInsight } from '@/features/alcohol/types';

interface InsightsCardProps { insights: AlcoholInsight | null; }

export default function InsightsCard({ insights }: InsightsCardProps) {
  // Premium empty state - narrative and encouraging
  if (!insights || insights.totalWeeklyUnits === 0) {
    return (
      <Card className="border-0 bg-gradient-to-br from-secondary/5 to-accent/5">
        <CardContent className="p-5 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4"
          >
            <div className="text-6xl mb-2">🌱</div>
          </motion.div>
          <h3 className="text-lg font-semibold mb-2">Cultive ta conscience</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Chaque verre ajouté t'aide à mieux comprendre tes habitudes et à évoluer positivement.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-secondary">
            <Sparkles className="w-4 h-4" />
            <span>Ajoute ta première consommation pour commencer</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Premium positive risk levels
  const getRiskConfig = () => {
    switch (insights.riskLevel) {
      case 'low':
        return {
          label: '✨ Léger',
          color: 'text-secondary',
          bgClass: 'bg-secondary/20',
          borderClass: 'border-secondary/30',
          icon: ThumbsUp,
        };
      case 'moderate':
        return {
          label: '🌿 Modéré',
          color: 'text-[hsl(38,92%,50%)]',
          bgClass: 'bg-[hsl(38,92%,50%)]/20',
          borderClass: 'border-[hsl(38,92%,50%)]/30',
          icon: Target,
        };
      case 'high':
        return {
          label: '🌱 En évolution',
          color: 'text-accent',
          bgClass: 'bg-accent/20',
          borderClass: 'border-accent/30',
          icon: TrendingUp,
        };
    }
  };

  const riskConfig = getRiskConfig();
  const RiskIcon = riskConfig.icon;
  const maxUnits = Math.max(...insights.dailyTrend.map(d => d.units), 2);

  // Calculate if goal is achieved
  const isGoalAchieved = insights.weeklyGoalProgress < 100;
  const underGoalPercent = Math.max(0, 100 - insights.weeklyGoalProgress);

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        {/* Header with risk level */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            Tendances
          </h3>
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full",
              riskConfig.bgClass,
              riskConfig.borderClass,
              "border"
            )}
          >
            <RiskIcon className={cn("w-3.5 h-3.5", riskConfig.color)} />
            <span className={riskConfig.color}>{riskConfig.label}</span>
          </motion.div>
        </div>

        {/* Weekly goal progress - Premium styling */}
        {isGoalAchieved ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-secondary/10 border border-secondary/20 text-center"
          >
            <p className="text-2xl font-bold text-secondary">{underGoalPercent.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">sous ton objectif</p>
            <p className="text-sm text-secondary mt-1">🌟 Semaine parfaite</p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-[hsl(38,92%,50%)]/10 border border-[hsl(38,92%,50%)]/20 text-center"
          >
            <p className="text-sm text-[hsl(38,92%,50%)]">
              Objectif atteint cette semaine ✨
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {insights.totalWeeklyUnits.toFixed(1)} / {insights.weeklyGoalProgress > 0 ? Math.round(insights.totalWeeklyUnits / (insights.weeklyGoalProgress / 100)) : 14} unités
            </p>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-white/5">
            <p className="text-xs text-muted-foreground">Cette semaine</p>
            <p className="text-xl font-bold">{insights.totalWeeklyUnits.toFixed(1)}</p>
            <p className="text-[10px] text-muted-foreground">unités</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5">
            <p className="text-xs text-muted-foreground">Moyenne / jour</p>
            <p className="text-xl font-bold">{insights.averagePerDay.toFixed(1)}</p>
            <p className="text-[10px] text-muted-foreground">unités</p>
          </div>
        </div>

        {/* Daily Trend Chart - Premium bars */}
        <div>
          <p className="text-xs text-muted-foreground mb-3">7 derniers jours</p>
          
          <div className="relative h-24 bg-white/5 rounded-xl p-3">
            {/* Grid lines */}
            <div className="absolute inset-3 flex flex-col justify-between pointer-events-none">
              <div className="h-px bg-white/10" />
              <div className="h-px bg-white/10" />
              <div className="h-px bg-white/10" />
            </div>
            
            {/* Bars */}
            <div className="relative h-full flex items-end justify-between gap-1">
              {insights.dailyTrend.map((day, i) => {
                const barHeight = maxUnits > 0 ? Math.max((day.units / maxUnits) * 100, day.units > 0 ? 8 : 3) : 3;
                const isTodayBar = i === 6;
                const hasUnits = day.units > 0;
                
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1 z-10">
                    {hasUnits && (
                      <span className={cn(
                        "text-[10px] font-medium transition-all",
                        day.units <= 2 && "text-secondary",
                        day.units > 2 && day.units <= 4 && "text-[hsl(38,92%,50%)]",
                        day.units > 4 && "text-accent"
                      )}>
                        {day.units.toFixed(1)}
                      </span>
                    )}
                    
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${barHeight}%` }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                      className={cn(
                        "w-full rounded-t-md transition-all",
                        !hasUnits && "bg-white/10",
                        hasUnits && day.units <= 2 && "bg-secondary",
                        hasUnits && day.units > 2 && day.units <= 4 && "bg-[hsl(38,92%,50%)]",
                        hasUnits && day.units > 4 && "bg-accent",
                        isTodayBar && "ring-2 ring-secondary/50"
                      )}
                    />
                    
                    <span className={cn(
                      "text-[10px]",
                      isTodayBar ? "text-secondary font-medium" : "text-muted-foreground"
                    )}>
                      {format(new Date(day.date), 'EEE', { locale: fr }).charAt(0)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-secondary" /> 0-2
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-[hsl(38,92%,50%)]" /> 2-4
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-accent" /> 4+
            </span>
          </div>
        </div>

        {/* Positive Patterns */}
        {insights.patterns.length > 0 && (
          <div className="space-y-1.5">
            {insights.patterns.map((pattern, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: i * 0.1 }} 
                className="text-sm p-3 rounded-lg bg-secondary/10 text-secondary flex items-center gap-2"
              >
                <span>{pattern}</span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Recommendations - Positive framing */}
        {insights.recommendations.length > 0 && (
          <div className="space-y-1.5">
            {insights.recommendations.map((rec, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: i * 0.1 }} 
                className="text-sm p-3 rounded-lg bg-white/5"
              >
                {rec}
              </motion.div>
            ))}
          </div>
        )}

        {/* Streak celebration */}
        {insights.streak > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between"
          >
            <span className="text-sm text-muted-foreground">Série sans alcool</span>
            <span className="text-lg font-bold text-secondary flex items-center gap-1.5">
              <Flame className="w-5 h-5 text-orange-500" />
              {insights.streak} jour{insights.streak > 1 ? 's' : ''}
            </span>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}