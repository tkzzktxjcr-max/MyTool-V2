"use client";

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, Wallet, TrendingDown, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickStatsProps {
  streak: number;
  budgetUsed: number;
  weeklyUnits: number;
  weeklyLimit: number;
}

export default function QuickStats({ streak, budgetUsed, weeklyUnits, weeklyLimit }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-0 bg-gradient-to-br from-orange-500/10 to-orange-600/5">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
              <Flame className="w-5 h-5" />
              <span className="text-2xl font-bold">{streak}</span>
            </div>
            <p className="text-xs text-muted-foreground">Jours sobre</p>
          </CardContent>
        </Card>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className={cn("border-0", budgetUsed > 80 ? "bg-gradient-to-br from-accent/10 to-accent/5" : "bg-gradient-to-br from-secondary/10 to-secondary/5")}>
          <CardContent className="p-4 text-center">
            <div className={cn("flex items-center justify-center gap-1 mb-1", budgetUsed > 80 ? "text-accent" : "text-secondary")}>
              <Wallet className="w-5 h-5" />
              <span className="text-2xl font-bold">{Math.round(budgetUsed)}%</span>
            </div>
            <p className="text-xs text-muted-foreground">Budget utilise</p>
          </CardContent>
        </Card>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="border-0 bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-primary mb-1">
              <TrendingDown className="w-5 h-5" />
              <span className="text-2xl font-bold">{weeklyUnits.toFixed(1)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Unites/semaine</p>
          </CardContent>
        </Card>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="border-0 bg-gradient-to-br from-muted/10 to-muted/5">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Trophy className="w-5 h-5" />
              <span className="text-2xl font-bold">{weeklyLimit}</span>
            </div>
            <p className="text-xs text-muted-foreground">Objectif/semaine</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}