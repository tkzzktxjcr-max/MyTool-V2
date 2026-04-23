"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Scale, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DRINK_TYPES } from '@/features/alcohol/types';
import type { DrinkType, CreateDrinkForm } from '@/features/alcohol/types';

interface CreateDrinkDialogProps { open: boolean; onOpenChange: (open: boolean) => void; onCreate: (form: CreateDrinkForm, emoji?: string) => Promise<any>; }
export function CreateDrinkDialog({ open, onOpenChange, onCreate }: CreateDrinkDialogProps) {
  const [form, setForm] = useState<CreateDrinkForm>({ name: 'Bière', type: 'beer', abv: 5, defaultServingSize: 33 });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-4">
        <DialogHeader><DialogTitle>Créer une consommation</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><label className="text-sm font-medium">Nom</label><Input placeholder="Ma bière préférée" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={form.type} onValueChange={v => { const t = v as DrinkType; setForm(p => ({ ...p, type: t, name: DRINK_TYPES[t]?.label || 'Boisson', abv: DRINK_TYPES[t]?.defaultAbv || 5 })); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(DRINK_TYPES).map(([type, data]) => <SelectItem key={type} value={type}>{data.icon} {data.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Degré (%)</label><Input type="number" min="0.1" max="100" step="0.1" value={form.abv} onChange={e => setForm(p => ({ ...p, abv: parseFloat(e.target.value) }))} /></div>
          </div>
          <div className="space-y-2"><label className="text-sm font-medium">Volume (cl)</label><Input type="number" min="1" max="200" value={form.defaultServingSize} onChange={e => setForm(p => ({ ...p, defaultServingSize: parseInt(e.target.value) }))} /></div>
          <Button onClick={async () => { if (!form.name) return; await onCreate(form, DRINK_TYPES[form.type]?.icon); onOpenChange(false); }} className="w-full">Créer</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface CustomizeDrinkDialogProps { open: boolean; onOpenChange: (open: boolean) => void; onCustomize: (data: { name: string; abv: number; defaultServingSize: number; emoji: string }) => Promise<any>; drinkType: DrinkType | null; initialData: { name: string; abv: number; defaultServingSize: number; emoji: string }; }
export function CustomizeDrinkDialog({ open, onOpenChange, onCustomize, drinkType, initialData }: CustomizeDrinkDialogProps) {
  const [form, setForm] = useState(initialData);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-4">
        <DialogHeader><DialogTitle>Personnaliser "{DRINK_TYPES[drinkType!]?.label}"</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><label className="text-sm font-medium">Nom</label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Volume (cl)</label>
              <Select value={String(form.defaultServingSize)} onValueChange={v => setForm(p => ({ ...p, defaultServingSize: parseInt(v) }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{[20, 25, 33, 40, 50, 75, 100].map(size => <SelectItem key={size} value={String(size)}>{size} cl</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Degré (%)</label>
              <Select value={String(form.abv)} onValueChange={v => setForm(p => ({ ...p, abv: parseFloat(v) }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{[3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 40].map(abv => <SelectItem key={abv} value={String(abv)}>{abv}%</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Émoji</label>
            <div className="flex gap-2 flex-wrap">
              {['🍺', '🍻', '🍷', '🥃', '🍹', '🍾', '🥂', '🍸', '🧃', '🥤'].map(emoji => (
                <button key={emoji} onClick={() => setForm(p => ({ ...p, emoji }))} className={cn("w-10 h-10 rounded-lg text-xl flex items-center justify-center", form.emoji === emoji ? "bg-secondary/30 ring-2 ring-secondary" : "bg-white/10 hover:bg-white/20")}>{emoji}</button>
              ))}
            </div>
          </div>
          <Button onClick={async () => { if (!drinkType) return; await onCustomize(form); onOpenChange(false); }} className="w-full">Enregistrer</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface GoalSetterDialogProps { open: boolean; onOpenChange: (open: boolean) => void; onSetGoal: (limit: number) => Promise<any>; initialLimit: number; }
export function GoalSetterDialog({ open, onOpenChange, onSetGoal, initialLimit }: GoalSetterDialogProps) {
  const [limit, setLimit] = useState(initialLimit);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-4">
        <DialogHeader><DialogTitle>Objectif hebdomadaire</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><label className="text-sm font-medium flex items-center gap-2"><Target className="w-4 h-4" />Limite (unités/semaine)</label>
            <Select value={String(limit)} onValueChange={v => setLimit(parseInt(v))}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="7">7 (strict)</SelectItem><SelectItem value="10">10 (modéré)</SelectItem><SelectItem value="14">14 (recommandé OMS)</SelectItem><SelectItem value="21">21 (souple)</SelectItem></SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">L'OMS recommande maximum 14 unités/semaine.</p>
          <Button onClick={async () => { await onSetGoal(limit); onOpenChange(false); }} className="w-full">Enregistrer</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ProfileEditorDialogProps { open: boolean; onOpenChange: (open: boolean) => void; onUpdateProfile: (data: { weightKg?: number; sex?: 'male' | 'female' | 'unspecified' }) => Promise<any>; initialData: { weightKg: number; sex: 'male' | 'female' | 'unspecified' }; }
export function ProfileEditorDialog({ open, onOpenChange, onUpdateProfile, initialData }: ProfileEditorDialogProps) {
  const [form, setForm] = useState(initialData);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-4">
        <DialogHeader><DialogTitle>Paramètres</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><label className="text-sm font-medium flex items-center gap-2"><Scale className="w-4 h-4" />Poids (kg)</label><Input type="number" min="30" max="200" value={form.weightKg} onChange={e => setForm(p => ({ ...p, weightKg: parseInt(e.target.value) }))} /></div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Sexe (estimation BAC)</label>
            <Select value={form.sex} onValueChange={v => setForm(p => ({ ...p, sex: v as 'male' | 'female' | 'unspecified' }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="unspecified">Non spécifié</SelectItem><SelectItem value="male">Homme (r=0.68)</SelectItem><SelectItem value="female">Femme (r=0.55)</SelectItem></SelectContent>
            </Select>
          </div>
          <Button onClick={async () => { await onUpdateProfile(form); onOpenChange(false); }} className="w-full">Enregistrer</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}