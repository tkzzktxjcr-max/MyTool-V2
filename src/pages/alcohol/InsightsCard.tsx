"use client";

import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { AlcoholInsight } from '@/features/alcohol/types';

interface InsightsCardProps { insights: AlcoholInsight | null; }

export default function InsightsCard({ insights }: InsightsCardProps) {
  if (!insights) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4" />Tendances</h3>
          <span className={cn("text-sm font-medium", insights.riskLevel === 'low' && "text-secondary", insights.riskLevel === 'moderate' && "text-accent", insights.riskLevel === 'high' && "text-destructive")}>
            {insights.riskLevel === 'low' && '✨ Faible'}{insights.riskLevel === 'moderate' && '⚠️ Modéré'}{insights.riskLevel === 'high' && '⚠️ Élevé'}
          </span>
        </div>
        <div className="flex items-end justify-between h-16 gap-1 mb-3">
          {insights.dailyTrend.map((day, i) => {
            const maxUnits = Math.max(...insights.dailyTrend.map(d => d.units), 1);
            const height = (day.units / maxUnits) * 100;
            const isTodayBar = i === 6;
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-sm" style={{ height: `${Math.max(height, 4)}%`, backgroundColor: day.units <= 2 ? 'hsl(142, 71%, 45%)' : day.units <= 4 ? 'hsl(263, 70%, 58%)' : 'hsl(0, 62%, 50%)' }} />
                <span className={cn("text-[10px]", isTodayBar && "text-secondary font-medium")}>{format(new Date(day.date), 'EEE', { locale: fr }).charAt(0)}</span>
              </div>
            );
          })}
        </div>
        {insights.patterns.length > 0 && (
          <div className="space-y-1.5">
            {insights.patterns.map((pattern, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="text-xs text-muted-foreground">{pattern}</motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}