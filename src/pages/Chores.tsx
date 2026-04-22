"use client";

import { useEffect, useState } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { useChores } from '@/hooks/useChores';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  CheckSquare, 
  Trophy, 
  Clock,
  User,
  Trash2,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { format, parseISO, isToday, isPast, isTomorrow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Chore, CreateChoreForm, ChoreFrequency, ChoreStatus } from '@/types';

const frequencies: { value: ChoreFrequency; label: string }[] = [
  { value: 'daily', label: 'Quotidien' },
  { value: 'weekly', label: 'Hebdomadaire' },
  { value: 'monthly', label: 'Mensuel' },
];

export default function ChoresPage() {
  const { family, members } = useFamily();
  const { chores, loadChores, createChore, completeChore, deleteChore } = useChores();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<CreateChoreForm>({
    title: '',
    description: '',
    frequency: 'weekly',
    points: 10,
    dueDate: undefined,
  });

  useEffect(() => {
    if (family?.id) {
      loadChores();
    }
  }, [family?.id, loadChores]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    setLoading(true);
    try {
      await createChore(formData);
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating chore:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      frequency: 'weekly',
      points: 10,
      dueDate: undefined,
    });
  };

  const filteredChores = chores.filter(chore => {
    if (filter === 'pending') return chore.status === 'pending';
    if (filter === 'completed') return chore.status === 'completed';
    return true;
  });

  const getMember = (memberId?: string) => members.find(m => m.id === memberId);

  const getDueDateLabel = (dueDate?: string) => {
    if (!dueDate) return null;
    const date = parseISO(dueDate);
    if (isToday(date)) return "Aujourd'hui";
    if (isTomorrow(date)) return 'Demain';
    if (isPast(date)) return 'En retard';
    return format(date, 'd MMM', { locale: fr });
  };

  const isOverdue = (chore: Chore) => {
    if (!chore.dueDate || chore.status !== 'pending') return false;
    return isPast(parseISO(chore.dueDate));
  };

  // Stats
  const totalPoints = chores
    .filter(c => c.status === 'completed')
    .reduce((sum, c) => sum + (c.points || 0), 0);

  const pendingCount = chores.filter(c => c.status === 'pending').length;
  const completedCount = chores.filter(c => c.status === 'completed').length;

  // Leaderboard
  const memberPoints = members.map(member => {
    const points = chores
      .filter(c => c.assignedTo === member.id && c.status === 'completed')
      .reduce((sum, c) => sum + (c.points || 0), 0);
    return { ...member, points };
  }).sort((a, b) => b.points - a.points);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <CheckSquare className="h-8 w-8 text-primary" />
            Corvées
          </h1>
          <p className="text-muted-foreground">
            {family?.name || 'Famille'} • {pendingCount} en attente
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle corvée
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Créer une corvée</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Titre</label>
                <Input
                  placeholder="Faire la vaisselle"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="Description optionnelle"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fréquence</label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value as ChoreFrequency }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencies.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Points</label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.points}
                    onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Assigner à</label>
                <Select
                  value={formData.assignedTo || ''}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, assignedTo: value || undefined }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Non assigné" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date limite</label>
                <Input
                  type="datetime-local"
                  value={formData.dueDate ? format(formData.dueDate, "yyyy-MM-dd'T'HH:mm") : ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    dueDate: e.target.value ? new Date(e.target.value) : undefined 
                  }))}
                />
              </div>

              <Button type="submit" className="w-full" loading={loading}>
                Créer la corvée
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-primary">{pendingCount}</div>
            <p className="text-sm text-muted-foreground">En attente</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-secondary">{completedCount}</div>
            <p className="text-sm text-muted-foreground">Terminées</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-accent-foreground flex items-center justify-center gap-2">
              <Trophy className="h-6 w-6" />
              {totalPoints}
            </div>
            <p className="text-sm text-muted-foreground">Points totaux</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chores List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filter */}
          <div className="flex gap-2">
            {(['all', 'pending', 'completed'] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f === 'all' && 'Toutes'}
                {f === 'pending' && 'En attente'}
                {f === 'completed' && 'Terminées'}
              </Button>
            ))}
          </div>

          {/* Chores */}
          {filteredChores.length === 0 ? (
            <Card className="text-center py-12">
              <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">
                {filter === 'pending' ? 'Aucune corvée en attente' : 'Aucune corvée terminée'}
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredChores.map((chore) => {
                const assignee = getMember(chore.assignedTo);
                const overdue = isOverdue(chore);

                return (
                  <Card 
                    key={chore.id}
                    className={cn(
                      "transition-all",
                      chore.status === 'completed' && "opacity-60"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Status toggle */}
                        <button
                          onClick={() => chore.status === 'pending' && completeChore(chore.id)}
                          disabled={chore.status === 'completed'}
                          className={cn(
                            "flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                            chore.status === 'completed' 
                              ? "bg-secondary border-secondary text-white" 
                              : "border-muted-foreground hover:border-secondary",
                            chore.status === 'pending' && "cursor-pointer"
                          )}
                        >
                          {chore.status === 'completed' && (
                            <CheckCircle2 className="h-5 w-5" />
                          )}
                        </button>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className={cn(
                              "font-medium",
                              chore.status === 'completed' && "line-through"
                            )}>
                              {chore.title}
                            </h4>
                            {overdue && (
                              <Badge variant="destructive" size="sm">En retard</Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            {assignee && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {assignee.name}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Trophy className="h-3 w-3" />
                              {chore.points} pts
                            </span>
                            {chore.dueDate && (
                              <span className={cn(
                                "flex items-center gap-1",
                                overdue && "text-destructive"
                              )}>
                                <Clock className="h-3 w-3" />
                                {getDueDateLabel(chore.dueDate)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteChore(chore.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-accent" />
              Classement
            </CardTitle>
          </CardHeader>
          <CardContent>
            {memberPoints.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Aucun membre dans la famille
              </p>
            ) : (
              <div className="space-y-3">
                {memberPoints.map((member, index) => (
                  <div 
                    key={member.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
                  >
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm",
                      index === 0 && "bg-accent text-accent-foreground",
                      index === 1 && "bg-muted-foreground/20",
                      index === 2 && "bg-primary/10",
                      index > 2 && "bg-muted"
                    )}>
                      {index + 1}
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/20 text-secondary text-sm font-semibold">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{member.name}</p>
                    </div>
                    <div className="text-lg font-bold">
                      {member.points}
                    </div>
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