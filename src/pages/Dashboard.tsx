"use client";

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/features/auth/context';
import { useAlcohol } from '@/features/alcohol/hooks';
import { useBudget } from '@/features/budget/hooks';
import { Button } from '@/components/ui/button';
import { Plus, Wine, BarChart3, Wallet, Settings, Flame, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { HEALTH_GUIDELINES } from '@/features/alcohol/types';
import { cn } from '@/lib/utils';

const AUTO_OPEN_KEY = 'wellbeing_auto_open';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { insights, getWeeklyUnits, isLoading: alcoholLoading } = useAlcohol();
  const { budgetUsed, isLoading: budgetLoading } = useBudget();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const weeklyUnits = getWeeklyUnits();
  const weeklyLimit = HEALTH_GUIDELINES.maxWeeklyUnits;
  const currentStreak = insights?.streak || 0;
  const firstName = user?.name?.split(' ')[0] || 'Bienvenue';

  const handleAddDrink = () => {
    sessionStorage.setItem(AUTO_OPEN_KEY, 'true');
    navigate('/wellbeing');
  };

  if (!mounted || alcoholLoading || budgetLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-10 w-10 rounded-xl border-4 border-primary border-t-transparent"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-5 max-w-2xl mx-auto pb-8"
    >
      {/* Hero */}
      <div className="rounded-2xl glass-card p-5 md:p-7">
        <p className="text-muted-foreground text-sm mb-1">
          {format(new Date(), 'EEEE d MMMM', { locale: fr })}
        </p>
        <h1 className="text-2xl md:text-3xl font-bold mb-1">
          {getGreeting()}, {firstName} 👋
        </h1>
        <p className="text-muted-foreground text-sm">
          {currentStreak >= 7 ? '🔥 Série incroyable !' :
           currentStreak >= 3 ? '🌟 Continue comme ça' :
           weeklyUnits === 0 ? '✨ Semaine parfaite' : '👋 Bienvenue'}
        </p>
      </div>

      {/* Main CTA */}
      <Button
        onClick={handleAddDrink}
        className="w-full h-14 rounded-2xl text-base font-medium bg-secondary hover:bg-secondary/90 shadow-lg shadow-secondary/20"
      >
        <Plus className="w-5 h-5 mr-2" />
        J'ai bu un verre
      </Button>

      {/* Compact Summary */}
      <div className="rounded-2xl glass-card p-4">
        <div className="grid grid-cols-3 divide-x divide-white/10">
          <div className="flex flex-col items-center px-3 py-1">
            <div className="flex items-center gap-1.5 text-orange-500">
              <Flame className="w-4 h-4" />
              <span className="text-xl font-bold">{currentStreak}</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">jours sobre</p>
          </div>
          <div className="flex flex-col items-center px-3 py-1">
            <div className={cn("flex items-center gap-1.5", budgetUsed > 80 ? "text-accent" : "text-secondary")}>
              <Wallet className="w-4 h-4" />
              <span className="text-xl font-bold">{Math.round(budgetUsed)}%</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">budget utilisé</p>
          </div>
          <div className="flex flex-col items-center px-3 py-1">
            <div className={cn("flex items-center gap-1.5", weeklyUnits > weeklyLimit ? "text-accent" : "text-primary")}>
              <TrendingUp className="w-4 h-4" />
              <span className="text-xl font-bold">{weeklyUnits.toFixed(1)}</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">unités/sem</p>
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/wellbeing')}
          className="rounded-2xl glass-card p-4 flex items-center gap-3 text-left transition-colors hover:bg-white/[0.08]"
        >
          <div className="w-11 h-11 rounded-xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
            <Wine className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <p className="font-semibold text-sm">Bien-être</p>
            <p className="text-xs text-muted-foreground">Tracker & BAC</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/insights')}
          className="rounded-2xl glass-card p-4 flex items-center gap-3 text-left transition-colors hover:bg-white/[0.08]"
        >
          <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">Insights</p>
            <p className="text-xs text-muted-foreground">Patterns & tendances</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/budget')}
          className="rounded-2xl glass-card p-4 flex items-center gap-3 text-left transition-colors hover:bg-white/[0.08]"
        >
          <div className="w-11 h-11 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
            <Wallet className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="font-semibold text-sm">Budget</p>
            <p className="text-xs text-muted-foreground">Dépenses & finances</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/settings')}
          className="rounded-2xl glass-card p-4 flex items-center gap-3 text-left transition-colors hover:bg-white/[0.08]"
        >
          <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-sm">Paramètres</p>
            <p className="text-xs text-muted-foreground">Profil & objectif</p>
          </div>
        </button>
      </div>
    </motion.div>
  );
}