"use client";

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context';
import { useFamily } from '@/features/family/context';
import { useCalendar } from '@/features/calendar/hooks';
import { useChores } from '@/features/chores/hooks';
import { useBudget } from '@/features/budget/hooks';
import { useAlcohol } from '@/features/alcohol/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, CheckSquare, Plus, ArrowRight, PartyPopper, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { family } = useFamily();
  const { events, loadEvents } = useCalendar();
  const { loadChores, getTodaysChores } = useChores();
  const { budgetUsed, loadEntries } = useBudget();
  const { insights, loadLogs } = useAlcohol();

  useEffect(() => {
    if (!family?.id) return;
    Promise.all([loadEvents(), loadChores(), loadEntries(), loadLogs()]);
  }, [family?.id, loadEvents, loadChores, loadEntries, loadLogs]);

  if (!family) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="mb-8">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-white text-4xl font-bold mb-4">{user?.name?.charAt(0).toUpperCase()}</div>
          <h1 className="text-2xl font-bold mt-4">Bienvenue {user?.name} !</h1>
          <p className="text-muted-foreground mt-2">Créez ou rejoignez une famille</p>
        </div>
        <div className="space-y-4">
          <Card hover className="cursor-pointer" onClick={() => navigate('/family?action=create')}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"><Plus className="h-7 w-7 text-primary" /></div>
              <div className="flex-1 text-left"><h3 className="font-semibold">Créer une famille</h3><p className="text-sm text-muted-foreground">Commencez votre propre espace</p></div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card hover className="cursor-pointer" onClick={() => navigate('/family?action=join')}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10"><Users className="h-7 w-7 text-secondary" /></div>
              <div className="flex-1 text-left"><h3 className="font-semibold">Rejoindre une famille</h3><p className="text-sm text-muted-foreground">Utilisez un code d'invitation</p></div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const todaysChores = getTodaysChores();
  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 3);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">{format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}</p>
          <h1 className="text-3xl font-bold mt-1">Bonjour, {user?.name?.split(' ')[0]} 👋</h1>
        </div>
        <Badge variant="secondary"><Users className="h-4 w-4 mr-1" />{family.name}</Badge>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6 text-center"><div className="text-3xl font-bold text-primary">{todaysChores.length}</div><p className="text-sm text-muted-foreground">Corvées du jour</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><div className="text-3xl font-bold">{Math.round(budgetUsed)}%</div><p className="text-sm text-muted-foreground">Budget utilisé</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><div className="text-3xl font-bold">{insights?.totalWeeklyUnits.toFixed(1) || "0"}</div><p className="text-sm text-muted-foreground">Alcool (semaine)</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><div className="text-3xl font-bold">{upcomingEvents.length}</div><p className="text-sm text-muted-foreground">Événements</p></CardContent></Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3"><CheckSquare className="h-5 w-5 text-primary" /><h2 className="font-semibold">Corvées du jour</h2></div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/chores')}>Voir tout</Button>
            </div>
            {todaysChores.length === 0 ? (
              <div className="text-center py-8"><PartyPopper className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" /><p className="text-muted-foreground">Aucune corvée prévue !</p></div>
            ) : (
              <div className="space-y-3">
                {todaysChores.slice(0, 3).map((chore) => (
                  <div key={chore.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-white font-semibold">{chore.title.charAt(0)}</div>
                    <div className="flex-1"><p className="font-medium">{chore.title}</p><p className="text-xs text-muted-foreground">{chore.points} points</p></div>
                    <Badge variant={chore.status === 'completed' ? 'secondary' : 'accent'}>{chore.status === 'completed' ? '✓' : 'En cours'}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3"><CalendarIcon className="h-5 w-5 text-secondary" /><h2 className="font-semibold">Événements à venir</h2></div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/calendar')}>Voir tout</Button>
            </div>
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8"><CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" /><p className="text-muted-foreground">Aucun événement prévu</p></div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                    <div className="h-12 w-12 rounded-xl flex flex-col items-center justify-center text-white" style={{ backgroundColor: event.color }}>
                      <span className="text-xs">{format(parseISO(event.date), 'EEE', { locale: fr })}</span>
                      <span className="text-lg font-bold">{format(parseISO(event.date), 'd')}</span>
                    </div>
                    <div className="flex-1"><p className="font-medium">{event.title}</p><p className="text-xs text-muted-foreground">{format(parseISO(event.date), 'HH:mm')}</p></div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}