"use client";

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/features/auth/context';
import { useFamily } from '@/features/family/context';
import { useCalendar } from '@/features/calendar/hooks';
import { useChores } from '@/features/chores/hooks';
import { useBudget } from '@/features/budget/hooks';
import { useAlcohol } from '@/features/alcohol/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, CheckSquare, Plus, ArrowRight, PartyPopper, Users, Activity, Sparkles } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const AnimatedNumber = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
  const [display, setDisplay] = useState(0);
  
  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <span>{display}{suffix}</span>;
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { family } = useFamily();
  const { events, loadEvents } = useCalendar();
  const { loadChores, getTodaysChores } = useChores();
  const { budgetUsed, loadEntries } = useBudget();
  const { insights, loadData, getTodayUnits } = useAlcohol();

  useEffect(() => {
    if (!family?.id) return;
    Promise.all([loadEvents(), loadChores(), loadEntries()]);
    loadData();
  }, [family?.id, loadEvents, loadChores, loadEntries, loadData]);

  if (!family) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto text-center py-8"
      >
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl md:text-4xl font-bold mb-4 mx-auto glow-primary"
        >
          {user?.name?.charAt(0).toUpperCase()}
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-2xl md:text-3xl font-bold mb-2"
        >
          Bienvenue, {user?.name?.split(' ')[0]} 👋
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground mb-6"
        >
          Commencez par créer ou rejoindre une famille
        </motion.p>
        
        <div className="space-y-3">
          <motion.div whileTap={{ scale: 0.98 }}>
            <Card hover onClick={() => navigate('/family?action=create')} className="cursor-pointer">
              <CardContent className="flex items-center gap-3 p-4 md:p-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-sm md:text-base">Créer une famille</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">Commencez votre propre espace</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div whileTap={{ scale: 0.98 }}>
            <Card hover onClick={() => navigate('/family?action=join')} className="cursor-pointer">
              <CardContent className="flex items-center gap-3 p-4 md:p-6">
                <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-sm md:text-base">Rejoindre une famille</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">Utilisez un code d'invitation</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  const todaysChores = getTodaysChores();
  const todaysUnits = getTodayUnits();
  const upcomingEvents = events
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Hero Section */}
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
                {getGreeting()}, {user?.name?.split(' ')[0]} <span className="animate-wave">👋</span>
              </h1>
              <p className="text-muted-foreground text-sm">
                {todaysChores.length + upcomingEvents.length} choses à faire aujourd'hui
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card glow="primary">
          <CardContent className="pt-4 md:pt-6 text-center p-3 md:p-0">
            <div className="text-2xl md:text-4xl font-bold gradient-text mb-1">
              <AnimatedNumber value={todaysChores.length} />
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">Corvées du jour</p>
          </CardContent>
        </Card>

        <Card glow="secondary">
          <CardContent className="pt-4 md:pt-6 text-center p-3 md:p-0">
            <div className={cn("text-2xl md:text-4xl font-bold mb-1", budgetUsed > 80 ? "text-destructive" : "text-secondary")}>
              <AnimatedNumber value={Math.round(budgetUsed)} suffix="%" />
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">Budget utilisé</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 md:pt-6 text-center p-3 md:p-0">
            <div className="text-2xl md:text-4xl font-bold mb-1">
              <AnimatedNumber value={Number(insights?.totalWeeklyUnits.toFixed(1) || 0)} />
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">Alcool (semaine)</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 md:pt-6 text-center p-3 md:p-0">
            <div className="text-2xl md:text-4xl font-bold mb-1">{upcomingEvents.length}</div>
            <p className="text-xs md:text-sm text-muted-foreground">Événements</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
        {/* Today's Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <CheckSquare className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-sm md:text-base">Corvées du jour</h2>
                    <p className="text-xs text-muted-foreground">{todaysChores.length} tâches</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/chores')}>
                  Voir tout
                </Button>
              </div>

              {todaysChores.length === 0 ? (
                <div className="text-center py-6 md:py-8">
                  <PartyPopper className="w-10 h-10 md:w-12 md:h-12 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-muted-foreground text-sm">Aucune corvée prévue !</p>
                </div>
              ) : (
                <div className="space-y-2 md:space-y-3">
                  {todaysChores.slice(0, 3).map((chore) => (
                    <div key={chore.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                      <div className="w-5 h-5 rounded-full border-2 border-white/20 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{chore.title}</p>
                      </div>
                      <Badge variant={chore.status === 'completed' ? 'secondary' : 'outline'} className="text-xs">
                        {chore.frequency}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                    <CalendarIcon className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-sm md:text-base">À venir</h2>
                    <p className="text-xs text-muted-foreground">{upcomingEvents.length} événements</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/calendar')}>
                  Voir tout
                </Button>
              </div>

              <div className="space-y-2 md:space-y-3">
                {upcomingEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                    <div 
                      className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0"
                      style={{ backgroundColor: event.color }}
                    >
                      <span className="text-[8px] md:text-[10px] font-medium">
                        {format(parseISO(event.date), 'EEE', { locale: fr })}
                      </span>
                      <span className="text-sm md:text-lg font-bold">
                        {format(parseISO(event.date), 'd')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(event.date), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Wellbeing Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border border-secondary/20">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                  <Activity className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
                </div>
                <div>
                  <h2 className="font-semibold text-sm md:text-base">Insights Bien-être</h2>
                  <p className="text-xs text-muted-foreground">Suivi personnel</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/alcohol')}>
                Détails
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3 md:gap-4">
              <div className="text-center p-2 md:p-3">
                <div className={cn(
                  "text-xl md:text-2xl font-bold mb-1",
                  todaysUnits <= 2 ? "text-secondary" : todaysUnits <= 4 ? "text-accent" : "text-destructive"
                )}>
                  {todaysUnits.toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground">aujourd'hui</p>
              </div>

              <div className="text-center p-2 md:p-3">
                <div className="text-xl md:text-2xl font-bold mb-1">
                  {insights?.averagePerDay.toFixed(1) || '0'}
                </div>
                <p className="text-xs text-muted-foreground">moyenne / jour</p>
              </div>

              <div className="text-center p-2 md:p-3">
                <div className={cn(
                  "text-xl md:text-2xl font-bold mb-1 flex items-center justify-center gap-1",
                  insights?.riskLevel === 'low' ? "text-secondary" : insights?.riskLevel === 'moderate' ? "text-accent" : "text-destructive"
                )}>
                  {insights?.riskLevel === 'low' && <Sparkles className="w-4 h-4" />}
                  {insights?.riskLevel === 'low' ? 'Faible' : insights?.riskLevel === 'moderate' ? 'Modéré' : 'Élevé'}
                </div>
                <p className="text-xs text-muted-foreground">risque</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}