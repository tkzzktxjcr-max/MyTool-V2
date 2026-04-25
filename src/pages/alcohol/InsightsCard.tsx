"use client";

import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, AlertTriangle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { AlcoholInsight } from '@/features/alcohol/types';

interface InsightsCardProps { insights: AlcoholInsight | null; }

export default function InsightsCard({ insights }: InsightsCardProps) {
  console.log('[InsightsCard] Rendering with insights:', insights);

  if (!insights) {
    console.log('[InsightsCard] insights is null, showing fallback');
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-medium text-sm">Tendances</h3>
          </div>
          <div className="text-center py-6 text-muted-foreground text-sm">
            Pas encore assez de donnees
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log('[InsightsCard] Rendering with valid insights:', {
    weeklyUnits: insights.totalWeeklyUnits,
    recommendations: insights.recommendations,
    patterns: insights.patterns
  });

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Tendances
          </h3>
          <span className={cn(
            "text-sm font-medium px-2 py-1 rounded-full",
            insights.riskLevel === 'low' && "bg-secondary/20 text-secondary",
            insights.riskLevel === 'moderate' && "bg-accent/20 text-accent",
            insights.riskLevel === 'high' && "bg-destructive/20 text-destructive"
          )}>
            {insights.riskLevel === 'low' && '✨ Faible'}
            {insights.riskLevel === 'moderate' && '⚠️ Modere'}
            {insights.riskLevel === 'high' && '⚠️ Eleve'}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-xl bg-white/5">
            <p className="text-xs text-muted-foreground">Cette semaine</p>
            <p className="text-lg font-bold">{insights.totalWeeklyUnits.toFixed(1)} unites</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5">
            <p className="text-xs text-muted-foreground">Moyenne/jour</p>
            <p className="text-lg font-bold">{insights.averagePerDay.toFixed(1)}</p>
          </div>
        </div>

        {/* Daily Trend Chart (simple bars) */}
        {insights.dailyTrend.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">7 derniers jours</p>
            <div className="flex items-end justify-between h-16 gap-1">
              {insights.dailyTrend.map((day, i) => {
                const maxUnits = Math.max(...insights.dailyTrend.map(d => d.units), 1);
                const height = (day.units / maxUnits) * 100;
                const isTodayBar = i === 6;
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                    <div 
                      className={cn(
                        "w-full rounded-t-sm transition-all",
                        day.units <= 2 ? "bg-secondary" : day.units <= 4 ? "bg-accent" : "bg-destructive"
                      )}
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                    <span className={cn("text-[10px]", isTodayBar && "text-secondary font-medium")}>
                      {format(new Date(day.date), 'EEE', { locale: fr }).charAt(0)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Patterns/Recommendations */}
        {insights.patterns.length > 0 && (
          <div className="space-y-1.5">
            {insights.patterns.map((pattern, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: i * 0.1 }} 
                className="text-xs p-2 rounded-lg bg-white/5"
              >
                {pattern}
              </motion.div>
            ))}
          </div>
        )}

        {/* Recommendations */}
        {insights.recommendations.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {insights.recommendations.map((rec, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: i * 0.1 }} 
                className="text-xs p-2 rounded-lg bg-secondary/10 text-secondary"
              >
                {rec}
              </motion.div>
            ))}
          </div>
        )}

        {/* Streak */}
        {insights.streak > 0 && (
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Serie sans alcool</span>
            <span className="text-sm font-bold text-secondary flex items-center gap-1">
              🔥 {insights.streak} jour{insights.streak > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}