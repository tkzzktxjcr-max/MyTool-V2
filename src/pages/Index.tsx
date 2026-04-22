"use client";

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/contexts/FamilyContext';
import { useCalendar } from '@/hooks/useCalendar';
import { useChores } from '@/hooks/useChores';
import { useBudget } from '@/hooks/useBudget';
import { useAlcohol } from '@/hooks/useAlcohol';
import { Card, CardContent, Button, Badge, StatCard } from '@/components/ui/card';
import { 
  Calendar as CalendarIcon, 
  CheckSquare, 
  Wallet, 
  Wine, 
  Plus,
  ArrowRight,
  PartyPopper,
  Target,
  Users,
} from 'lucide-react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { family, members } = useFamily();
  const { events, loadEvents } = useCalendar();
  const { chores, loadChores, getTodaysChores } = useChores();
  const { totalExpenses, budgetUsed, loadEntries } = useBudget();
  const { insights, getTodayUnits, loadLogs } = useAlcohol();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        loadEvents(),
        loadChores(),
        loadEntries(),
        loadLogs(),
      ]);
      setLoading(false);
    };

    if (profile?.familyId) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [profile?.familyId, loadEvents, loadChores, loadEntries, loadLogs]);

  // Pas de famille - créer ou rejoindre
  if (!family) {
    return (
      <div className="max-w-lg mx-auto text-center py-12 animate-fade-in">
        <div className="mb-8">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-white text-4xl font-bold shadow-lg shadow-primary/25 mb-4">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold mt-4">
            Bienvenue {user?.name} !
          </h1>
          <p className="text-muted-foreground mt-2">
            Créez ou rejoignez une famille pour commencer
          </p>
        </div>

        <div className="space-y-4">
          <Card 
            hover 
            className="cursor-pointer group"
            onClick={() => navigate('/family?action=create')}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Plus className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold">Créer une famille</h3>
                <p className="text-sm text-muted-foreground">
                  Commencez votre propre espace familial
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>

          <Card 
            hover 
            className="cursor-pointer group"
            onClick={() => navigate('/family?action=join')}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10">
                <Target className="h-7 w-7 text-secondary" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold">Rejoindre une famille</h3>
                <p className="text-sm text-muted-foreground">
                  Utilisez un code d'invitation
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-secondary transition-colors" />
            </CardContent>
          </Card>
        </div>

        {/* Preview features */}
        <div className="mt-12 text-left">
          <p className="text-sm font-medium text-muted-foreground mb-4">
            Ce que vous pourrez faire :
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="h-4 w-4 text-secondary" />
              Calendrier partagé
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckSquare className="h-4 w-4 text-primary" />
              Gestion des corvées
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Wallet className="h-4 w-4 text-accent" />
              Suivi du budget
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Wine className="h-4 w-4 text-secondary" />
              Tracker alcool
            </div>
          </div>
        </div>
      </div>
    );
  }

  const todaysChores = getTodaysChores();
  const upcomingEvents = events
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const formatEventDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Aujourd'hui";
    if (isTomorrow(date)) return 'Demain';
    return format(date, 'EEE d MMM', { locale: fr });
  };

  const getAlcoholRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'secondary';
      case 'moderate': return 'accent';
      case 'high': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">
            {format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}
          </p>
          <h1 className="text-3xl font-bold mt-1">
            Bonjour, {user?.name?.split(' ')[0]} 👋
          </h1>
        </div>
        <Badge variant="primary" size="lg">
          <Users className="h-4 w-4 mr-1" />
          {family.name}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Corvées du jour"
          value={todaysChores.length}
          subtitle={todaysChores.length === 0 ? "Rien de prévu" : "à faire"}
          icon={<CheckSquare className="h-6 w-6" />}
          color="primary"
        />
        <StatCard
          title="Budget utilisé"
          value={`${Math.round(budgetUsed)}%`}
          subtitle={family.monthlyBudget ? `de ${family.monthlyBudget}€` : "pas de budget"}
          icon={<Wallet className="h-6 w-6" />}
          color={budgetUsed > 80 ? "destructive" : "secondary"}
        />
        <StatCard
          title="Alcool cette semaine"
          value={insights?.totalWeeklyUnits.toFixed(1) || "0"}
          subtitle="unités"
          icon={<Wine className="h-6 w-6" />}
          color={getAlcoholRiskColor(insights?.riskLevel || 'low')}
        />
        <StatCard
          title="Événements à venir"
          value={upcomingEvents.length}
          subtitle="cette semaine"
          icon={<CalendarIcon className="h-6 w-6" />}
          color="accent"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Chores */}
        <Card>
          <div className="p-5 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <CheckSquare className="h-5 w-5 text-primary" />
                </div>
                <h2 className="font-semibold">Corvées du jour</h2>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/chores')}
              >
                Voir tout
              </Button>
            </div>
          </div>
          <CardContent className="p-5">
            {todaysChores.length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 mb-3">
                  <PartyPopper className="h-6 w-6 text-secondary" />
                </div>
                <p className="text-muted-foreground">Aucune corvée prévue !</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaysChores.slice(0, 3).map((chore) => {
                  const assignee = members.find(m => m.id === chore.assignedTo);
                  return (
                    <div 
                      key={chore.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
                    >
                      <div 
                        className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: assignee ? '#4ECDC4' : '#95A5A6' }}
                      >
                        {assignee?.name.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{chore.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {chore.points} points
                        </p>
                      </div>
                      <Badge 
                        variant={chore.status === 'completed' ? 'secondary' : 'accent'}
                      >
                        {chore.status === 'completed' ? '✓' : 'En cours'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <div className="p-5 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10">
                  <CalendarIcon className="h-5 w-5 text-secondary" />
                </div>
                <h2 className="font-semibold">Événements à venir</h2>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/calendar')}
              >
                Voir tout
              </Button>
            </div>
          </div>
          <CardContent className="p-5">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 mb-3">
                  <CalendarIcon className="h-6 w-6 text-secondary" />
                </div>
                <p className="text-muted-foreground">Aucun événement prévu</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => navigate('/calendar')}
                >
                  Ajouter un événement
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div 
                    key={event.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
                  >
                    <div 
                      className="h-12 w-12 rounded-xl flex flex-col items-center justify-center text-white"
                      style={{ backgroundColor: event.color || '#95A5A6' }}
                    >
                      <span className="text-xs">
                        {format(parseISO(event.date), 'EEE', { locale: fr })}
                      </span>
                      <span className="text-lg font-bold">
                        {format(parseISO(event.date), 'd')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatEventDate(event.date)} • {format(parseISO(event.date), 'HH:mm')}
                      </p>
                    </div>
                    <Badge variant="outline" size="sm">
                      {event.category}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget Overview */}
        <Card>
          <div className="p-5 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20">
                  <Wallet className="h-5 w-5 text-accent-foreground" />
                </div>
                <h2 className="font-semibold">Budget du mois</h2>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/budget')}
              >
                Détails
              </Button>
            </div>
          </div>
          <CardContent className="p-5">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Dépensé</span>
                  <span className="font-semibold">{totalExpenses.toFixed(2)}€</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(budgetUsed, 100)}%`,
                      backgroundColor: budgetUsed > 80 ? '#EF4444' : budgetUsed > 60 ? '#F59E0B' : '#4ECDC4',
                    }}
                  />
                </div>
              </div>
              
              {family.monthlyBudget && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Budget restant</span>
                  <span className="font-semibold text-secondary">
                    {(family.monthlyBudget - totalExpenses).toFixed(2)}€
                  </span>
                </div>
              )}

              {insights?.recommendations && insights.recommendations.length > 0 && (
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">💡 Conseil budget</p>
                  <p className="text-sm">
                    {totalExpenses > (family?.monthlyBudget || 0) 
                      ? "Vous avez dépassé votre budget ce mois"
                      : "Vous êtes dans les clous !"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alcohol Insights */}
        <Card>
          <div className="p-5 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10">
                  <Wine className="h-5 w-5 text-secondary" />
                </div>
                <h2 className="font-semibold">Suivi alcool</h2>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/alcohol')}
              >
                Tracker
              </Button>
            </div>
          </div>
          <CardContent className="p-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Aujourd'hui</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{getTodayUnits().toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">unités</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Cette semaine</span>
                  <span className="font-medium">
                    {insights?.totalWeeklyUnits.toFixed(1)} / 14
                  </span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min((insights?.totalWeeklyUnits || 0) / 14 * 100, 100)}%`,
                      backgroundColor: insights?.riskLevel === 'low' ? '#4ECDC4' : insights?.riskLevel === 'moderate' ? '#F59E0B' : '#EF4444',
                    }}
                  />
                </div>
              </div>

              {insights && (
                <div className="flex items-center gap-2 pt-2">
                  <Badge 
                    variant={getAlcoholRiskColor(insights.riskLevel)}
                  >
                    {insights.riskLevel === 'low' && '✓ Risque faible'}
                    {insights.riskLevel === 'moderate' && '⚠️ Risque modéré'}
                    {insights.riskLevel === 'high' && '⚠️ Risque élevé'}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}