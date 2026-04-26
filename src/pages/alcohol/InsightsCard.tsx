"use client";

import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, Trophy, Target, Flame, Sparkles, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { AlcoholInsight } from '@/features/alcohol/types';

interface InsightsCardProps { insights: AlcoholInsight | null; }

// Empty state for when no data exists
function EmptyState() {
  return (
    <Card className="border-0 bg-gradient-to-br from-secondary/5 to-accent/5">
      <CardContent className="p-5 text-center py-8">
        <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-8 h-8 text-secondary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Cultive ta conscience</h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Chaque verre ajouté t'aide à mieux comprendre tes habitudes.
        </p>
      </CardContent>
    </Card>
  );
}

export default function InsightsCard({ insights }: InsightsCardProps) {
  // Empty state
  if (!insights || insights.totalWeeklyUnits === 0) {
    return <EmptyState />;
  }

  const maxUnits = Math.max(...insights.dailyTrend.map(d => d.units), 2);
  
  // Calculate stats
  const soberDays = insights.dailyTrend.filter(d => d.units === 0).length;
  const totalDays = 7;
  const remainingUnits = Math.max(0, insights.weeklyGoalProgress > 0 
    ? (100 - insights.weeklyGoalProgress) / 100 * 14 
    : 14 - insights.totalWeeklyUnits);
  const progressPercent = insights.weeklyGoalProgress;

  // Get day name
  const getDayName = (dayIndex: number): string => {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    return days[dayIndex];
  };

  return (
    <Card>
      <CardContent className="p-4 md:p-5 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-secondary" />
          <h3 className="font-semibold text-base">Ma semaine</h3>
        </div>

        {/* Achievement Message - Positive feedback first */}
        {soberDays >= 4 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-2xl bg-secondary/15 border border-secondary/25 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <Trophy className="w-5 h-5 text-secondary" />
              <span className="text-lg font-bold text-secondary">
                Semaine sobre {soberDays}j sur {totalDays}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {soberDays === 7 ? 'Parfait ! 7 jours sans alcool' : 'Excellent travail !'}
            </p>
          </motion.div>
        ) : insights.streak > 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-2xl bg-secondary/10 border border-secondary/20 text-center"
          >
            <div className="flex items-center justify-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-base font-bold text-secondary">
                {insights.streak} jour{insights.streak > 1 ? 's' : ''} sobre
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Continue comme ça !
            </p>
          </motion.div>
        ) : null}

        {/* Weekly Progress Bar - Simplified */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Ma conso cette semaine</span>
            <span className="text-sm font-medium">
              <span className={cn(
                "font-bold",
                progressPercent <= 80 && "text-secondary",
                progressPercent > 80 && progressPercent <= 100 && "text-[hsl(38,92%,50%)]",
                progressPercent > 100 && "text-accent"
              )}>
                {insights.totalWeeklyUnits.toFixed(1)}
              </span>
              <span className="text-muted-foreground"> / 14 u</span>
            </span>
          </div>
          
         <think>I need to continue from where I left off. The last file I was updating was InsightsCard.tsx and I need to finish it. Let me continue with the rest of the code for that file.
</think>

<dyad-write path="src/pages/alcohol/InsightsCard.tsx" description="Finishing InsightsCard update">
          {/* Progress bar */}
          <div className="h-4 rounded-full bg-white/10 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progressPercent, 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={cn(
                "h-full rounded-full",
                progressPercent <= 80 && "bg-secondary",
                progressPercent > 80 && progressPercent <= 100 && "bg-[hsl(38,92%,50%)]",
                progressPercent > 100 && "bg-accent"
              )}
            />
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              {remainingUnits > 0 ? (
                <>{remainingUnits.toFixed(1)} restants</>
              ) : (
                <span className="text-[hsl(38,92%,50%)]">Objectif atteint</span>
              )}
            </span>
            <span className={cn(
              "text-xs font-medium",
              progressPercent <= 80 && "text-secondary",
              progressPercent > 80 && progressPercent <= 100 && "text-[hsl(38,92%,50%)]",
              progressPercent > 100 && "text-accent"
            )}>
              {Math.round(progressPercent)}%
            </span>
          </div>
        </div>

        {/* Daily Chart - 7 last days */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">7 derniers jours</span>
          </div>

          {/* Chart grid */}
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {insights.dailyTrend.map((day, index) => {
              const isToday = index === 6;
              const hasUnits = day.units > 0;
              const barHeight = maxUnits > 0 
                ? Math.max(8, Math.min(80, (day.units / maxUnits) * 80))
                : 8;
              
              const getBarColor = () => {
                if (!hasUnits) return 'bg-white/10';
                if (day.units <= 2) return 'bg-secondary';
                if (day.units <= 4) return 'bg-[hsl(38,92%,50%)]';
                return 'bg-accent';
              };

              return (
                <div key={day.date} className="flex flex-col items-center gap-1">
                  {hasUnits && (
                    <span className={cn(
                      "text-[10px] md:text-xs font-medium",
                      day.units <= 2 && "text-secondary",
                      day.units > 2 && day.units <= 4 && "text-[hsl(38,92%,50%)]",
                      day.units > 4 && "text-accent"
                    )}>
                      {day.units.toFixed(1)}
                    </span>
                  )}
                  {!hasUnits && <span className="h-4" />}

                  <div className="w-full flex items-end justify-center h-20 md:h-24">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: barHeight }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className={cn(
                        "w-6 md:w-8 rounded-md transition-all",
                        getBarColor(),
                        isToday && "ring-2 ring-secondary ring-offset-1 ring-offset-background"
                      )}
                    />
                  </div>

                  <span className={cn(
                    "text-[10px] md:text-xs",
                    isToday ? "text-secondary font-medium" : "text-muted-foreground"
                  )}>
                    {getDayName(index)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Simple Legend with colored dots */}
        <div className="flex items-center justify-center gap-4 pt-2 border-t border-white/5">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            0-2u
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-[hsl(38,92%,50%)]" />
            2-4u
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-accent" />
            4+u
          </span>
        </div>

        {/* Quick Stats - 2 column grid */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
          <div className="text-center p-3 rounded-xl bg-white/5">
            <p className="text-2xl font-bold">{insights.averagePerDay.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">moyenne/jour</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/5">
            <p className="text-2xl font-bold">{insights.totalMonthlyUnits.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">unités/mois</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}