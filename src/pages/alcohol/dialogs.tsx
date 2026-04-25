"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Scale, Target } from 'lucide-react';
import { DRINK_TYPES } from '@/features/alcohol/types';
import type { DrinkType } from '@/features/alcohol/types';

interface CreateDrinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: { name: string; type: DrinkType; abv: number; defaultServingSize: number; emoji: string }) => void;
}

export function CreateDrinkDialog({ open, onOpenChange, onCreate }: CreateDrinkDialogProps) {
  const [form, setForm] = useState({
    name: '',
    type: 'beer' as DrinkType,
    abv: 5,
    servingSize: 33,
    emoji: '🍺',
  });

  const handleTypeChange = (type: string) => {
    const drinkType = type as DrinkType;
    const defaults = DRINK_TYPES[drinkType];
    setForm({
      name: defaults?.label || '',
      type: drinkType,
      abv: defaults?.defaultAbv || 5,
      servingSize: drinkType === 'wine' ? 15 : drinkType === 'spirit' ? 4 : 33,
      emoji: defaults?.icon || '🍺',
    });
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onCreate({
      name: form.name.trim(),
      type: form.type,
      abv: form.abv,
      defaultServingSize: form.servingSize,
      emoji: form.emoji,
    });
    setForm({ name: '', type: 'beer', abv: 5, servingSize: 33, emoji: '🍺' });
    onOpenChange(false);
  };

  const EMOJI_OPTIONS = ['🍺', '🍻', '🍷', '🥃', '🍹', '🍾', '🥂', '🍸', '🧃', '🥤'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-4">
        <DialogHeader>
          <DialogTitle>Creer une consommation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nom</label>
            <Input
              placeholder="Ma biere preferee"
              value={form.name}
              onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Emoji</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => setForm(p => ({ ...p, emoji }))}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center ${form.emoji === emoji ? 'bg-secondary/30 ring-2 ring-secondary' : 'bg-white/10 hover:bg-white/20'}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <Select value={form.type} onValueChange={handleTypeChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(DRINK_TYPES).map(([type, data]) => (
                  <SelectItem key={type} value={type}>{data.icon} {data.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Volume (cl)</label>
              <Input
                type="number"
                min="1"
                max="200"
                value={form.servingSize}
                onChange={(e) => setForm(p => ({ ...p, servingSize: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Degre (%)</label>
              <Input
                type="number"
                min="0.1"
                max="100"
                step="0.1"
                value={form.abv}
                onChange={(e) => setForm(p => ({ ...p, abv: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full" disabled={!form.name.trim()}>
            Creer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface GoalSetterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSetGoal: (limit: number) => Promise<void>;
  initialLimit: number;
}

export function GoalSetterDialog({ open, onOpenChange, onSetGoal, initialLimit }: GoalSetterDialogProps) {
  const [limit, setLimit] = useState(initialLimit);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-4">
        <DialogHeader>
          <DialogTitle>Objectif hebdomadaire</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4" />
              Limite (unites/semaine)
            </label>
            <Select value={String(limit)} onValueChange={(v) => setLimit(parseInt(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 (strict)</SelectItem>
                <SelectItem value="10">10 (modere)</SelectItem>
                <SelectItem value="14">14 (recommande OMS)</SelectItem>
                <SelectItem value="21">21 (souple)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">L'OMS recommande maximum 14 unites/semaine.</p>
          <Button onClick={async () => { await onSetGoal(limit); onOpenChange(false); }} className="w-full">
            Enregistrer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ProfileEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateProfile: (data: { weightKg?: number; sex?: 'male' | 'female' | 'unspecified' }) => Promise<void>;
  initialData: { weightKg: number; sex: 'male' | 'female' | 'unspecified' };
}

export function ProfileEditorDialog({ open, onOpenChange, onUpdateProfile, initialData }: ProfileEditorDialogProps) {
  const [form, setForm] = useState(initialData);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-4">
        <DialogHeader>
          <DialogTitle>Parametres</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Scale className="w-4 h-4" />
              Poids (kg)
            </label>
            <Input
              type="number"
              min="30"
              max="200"
              value={form.weightKg}
              onChange={(e) => setForm(p => ({ ...p, weightKg: parseInt(e.target.value) }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Sexe (estimation BAC)</label>
            <Select value={form.sex} onValueChange={(v) => setForm(p => ({ ...p, sex: v as 'male' | 'female' | 'unspecified' }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="unspecified">Non specifie</SelectItem>
                <SelectItem value="male">Homme (r=0.68)</SelectItem>
                <SelectItem value="female">Femme (r=0.55)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={async () => { await onUpdateProfile(form); onOpenChange(false); }} className="w-full">
            Enregistrer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}