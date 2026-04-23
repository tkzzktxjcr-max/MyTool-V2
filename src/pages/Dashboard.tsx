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
import { Calendar as CalendarIcon, CheckSquare, Plus, ArrowRight, PartyPopper, Users, TrendingUp, TrendingDown, Activity, Sparkles } from 'lucide-react';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// Animated counter component
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

// Greeting based on time
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { family, members } = useFamily();
  const { events, loadEvents } = useCalendar();
  const { loadChores, getTodaysChores, chores } = useChores();
  const { budgetUsed, loadEntries, totalExpenses, totalIncome } = useBudget();
  const { insights, loadLogs, getTodayUnits } = useAlcohol();

  useEffect(() => {
    if (!family?.id) return;
    Promise.all([loadEvents(), loadChores(), loadEntries(), loadLogs()]);
  }, [family?.id, loadEvents, loadChores, loadEntries, loadLogs]);

  if (!family) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto text-center py-20"
      >
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-4xl font-bold mb-6 mx-auto glow-primary"
        >
          {user?.name?.charAt(0).toUpperCase()}
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold mb-2"
        >
          Bienvenue, {user?.name?.split(' ')[0]} 👋
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground mb-8"
        >
          Commencez par créer ou rejoindre une famille
        </motion.p>
        
        <div className="space-y-4">
          <motion.div
            whileHover={{ x: 8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card hover onClick={() => navigate('/family?action=create')} className="cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <Plus className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold">Créer une famille</h3>
                  <p className="text-sm text-muted-foreground">Commencez votre propre espace</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            whileHover={{ x: 8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card hover onClick={() => navigate('/family?action=join')} className="cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="w-14 h-14 rounded-2xl bg-secondary/20 flex items-center justify-center">
                  <Users className="w-7 h-7 text-secondary" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold">Rejoindre une famille</h3>
                  <p className="text-sm text-muted-foreground">Utilisez un code d'invitation</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl glass-card p-8 glow-primary"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">
                {format(new Date(), 'EEEE d MMMM', { locale: fr })}
              </p>
              <h1 className="text-4xl font-bold mb-2">
                {getGreeting()}, {user?.name?.split(' ')[0]} <span className="animate-wave">👋</span>
              </h1>
              <p className="text-muted-foreground">
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <Card glow="primary">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold gradient-text mb-1">
              <AnimatedNumber value={todaysChores.length} />
            </div>
            <p className="text-sm text-muted-foreground">Corvées du jour</p>
            <div className="mt-2 flex justify-center gap-1">
              {Array.from({ length: Math.min(todaysChores.length, 5) }).map((_, i) => (
                <motion.div 
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="w-2 h-2 rounded-full bg-primary"
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card glow="secondary">
          <CardContent className="pt-6 text-center">
            <div className={cn("text-4xl font-bold mb-1", budgetUsed > 80 ? "text-destructive" : "text-secondary")}>
              <AnimatedNumber value={Math.round(budgetUsed)} suffix="%" />
            </div>
            <p className="text-sm text-muted-foreground">Budget utilisé</p>
            <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(budgetUsed, 100)}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                className={cn("h-full rounded-full", budgetUsed > 80 ? "bg-destructive" : "bg-secondary")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold mb-1">
              <AnimatedNumber value={Number(insights?.totalWeeklyUnits.toFixed(1) || 0)} />
            </div>
            <p className="text-sm text-muted-foreground">Alcool (semaine)</p>
            <div className="mt-2 flex items-center justify-center gap-2 text-xs">
              {insights?.totalWeeklyUnits <= 14 ? (
                <>
                  <TrendingDown className="w-4 h-4 text-secondary" />
                  <span className="text-secondary">Dans les limites</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 text-destructive" />
                  <span className="text-destructive">Au-delà</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold mb-1">{upcomingEvents.length}</div>
            <p className="text-sm text-muted-foreground">Événements</p>
            <div className="mt-2 flex justify-center gap-1">
              {upcomingEvents.slice(0, 3).map((event, i) => (
                <motion.div 
                  key={event.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-xs"
                  style={{ backgroundColor: event.color + '40', color: event.color }}
                >
                  {format(parseISO(event.date), 'd')}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <CheckSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg">Corvées du jour</h2>
                    <p className="text-sm text-muted-foreground">{todaysChores.length} tâches en attente</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/chores')}>
                  Voir tout
                </Button>
              </div>

              {todaysChores.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
                    <PartyPopper className="w-8 h-8 text-secondary" />
                  </div>
                  <p className="text-muted-foreground">Aucune corvée prévue aujourd'hui !</p>
                  <p className="text-sm text-muted-foreground mt-1">Profitez de votre temps libre ✨</p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {todaysChores.map((chore, i) => (
                    <motion.div
                      key={chore.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors cursor-pointer"
                    >
                      <motion.div 
                        whileTap={{ scale: 0.9 }}
                        className="w-6 h-6 rounded-full border-2 border-white/20 flex items-center justify-center"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{chore.title}</p>
                        <p className="text-xs text-muted-foreground">{chore.points} points</p>
                      </div>
                      <Badge variant={chore.status === 'completed' ? 'secondary' : 'outline'}>
                        {chore.frequency}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg">À venir</h2>
                    <p className="text-sm text-muted-foreground">{upcomingEvents.length} événements</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/calendar')}>
                  Voir tout
                </Button>
              </div>

              <div className="space-y-4">
                {upcomingEvents.map((event, i) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-start gap-4 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors cursor-pointer"
                  >
                    <motion.div 
                      initial={{ rotate: -10 }}
                      animate={{ rotate: 0 }}
                      className="w-12 h-12 rounded-xl flex flex-col items-center justify-center text-white"
                      style={{ backgroundColor: event.color }}
                    >
                      <span className="text-[10px] font-medium">
                        {format(parseISO(event.date), 'EEE', { locale: fr })}
                      </span>
                      <span className="text-lg font-bold">
                        {format(parseISO(event.date), 'd')}
                      </span>
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(event.date), 'HH:mm')}
                      </p>
                    </div>
                  </motion.div>
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
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">Insights Bien-être</h2>
                  <p className="text-sm text-muted-foreground">Suivi personnel privé</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/alcohol')}>
                Détails
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className={cn(
                  "text-3xl font-bold mb-2",
                  todaysUnits <= 2 ? "text-secondary" : todaysUnits <= 4 ? "text-accent" : "text-destructive"
                )}>
                  {todaysUnits.toFixed(1)}
                </div>
                <p className="text-sm text-muted-foreground">unités aujourd'hui</p>
                <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((todaysUnits / 4) * 100, 100)}%` }}
                    className={cn(
                      "h-full rounded-full",
                      todaysUnits <= 2 ? "bg-secondary" : todaysUnits <= 4 ? "bg-accent" : "bg-destructive"
                    )}
                  />
                </div>
              </div>

              <div className="text-center p-4">
                <div className="text-3xl font-bold text-foreground mb-2">
                  {insights?.averagePerDay.toFixed(1) || '0'}
                </div>
                <p className="text-sm text-muted-foreground">moyenne / jour</p>
                <div className="mt-2 flex justify-center gap-1">
                  {[...Array(7)].map((_, i) => {
                    const dayUnits = insights?.dailyTrend[i]?.units || 0;
                    const height = Math.min(Math.max(dayUnits * 8, 4), 24);
                    return (
                      <motion.div
                        key={i}
                        initial={{ height: 4 }}
                        animate={{ height }}
                        transition={{ delay: 0.5 + i * 0.05 }}
                        className="w-4 bg-primary/40 rounded-full"
                      />
                    );
                  })}
                </div>
              </div>

              <div className="text-center p-4">
                <div className={cn(
                  "text-3xl font-bold mb-2 flex items-center justify-center gap-2",
                  insights?.riskLevel === 'low' ? "text-secondary" : insights?.riskLevel === 'moderate' ? "text-accent" : "text-destructive"
                )}>
                  {insights?.riskLevel === 'low' && <Sparkles className="w-6 h-6" />}
                  {insights?.riskLevel === 'low' ? 'Faible' : insights?.riskLevel === 'moderate' ? 'Modéré' : 'Élevé'}
                </div>
                <p className="text-sm text-muted-foreground">niveau de risque</p>
                {insights?.recommendations[0] && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {insights.recommendations[0]}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}