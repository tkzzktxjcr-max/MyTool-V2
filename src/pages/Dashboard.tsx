"use client";

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/features/auth/context';
import { useAlcohol } from '@/features/alcohol/hooks';
import { useBudget } from '@/features/budget/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Plus, ArrowRight, Wine, BarChart3, Wallet, Activity, PartyPopper } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { HEALTH_GUIDELINES } from '@/features/alcohol/types';

import BACOverview from '@/components/wellbeing/BACOverview';
import WeeklyGoalProgress from '@/components/wellbeing/WeeklyGoalProgress';
import QuickStats from '@/components/wellbeing/QuickStats';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { insights, loadData, getWeeklyUnits, bacState } = useAlcohol();
  const { budgetUsed, loadEntries } = useBudget();

  useEffect(() => {
    loadData();
    loadEntries();
  }, [loadData, loadEntries]);

  const weeklyUnits = getWeeklyUnits();
  const weeklyLimit = HEALTH_GUIDELINES.maxWeeklyUnits;
  const currentStreak = insights?.streak || 0;
  const firstName = user?.name?.split(' ')[0] || 'Bienvenue';
  const legalLimit = 0.5;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl md:rounded-3xl glass-card-strong p-4 md:p-8"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-xs md:text-sm mb-1">
                {format(new Date(), 'EEEE d MMMM', { locale: fr })}
              </p>
              <h1 className="text-2xl md:text-4xl font-bold mb-2">
                {getGreeting()}, {firstName} <span className="animate-wave">👋</span>
              </h1>
              <p className="text-muted-foreground text-sm">
                Prêt pour une journée de conscience ?
              </p>
            </div>
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 blur-3xl absolute -right-10 -top-10"
            />
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Button 
          onClick={() => navigate('/wellbeing')}
          className="w-full h-14 rounded-2xl text-base font-medium bg-secondary hover:bg-secondary/90"
        >
          <Plus className="w-5 h-5 mr-2" />
          J'ai bu un verre
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <BACOverview
          currentBAC={bacState.currentBAC}
          isAboveLimit={bacState.isAboveLimit}
          isNearLimit={bacState.isNearLimit}
          legalLimit={legalLimit}
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <WeeklyGoalProgress 
          currentUnits={weeklyUnits}
          goalUnits={weeklyLimit}
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <QuickStats 
          streak={currentStreak}
          budgetUsed={budgetUsed}
          weeklyUnits={weeklyUnits}
          weeklyLimit={weeklyLimit}
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-secondary" />
              Quoi de neuf ?
            </h3>
            {currentStreak >= 3 ? (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/10 border border-secondary/20">
                <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
                  <PartyPopper className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="font-medium text-sm text-secondary">
                    {currentStreak} jours sobre consecutive !
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Continue comme ça, c'est excellent pour ta récupération.
                  </p>
                </div>
              </div>
            ) : weeklyUnits === 0 ? (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/10 border border-secondary/20">
                <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="font-medium text-sm text-secondary">
                    Semaine parfaite
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Zéro alcool cette semaine. Profite de ta clarté d'esprit !
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Reste conscient</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {weeklyUnits <= weeklyLimit 
                      ? "Tu es dans les limites de ton objectif. Continue !"
                      : "Tu as dépassé ton objectif cette semaine. C'est l'occasion de reflechir."}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <div className="grid grid-cols-2 gap-3">
          <Card hover className="cursor-pointer transition-all hover:scale-[1.02]" onClick={() => navigate('/wellbeing')}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                <Wine className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Bien-être</p>
                <p className="text-xs text-muted-foreground">Tracker & BAC</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card hover className="cursor-pointer transition-all hover:scale-[1.02]" onClick={() => navigate('/insights')}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Insights</p>
                <p className="text-xs text-muted-foreground">Patterns & tendances</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card hover className="cursor-pointer transition-all hover:scale-[1.02]" onClick={() => navigate('/budget')}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Budget</p>
                <p className="text-xs text-muted-foreground">Depenses & finances</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card hover className="cursor-pointer transition-all hover:scale-[1.02]" onClick={() => navigate('/settings')}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Parametres</p>
                <p className="text-xs text-muted-foreground">Profil & objectif</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}