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
  // Empty state
  if (!insights || insights.totalWeeklyUnits === 0) {
    return (
      <Card className="border-0 bg-gradient-to-br from-secondary/5 to-accent/5">
        <CardContent className="p-5 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-4">
            <div className="text-6xl mb-2">🌱</div>
          </motion.div>
          <h3 className="text-lg font-semibold mb-2">Cultive ta conscience</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Chaque verre ajouté t'aide à mieux comprendre tes habitudes.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-secondary">
            <Sparkles className="w-4 h-4" />
            <span>Ajoute ta première consommation</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Risk level config
  const getRiskConfig = () => {
    switch (insights.riskLevel) {
      case 'low':
        return { label: '✨ Léger', color: 'text-secondary', icon: ThumbsUp };
      case 'moderate':
        return { label: '🌿 Modéré', color: 'text-[hsl(38,92%,50%)]', icon: Target };
      case 'high':
        return { label: '🌱 En évolution', color: 'text-accent', icon: TrendingUp };
    }
  };

  const riskConfig = getRiskConfig();
  const RiskIcon = riskConfig.icon;
  const maxUnits = Math.max(...insights.dailyTrend.map(d => d.units), 2);
  const isGoalAchieved = insights.weeklyGoalProgress >= 100;

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            Tendances
          </h3>
          <div className={cn(
            "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-secondary/20 border border-secondary/30"
          )}>
            <RiskIcon className={cn("w-3.5 h-3.5", riskConfig.color)} />
            <span className={riskConfig.color}>{riskConfig.label}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-white/5 text-center">
            <p className="text-2xl font-bold">{insights.totalWeeklyUnits.toFixed(1)}</p>
            <p className="text-[10px] text-muted-foreground">unités / semaine</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 text-center">
            <p className="text-2xl font-bold">{insights.averagePerDay.toFixed(1)}</p>
            <p className="text-[10px] text-muted-foreground">moyenne / jour</p>
          </div>
        </div>

        {/* Weekly Goal */}
        <div className={cn(
          "p-3 rounded-xl text-center",
          isGoalAchieved ? "bg-secondary/10 border border-secondary/20" : "bg-[hsl(38,92%,50%)]/10 border border-[hsl(38,92%,50%)]/20"
        )}>
          {isGoalAchieved ? (
            <p className="text-sm text-secondary">🎯 Objectif atteint ✨</p>
          ) : (
            <p className="text-sm text-[hsl(38,92%,50%)]">
              {(100 - insights.weeklyGoalProgress).toFixed(0)}% sous l'objectif
            </p>
          )}
        </div>

        {/* Bar Chart */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">7 derniers jours</p>
          <div className="flex items-end justify-between gap-1 h-24 bg-white/5 rounded-xl p-3">
            {insights.dailyTrend.map((day, i) => {
              const isToday = i === 6;
              const hasUnits = day.units > 0;
              const height = maxUnits > 0 ? Math.max((day.units / maxUnits) * 100, 20) : 20;
              
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  {hasUnits && (
                    <span className={cn(
                      "text-[10px] font-medium",
                      day.units <= 2 && "text-secondary",
                      day.units > 2 && day.units <= 4 && "text-[hsl(38,92%,50%)]",
                      day.units > 4 && "text-accent"
                    )}>
                      {day.units.toFixed(1)}
                    </span>
                  )}
                  <div 
                    className={cn(
                      "w-full rounded-t-md min-h-[3px]",
                      !hasUnits && "bg-white/10",
                      hasUnits && day.units <= 2 && "bg-secondary",
                      hasUnits && day.units > 2 && day.units <= 4 && "bg-[hsl(38,92%,50%)]",
                      hasUnits && day.units > 4 && "bg-accent",
                      isToday && "ring-[2px] ring-secondary"
                    )}
                    style={{ height: `${height}%` }}
                  />
                  <span className={cn(
                    "text-[10px]",
                    isToday ? "text-secondary font-medium" : "text-muted-foreground"
                  )}>
                    {format(new Date(day.date), 'EEE', { locale: fr }).charAt(0)}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-secondary" /> 0-2</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[hsl(38,92%,50%)]" /> 2-4</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-accent" /> 4+</span>
          </div>
        </div>

        {/* Patterns - Only if relevant */}
        {insights.patterns.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Observations</p>
            <div className="space-y-1">
              {insights.patterns.map((pattern, i) => (
                <div key={i} className="text-sm p-2 rounded-lg bg-secondary/10 text-secondary">
                  {pattern}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Streak */}
        {insights.streak > 0 && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
            <span className="text-sm text-muted-foreground">Série sans alcool</span>
            <span className="flex items-center gap-1.5 text-lg font-bold text-secondary">
              <Flame className="w-5 h-5 text-orange-500" />
              {insights.streak} jour{insights.streak > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}