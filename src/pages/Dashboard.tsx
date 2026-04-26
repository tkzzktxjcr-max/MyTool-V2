"use client";

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/features/auth/context';
import { useAlcohol } from '@/features/alcohol/hooks';
import { useBudget } from '@/features/budget/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Plus, ArrowRight, Wine, BarChart3, Wallet, Activity, PartyPopper, Flame, TrendingUp, CheckCircle2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { HEALTH_GUIDELINES } from '@/features/alcohol/types';
import { cn } from '@/lib/utils';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon apres-midi';
  return 'Bonsoir';
};

const getMoodEmoji = (streak: number, weeklyUnits: number, weeklyLimit: number) => {
  if (streak >= 7) return { emoji: '🔥', message: 'Serie incroyable !' };
  if (weeklyUnits === 0) return { emoji: '✨', message: 'Semaine parfaite' };
  if (weeklyUnits <= weeklyLimit * 0.7) return { emoji: '🌟', message: 'Excellente semaine' };
  if (weeklyUnits > weeklyLimit) return { emoji: '💭', message: 'Moment de reflexion' };
  return { emoji: '👋', message: 'Continue comme ca' };
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { insights, loadData, getWeeklyUnits, bacState } = useAlcohol();
  const { budgetUsed, loadEntries } = useBudget();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadData();
    loadEntries();
    setMounted(true);
  }, [loadData, loadEntries]);

  const weeklyUnits = getWeeklyUnits();
  const weeklyLimit = HEALTH_GUIDELINES.maxWeeklyUnits;
  const currentStreak = insights?.streak || 0;
  const firstName = user?.name?.split(' ')[0] || 'Bienvenue';
  const legalLimit = 0.5;

  const getBACStatus = () => {
    if (bacState.currentBAC === 0) {
      return {
        label: 'Sobre maintenant',
        color: 'text-secondary',
        bgClass: 'bg-secondary/10 border-secondary/20',
        icon: CheckCircle2,
        sublabel: 'Pret pour la route',
      };
    }
    if (bacState.isAboveLimit) {
      return {
        label: 'Au-dessus de la limite',
        color: 'text-destructive',
        bgClass: 'bg-destructive/10 border-destructive/20',
        icon: AlertTriangle,
        sublabel: 'Conduite interdite',
      };
    }
    if (bacState.isNearLimit) {
      return {
        label: 'Proche de la limite',
        color: 'text-[hsl(38,92%,50%)]',
        bgClass: 'bg-[hsl(38,92%,50%)]/10 border-[hsl(38,92%,50%)]/20',
        icon: AlertTriangle,
        sublabel: 'Conduite non recommandee',
      };
    }
    return {
      label: 'Dans les limites',
      color: 'text-secondary',
      bgClass: 'bg-secondary/10 border-secondary/20',
      icon: CheckCircle2,
      sublabel: 'Conduite autorisee',
    };
  };

  const bacStatus = getBACStatus();
  const StatusIcon = bacStatus.icon;
  const mood = getMoodEmoji(currentStreak, weeklyUnits, weeklyLimit);
  const progress = weeklyLimit > 0 ? Math.min((weeklyUnits / weeklyLimit) * 100, 100) : 0;

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="h-12 w-12 rounded-xl bg-gradient-to-br from-secondary to-accent"
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto pb-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl md:rounded-3xl glass-card-strong p-5 md:p-7"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="relative">
          <p className="text-muted-foreground text-sm mb-1">
            {format(new Date(), 'EEEE d MMMM', { locale: fr })}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">
            {getGreeting()}, {firstName} <span className="animate-wave inline-block">👋</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            {mood.emoji} {mood.message}
          </p>
        </div>
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 blur-3xl"
        />
      </motion.div>

      {/* Quick Add Button */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Button
          onClick={() => navigate('/wellbeing')}
          className="w-full h-14 rounded-2xl text-base font-medium bg-secondary hover:bg-secondary/90 shadow-lg shadow-secondary/20"
        >
          <Plus className="w-5 h-5 mr-2" />
          J'ai bu un verre
        </Button>
      </motion.div>

      {/* BAC Status Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className={cn("transition-all duration-500", bacStatus.bgClass)}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-muted-foreground" />
                <span className="font-semibold">Taux d'alcool</span>
              </div>
              <StatusIcon className={cn("w-5 h-5", bacStatus.color)} />
            </div>

            <div className="text-center mb-4">
              <motion.div
                key={bacState.currentBAC.toFixed(2)}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cn("text-5xl md:text-6xl font-bold", bacStatus.color)}
              >
                {bacState.currentBAC.toFixed(2)}
              </motion.div>
              <p className="text-lg text-muted-foreground">g/L</p>
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={cn("inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full text-sm font-medium", bacStatus.bgClass)}
              >
                <StatusIcon className={cn("w-4 h-4", bacStatus.color)} />
                <span className={bacStatus.color}>{bacStatus.sublabel}</span>
              </motion.div>
            </div>

            {/* Driving status */}
            {bacState.currentBAC > 0 && (
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((bacState.currentBAC / legalLimit) * 100, 100)}%` }}
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    bacState.currentBAC <= legalLimit * 0.8 && "bg-secondary",
                    bacState.currentBAC > legalLimit * 0.8 && bacState.currentBAC <= legalLimit && "bg-[hsl(38,92%,50%)]",
                    bacState.currentBAC > legalLimit && "bg-destructive"
                  )}
                />
              </div>
            )}

            {bacState.currentBAC === 0 && (
              <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-secondary/10">
                <CheckCircle2 className="w-5 h-5 text-secondary" />
                <span className="text-sm text-secondary font-medium">Z\u00e9ro alkohol dans le sang</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Goal Progress */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className={cn(!weeklyUnits || weeklyUnits <= weeklyLimit ? "border-secondary/20" : "border-accent/20")}>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className={cn("w-5 h-5", weeklyUnits <= weeklyLimit ? "text-secondary" : "text-accent")} />
                <span className="font-semibold">Objectif hebdomadaire</span>
              </div>
              <span className={cn("text-sm font-medium", weeklyUnits <= weeklyLimit ? "text-secondary" : "text-accent")}>
                {weeklyUnits.toFixed(1)} / {weeklyLimit} unites
              </span>
            </div>

            <div className="h-4 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full transition-all",
                  progress <= 70 && "bg-secondary",
                  progress > 70 && progress <= 100 && "bg-[hsl(38,92%,50%)]",
                  progress > 100 && "bg-accent"
                )}
              />
            </div>

            <div className="flex justify-between items-center">
              <span className={cn(
                "text-sm font-medium",
                weeklyUnits === 0 ? "text-secondary" :
                weeklyUnits <= weeklyLimit * 0.8 ? "text-secondary" :
                weeklyUnits <= weeklyLimit ? "text-[hsl(38,92%,50%)]" : "text-accent"
              )}>
                {weeklyUnits === 0 ? 'Semaine parfaite' :
                 progress <= 70 ? 'Excellente semaine' :
                 progress <= 100 ? 'Dans les clous' : 'Au-dela'}
              </span>
              <span className="text-2xl font-bold text-secondary">
                {Math.round(progress)}%
              </span>
            </div>

            {progress <= 80 && weeklyUnits > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-secondary/10"
              >
                <CheckCircle2 className="w-5 h-5 text-secondary" />
                <span className="text-sm text-secondary font-medium">Sous ton objectif</span>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats Grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-0 bg-gradient-to-br from-orange-500/10 to-orange-600/5">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
                <Flame className="w-5 h-5" />
                <span className="text-2xl font-bold">{currentStreak}</span>
              </div>
              <p className="text-xs text-muted-foreground">Jours sobre</p>
            </CardContent>
          </Card>

          <Card className={cn("border-0", budgetUsed > 80 ? "bg-gradient-to-br from-accent/10 to-accent/5" : "bg-gradient-to-br from-secondary/10 to-secondary/5")}>
            <CardContent className="p-4 text-center">
              <div className={cn("flex items-center justify-center gap-1 mb-1", budgetUsed > 80 ? "text-accent" : "text-secondary")}>
                <Wallet className="w-5 h-5" />
                <span className="text-2xl font-bold">{Math.round(budgetUsed)}%</span>
              </div>
              <p className="text-xs text-muted-foreground">Budget utilise</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1 text-primary mb-1">
                <TrendingUp className="w-5 h-5" />
                <span className="text-2xl font-bold">{weeklyUnits.toFixed(1)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Unites/semaine</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-muted/10 to-muted/5">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Sparkles className="w-5 h-5" />
                <span className="text-2xl font-bold">{weeklyLimit}</span>
              </div>
              <p className="text-xs text-muted-foreground">Objectif/semaine</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Mood Message */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-secondary" />
              Quoi de neuf ?
            </h3>

            {currentStreak >= 3 ? (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/10 border border-secondary/20">
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
                  <PartyPopper className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="font-semibold text-base text-secondary">
                    {currentStreak} jours sobre consecutifs !
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Continue comme ca, c'est excellent pour ta recuperation.
                  </p>
                </div>
              </div>
            ) : weeklyUnits === 0 ? (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/10 border border-secondary/20">
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="font-semibold text-base text-secondary">
                    Semaine parfaite
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Zero alkohol cette semaine. Profite de ta clarte d'esprit !
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-base">Reste conscient</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {weeklyUnits <= weeklyLimit
                      ? "Tu es dans les limites de ton objectif. Continue !"
                      : "Tu as depasse ton objectif cette semaine. C'est l'occasion de reflechir."}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Navigation Cards */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="grid grid-cols-2 gap-3">
          <Card hover className="cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-secondary/10" onClick={() => navigate('/wellbeing')}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                <Wine className="w-6 h-6 text-secondary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-base">Bien-etre</p>
                <p className="text-xs text-muted-foreground">Tracker & BAC</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card hover className="cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10" onClick={() => navigate('/insights')}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-base">Insights</p>
                <p className="text-xs text-muted-foreground">Patterns & tendances</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card hover className="cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-accent/10" onClick={() => navigate('/budget')}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-base">Budget</p>
                <p className="text-xs text-muted-foreground">Depenses & finances</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card hover className="cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-muted/10" onClick={() => navigate('/settings')}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-base">Parametres</p>
                <p className="text-xs text-muted-foreground">Profil & objectif</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Footer message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center py-6"
      >
        <p className="text-xs text-muted-foreground">
          WellHub - Accompagne ta conscience
        </p>
      </motion.div>
    </div>
  );
}