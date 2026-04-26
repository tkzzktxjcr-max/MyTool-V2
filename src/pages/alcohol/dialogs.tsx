"use client";
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Scale, Target, Sparkles, Check, Beer, Wine, GlassWater, Apple } from 'lucide-react';
import { DRINK_TYPES } from '@/features/alcohol/types';
import type { DrinkType } from '@/features/alcohol/types';
import { cn } from '@/lib/utils';

const ICON_OPTIONS = [
  { icon: Beer, value: 'Beer', label: 'Bière' },
  { icon: Wine, value: 'Wine', label: 'Vin' },
  { icon: GlassWater, value: 'Spirit', label: 'Spiritueux' },
  { icon: Apple, value: 'Apple', label: 'Cidre' },
];

interface CreateDrinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: { name: string; type: DrinkType; abv: number; defaultServingSize: number; emoji: string }) => void;
}

export function CreateDrinkDialog({ open, onOpenChange, onCreate }: CreateDrinkDialogProps) {
  const [form, setForm] = useState({ name: '', type: 'beer' as DrinkType, abv: 5, defaultServingSize: 33, emoji: 'Beer' });

  const handleTypeChange = (type: string) => {
    const drinkType = type as DrinkType;
    const defaults = DRINK_TYPES[drinkType];
    setForm({
      name: defaults?.label || '',
      type: drinkType,
      abv: defaults?.defaultAbv || 5,
      defaultServingSize: drinkType === 'wine' ? 15 : drinkType === 'spirit' ? 4 : 33,
      emoji: defaults?.icon || 'CupSoda',
    });
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onCreate({ ...form, name: form.name.trim() });
    setForm({ name: '', type: 'beer', abv: 5, defaultServingSize: 33, emoji: 'Beer' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-4 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-secondary" />Créer une consommation</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nom</label>
            <Input placeholder="Ma bière préférée" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="rounded-xl h-12" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Icône</label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map(({ icon: IconComp, value }) => (
                <button key={value} onClick={() => setForm(p => ({ ...p, emoji: value }))}
                  className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all", form.emoji === value ? "bg-secondary/30 ring-2 ring-secondary" : "bg-white/10 hover:bg-white/20")}>
                  <IconComp className={cn("w-5 h-5", form.emoji === value ? "text-secondary" : "text-muted-foreground")} />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <Select value={form.type} onValueChange={handleTypeChange}>
              <SelectTrigger className="rounded-xl h-12"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(DRINK_TYPES).map(([type, data]) => (
                  <SelectItem key={type} value={type}>{data.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Volume (cl)</label>
              <Input type="number" value={form.defaultServingSize} onChange={e => setForm(p => ({ ...p, defaultServingSize: parseInt(e.target.value) || 0 }))} className="rounded-xl h-12 text-center font-medium" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Degré (%)</label>
              <Input type="number" value={form.abv} onChange={e => setForm(p => ({ ...p, abv: parseFloat(e.target.value) || 0 }))} className="rounded-xl h-12 text-center font-medium" />
            </div>
          </div>
          <Button onClick={handleSubmit} className="w-full rounded-xl h-12 bg-secondary hover:bg-secondary/80" disabled={!form.name.trim()}>
            <Check className="w-4 h-4 mr-2" />Créer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface GoalSetterDialogProps { open: boolean; onOpenChange: (open: boolean) => void; onSetGoal: (limit: number) => Promise<void>; initialLimit: number; }

export function GoalSetterDialog({ open, onOpenChange, onSetGoal, initialLimit }: GoalSetterDialogProps) {
  const [limit, setLimit] = useState(initialLimit);
  const presets = [
    { value: 7, label: '7 (strict)' },
    { value: 10, label: '10 (modéré)' },
    { value: 14, label: '14 (recommandé)' },
    { value: 21, label: '21 (souple)' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-4 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-secondary" />Objectif hebdomadaire</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {presets.map(p => (
            <button key={p.value} onClick={() => setLimit(p.value)}
              className={cn("flex items-center justify-between p-3 rounded-xl border transition-all text-left w-full", limit === p.value ? "bg-secondary/20 border-secondary text-secondary" : "bg-white/5 border-white/10")}>
              <span className="font-medium">{p.label}</span>
              {limit === p.value && <Check className="w-5 h-5" />}
            </button>
          ))}
          <Button onClick={async () => { await onSetGoal(limit); onOpenChange(false); }} className="w-full bg-secondary">Enregistrer</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ProfileEditorDialogProps { open: boolean; onOpenChange: (open: boolean) => void; onUpdateProfile: (data: { weightKg?: number; sex?: string }) => Promise<void>; initialData: { weightKg: number; sex: string }; }

export function ProfileEditorDialog({ open, onOpenChange, onUpdateProfile, initialData }: ProfileEditorDialogProps) {
  const [form, setForm] = useState(initialData);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-4 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Scale className="w-5 h-5 text-secondary" />Paramètres</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Poids (kg)</label>
            <Input type="number" value={form.weightKg} onChange={e => setForm(p => ({ ...p, weightKg: parseInt(e.target.value) }))} className="rounded-xl h-12 text-center text-lg font-medium" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Sexe</label>
            {(['unspecified', 'male', 'female'] as const).map(sex => (
              <button key={sex} onClick={() => setForm(p => ({ ...p, sex }))}
                className={cn("flex items-center justify-between p-3 rounded-xl border transition-all w-full", form.sex === sex ? "bg-secondary/20 border-secondary text-secondary" : "bg-white/5 border-white/10")}>
                <span>{sex === 'unspecified' ? 'Non spécifié' : sex === 'male' ? 'Homme (R=0.68)' : 'Femme (R=0.55)'}</span>
                {form.sex === sex && <Check className="w-5 h-5" />}
              </button>
            ))}
          </div>
          <Button onClick={async () => { await onUpdateProfile(form); onOpenChange(false); }} className="w-full bg-secondary">Enregistrer</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}