"use client";

import { useEffect, useState } from 'react';
import { useFamily } from '@/features/family/context';
import { useChores } from '@/features/chores/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, CheckSquare, Trophy, Trash2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CreateChoreForm, ChoreFrequency } from '@/features/chores/types';

const frequencies = [
  { value: 'daily', label: 'Quotidien' },
  { value: 'weekly', label: 'Hebdomadaire' },
  { value: 'monthly', label: 'Mensuel' }
];

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

  const filteredChores = chores.filter(chore => 
    filter === 'all' || (filter === 'pending' && chore.status === 'pending') || (filter === 'completed' && chore.status === 'completed')
  );
  const pendingCount = chores.filter(c => c.status === 'pending').length;
  const completedCount = chores.filter(c => c.status === 'completed').length;
  const totalPoints = chores.filter(c => c.status === 'completed').reduce((sum, c) => sum + (c.points || 0), 0);

  return (
    <div className="space-y-4 md:space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-bold flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <CheckSquare className="w-4 h-4 md:w-6 md:h-6 text-primary" />
            </div>
            <span className="hidden sm:inline">Corvées</span>
          </h1>
          <p className="text-muted-foreground text-sm">{family?.name} • {pendingCount} en attente</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Nouvelle corvée</span>
              <span className="sm:hidden">Ajouter</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-4">
            <DialogHeader><DialogTitle>Créer une corvée</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Titre</label>
                <Input placeholder="Faire la vaisselle" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fréquence</label>
                  <Select value={formData.frequency} onValueChange={(v) => setFormData(prev => ({ ...prev, frequency: v as ChoreFrequency }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{frequencies.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Points</label>
                  <Input type="number" min="1" value={formData.points} onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) }))} />
                </div>
              </div>
              <Button type="submit" className="w-full">Créer</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        <Card className="text-center py-3 md:py-4">
          <div className="text-xl md:text-3xl font-bold text-primary">{pendingCount}</div>
          <p className="text-xs text-muted-foreground">En attente</p>
        </Card>
        <Card className="text-center py-3 md:py-4">
          <div className="text-xl md:text-3xl font-bold text-secondary">{completedCount}</div>
          <p className="text-xs text-muted-foreground">Terminées</p>
        </Card>
        <Card className="text-center py-3 md:py-4">
          <div className="text-xl md:text-3xl font-bold text-accent flex items-center justify-center gap-1">
            <Trophy className="w-4 h-4 md:w-5 md:h-5" />
            {totalPoints}
          </div>
          <p className="text-xs text-muted-foreground">Points</p>
        </Card>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl w-fit">
        {(['all', 'pending', 'completed'] as const).map(f => (
          <Button key={f} variant={filter === f ? 'primary' : 'ghost'} size="sm" onClick={() => setFilter(f)} className="text-xs md:text-sm">
            {f === 'all' ? 'Toutes' : f === 'pending' ? 'En attente' : 'Terminées'}
          </Button>
        ))}
      </div>

      {/* Chores list */}
      {filteredChores.length === 0 ? (
        <Card className="text-center py-8">
          <CheckSquare className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
          <p className="text-muted-foreground">Aucune corvée</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredChores.map(chore => (
            <Card key={chore.id} className={cn(chore.status === 'completed' && "opacity-60")}>
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => chore.status === 'pending' && completeChore(chore.id)}
                    disabled={chore.status === 'completed'}
                    className={cn(
                      "w-6 h-6 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                      chore.status === 'completed' ? "bg-secondary border-secondary text-white" : "border-white/20 hover:border-secondary"
                    )}
                  >
                    {chore.status === 'completed' && <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h4 className={cn("font-medium text-sm md:text-base", chore.status === 'completed' && "line-through")}>{chore.title}</h4>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-0.5"><Trophy className="w-3 h-3" />{chore.points} pts</span>
                      <span>{chore.frequency}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8 flex-shrink-0" onClick={() => deleteChore(chore.id)}>
                    <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}