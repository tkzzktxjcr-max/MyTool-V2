"use client";

import { useEffect, useState } from 'react';
import { useFamily } from '@/features/family/context';
import { useChores } from '@/features/chores/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, CheckSquare, Trophy, Clock, Trash2, CheckCircle2 } from 'lucide-react';
import { parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import type { CreateChoreForm, ChoreFrequency } from '@/features/chores/types';

const frequencies = [{ value: 'daily', label: 'Quotidien' }, { value: 'weekly', label: 'Hebdomadaire' }, { value: 'monthly', label: 'Mensuel' }];

export default function ChoresPage() {
  const { family, members } = useFamily();
  const { chores, loadChores, createChore, completeChore, deleteChore } = useChores();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [formData, setFormData] = useState<CreateChoreForm>({ title: '', description: '', frequency: 'weekly', points: 10 });

  useEffect(() => { if (family?.id) loadChores(); }, [family?.id, loadChores]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createChore(formData);
    setIsDialogOpen(false);
    setFormData({ title: '', description: '', frequency: 'weekly', points: 10 });
  };

  const filteredChores = chores.filter(chore => filter === 'all' || (filter === 'pending' && chore.status === 'pending') || (filter === 'completed' && chore.status === 'completed'));
  const pendingCount = chores.filter(c => c.status === 'pending').length;
  const completedCount = chores.filter(c => c.status === 'completed').length;
  const totalPoints = chores.filter(c => c.status === 'completed').reduce((sum, c) => sum + (c.points || 0), 0);

  const memberPoints = members.map(member => ({ ...member, points: chores.filter(c => c.assignedTo === member.id && c.status === 'completed').reduce((sum, c) => sum + (c.points || 0), 0) })).sort((a, b) => b.points - a.points);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold flex items-center gap-3"><CheckSquare className="h-8 w-8 text-primary" />Corvées</h1><p className="text-muted-foreground">{family?.name} • {pendingCount} en attente</p></div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Nouvelle corvée</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Créer une corvée</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2"><label className="text-sm font-medium">Titre</label><Input placeholder="Faire la vaisselle" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-sm font-medium">Fréquence</label><Select value={formData.frequency} onValueChange={(v) => setFormData(prev => ({ ...prev, frequency: v as ChoreFrequency }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{frequencies.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><label className="text-sm font-medium">Points</label><Input type="number" min="1" value={formData.points} onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) }))} /></div>
              </div>
              <Button type="submit" className="w-full">Créer</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center"><CardContent className="pt-6"><div className="text-3xl font-bold text-primary">{pendingCount}</div><p className="text-sm text-muted-foreground">En attente</p></CardContent></Card>
        <Card className="text-center"><CardContent className="pt-6"><div className="text-3xl font-bold text-secondary">{completedCount}</div><p className="text-sm text-muted-foreground">Terminées</p></CardContent></Card>
        <Card className="text-center"><CardContent className="pt-6"><div className="text-3xl font-bold text-accent-foreground flex items-center justify-center gap-2"><Trophy className="h-6 w-6" />{totalPoints}</div><p className="text-sm text-muted-foreground">Points totaux</p></CardContent></Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-2">{(['all', 'pending', 'completed'] as const).map(f => <Button key={f} variant={filter === f ? 'primary' : 'outline'} size="sm" onClick={() => setFilter(f)}>{f === 'all' ? 'Toutes' : f === 'pending' ? 'En attente' : 'Terminées'}</Button>)}</div>
          {filteredChores.length === 0 ? (
            <Card className="text-center py-12"><CheckSquare className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" /><p className="text-muted-foreground">Aucune corvée</p></Card>
          ) : (
            <div className="space-y-3">
              {filteredChores.map(chore => (
                <Card key={chore.id} className={cn(chore.status === 'completed' && "opacity-60")}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <button onClick={() => chore.status === 'pending' && completeChore(chore.id)} disabled={chore.status === 'completed'} className={cn("flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center", chore.status === 'completed' ? "bg-secondary border-secondary text-white" : "border-muted-foreground hover:border-secondary cursor-pointer")}>
                        {chore.status === 'completed' && <CheckCircle2 className="h-5 w-5" />}
                      </button>
                      <div className="flex-1">
                        <h4 className={cn("font-medium", chore.status === 'completed' && "line-through")}>{chore.title}</h4>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Trophy className="h-3 w-3" />{chore.points} pts</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{chore.frequency}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteChore(chore.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-4"><Trophy className="h-5 w-5 text-accent" />Classement</h3>
            {memberPoints.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Aucun membre</p>
            ) : (
              <div className="space-y-3">
                {memberPoints.map((member, index) => (
                  <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                    <div className={cn("flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm", index === 0 && "bg-accent", index === 1 && "bg-muted-foreground/20", index === 2 && "bg-primary/10", index > 2 && "bg-muted")}>{index + 1}</div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/20 text-secondary text-sm font-semibold">{member.name.charAt(0)}</div>
                    <div className="flex-1"><p className="font-medium text-sm">{member.name}</p></div>
                    <div className="text-lg font-bold">{member.points}</div>
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