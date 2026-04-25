"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Scale, Target, Sparkles, Check } from 'lucide-react';
import { motion } from 'framer-motion';
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
      <DialogContent className="mx-4 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-secondary" />
            Creer une consommation
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nom</label>
            <Input
              placeholder="Ma biere preferee"
              value={form.name}
              onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
              className="rounded-xl h-12"
            />
          </div>

          {/* Emoji picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Emoji</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => setForm(p => ({ ...p, emoji }))}
                  className={cn(
                    "w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all",
                    form.emoji === emoji 
                      ? "bg-secondary/30 ring-2 ring-secondary" 
                      : "bg-white/10 hover:bg-white/20"
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Type selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <Select value={form.type} onValueChange={handleTypeChange}>
              <SelectTrigger className="rounded-xl h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DRINK_TYPES).map(([type, data]) => (
                  <SelectItem key={type} value={type}>{data.icon} {data.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Size and ABV */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Volume (cl)</label>
              <Input
                type="number"
                min="1"
                max="200"
                value={form.servingSize}
                onChange={(e) => setForm(p => ({ ...p, servingSize: parseInt(e.target.value) || 0 }))}
                className="rounded-xl h-12 text-center font-medium"
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
                className="rounded-xl h-12 text-center font-medium"
              />
            </div>
          </div>

          <Button 
            onClick={handleSubmit} 
            className="w-full rounded-xl h-12 bg-secondary hover:bg-secondary/80"
            disabled={!form.name.trim()}
          >
            <Check className="w-4 h-4 mr-2" />
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

  const presets = [
    { value: 7, label: '7 (strict)', description: 'Pour une consommation minimale' },
    { value: 10, label: '10 (modere)', description: 'Au-dessus de la moyenne' },
    { value: 14, label: '14 (recommande)', description: 'Conforme aux recommandations OMS' },
    { value: 21, label: '21 (souple)', description: 'Pour plus de flexibilite' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-4 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-secondary" />
            Objectif hebdomadaire
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              Limite (unites/semaine)
            </label>
            <div className="grid gap-2">
              {presets.map(preset => (
                <button
                  key={preset.value}
                  onClick={() => setLimit(preset.value)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border transition-all text-left",
                    limit === preset.value
                      ? "bg-secondary/20 border-secondary text-secondary"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  )}
                >
                  <div>
                    <p className="font-medium">{preset.label}</p>
                    <p className="text-xs text-muted-foreground">{preset.description}</p>
                  </div>
                  {limit === preset.value && <Check className="w-5 h-5" />}
                </button>
              ))}
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground text-center py-2">
            L'OMS recommande maximum 14 unites/semaine pour un equilibre sain
          </p>
          
          <Button 
            onClick={async () => { await onSetGoal(limit); onOpenChange(false); }} 
            className="w-full rounded-xl h-12 bg-secondary hover:bg-secondary/80"
          >
            <Check className="w-4 h-4 mr-2" />
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

  const sexOptions = [
    { value: 'unspecified', label: 'Non specifie', description: 'Pour une estimation generale' },
    { value: 'male', label: 'Homme', description: 'R = 0.68 (plus precis)' },
    { value: 'female', label: 'Femme', description: 'R = 0.55 (plus precis)' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-4 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-secondary" />
            Parametres
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          {/* Weight */}
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
              className="rounded-xl h-12 text-center text-lg font-medium"
            />
            <p className="text-xs text-muted-foreground text-center">
              Utilise ton poids actuel pour des estimations precises
            </p>
          </div>
          
          {/* Sex */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Sexe (estimation BAC)</label>
            <div className="grid gap-2">
              {sexOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setForm(p => ({ ...p, sex: option.value as 'male' | 'female' | 'unspecified' }))}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border transition-all text-left",
                    form.sex === option.value
                      ? "bg-secondary/20 border-secondary text-secondary"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  )}
                >
                  <div>
                    <p className="font-medium">{option.label}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                  {form.sex === option.value && <Check className="w-5 h-5" />}
                </button>
              ))}
            </div>
          </div>
          
          <Button 
            onClick={async () => { await onUpdateProfile(form); onOpenChange(false); }} 
            className="w-full rounded-xl h-12 bg-secondary hover:bg-secondary/80"
          >
            <Check className="w-4 h-4 mr-2" />
            Enregistrer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper for cn
function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}