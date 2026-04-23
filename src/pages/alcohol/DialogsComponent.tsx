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

interface CreateDrinkDialogProps { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  onCreate: (form: CreateDrinkForm, emoji?: string) => Promise<any>; 
}

const EMOJI_OPTIONS = ['🍺', '🍻', '🍷', '🥃', '🍹', '🍾', '🥂', '🍸', '🧃', '🥤', '☕', '🍵', '🥛', '🧋', '🧃️'];

export function CreateDrinkDialog({ open, onOpenChange, onCreate }: CreateDrinkDialogProps) {
  const [form, setForm] = useState<CreateDrinkForm>({ 
    name: '', 
    type: 'beer', 
    abv: 5, 
    defaultServingSize: 33 
  });
  const [emoji, setEmoji] = useState('🍺');
  
  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    await onCreate(form, emoji);
    // Reset form
    setForm({ name: '', type: 'beer', abv: 5, defaultServingSize: 33 });
    setEmoji('🍺');
    onOpenChange(false);
  };
  
  const handleTypeChange = (type: string) => {
    const drinkType = type as DrinkType;
    const defaults = DRINK_TYPES[drinkType];
    setForm(prev => ({
      ...prev,
      type: drinkType,
      abv: defaults?.defaultAbv || 5,
      defaultServingSize: drinkType === 'wine' ? 12 : drinkType === 'spirit' ? 4 : 33,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-4 max-w-md">
        <DialogHeader>
          <DialogTitle>Créer une consommation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nom de la consommation</label>
            <Input 
              placeholder="Ex: Mon Whisky préféré" 
              value={form.name} 
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            />
          </div>
          
          {/* Emoji picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Icône</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map(emojiOption => (
                <button
                  key={emojiOption}
                  type="button"
                  onClick={() => setEmoji(emojiOption)}
                  className={cn(
                    "w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-colors",
                    emoji === emojiOption 
                      ? "bg-secondary/30 ring-2 ring-secondary" 
                      : "bg-white/10 hover:bg-white/20"
                  )}
                >
                  {emojiOption}
                </button>
              ))}
            </div>
          </div>
          
          {/* Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Catégorie</label>
            <Select value={form.type} onValueChange={handleTypeChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(DRINK_TYPES).map(([type, data]) => (
                  <SelectItem key={type} value={type}>
                    {data.icon} {data.label}
                  </SelectItem>
                ))}
                <SelectItem value="custom">
                  ✨ Autre (personnalisé)
                </SelectItem>
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
                value={form.defaultServingSize} 
                onChange={e => setForm(p => ({ ...p, defaultServingSize: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Degré (%)</label>
              <Input 
                type="number" 
                min="0.1" 
                max="100" 
                step="0.1" 
                value={form.abv} 
                onChange={e => setForm(p => ({ ...p, abv: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>
          
          {/* Preview */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{emoji}</span>
              <div>
                <p className="font-medium">{form.name || 'Sans nom'}</p>
                <p className="text-sm text-muted-foreground">
                  {form.defaultServingSize} cl • {form.abv}% • {form.type !== 'custom' ? DRINK_TYPES[form.type]?.label : 'Personnalisé'}
                </p>
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              ≈ {(form.defaultServingSize * form.abv / 100 * 0.789 / 10).toFixed(1)} unités
            </div>
          </div>
          
          <Button 
            onClick={handleSubmit} 
            className="w-full" 
            disabled={!form.name.trim()}
          >
            Créer ma consommation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface CustomizeDrinkDialogProps { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  onCustomize: (data: { name: string; abv: number; defaultServingSize: number; emoji: string }) => Promise<any>; 
  drinkType: DrinkType | null; 
  initialData: { name: string; abv: number; defaultServingSize: number; emoji: string }; 
}

export function CustomizeDrinkDialog({ open, onOpenChange, onCustomize, drinkType, initialData }: CustomizeDrinkDialogProps) {
  const [form, setForm] = useState(initialData);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-4">
        <DialogHeader>
          <DialogTitle>Personnaliser "{DRINK_TYPES[drinkType!]?.label}"</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nom personnalisé</label>
            <Input 
              value={form.name} 
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))} 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Volume (cl)</label>
              <Select 
                value={String(form.defaultServingSize)} 
                onValueChange={v => setForm(p => ({ ...p, defaultServingSize: parseInt(v) }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[10, 15, 20, 25, 33, 40, 50, 75, 100, 150, 200].map(size => (
                    <SelectItem key={size} value={String(size)}>{size} cl</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Degré (%)</label>
              <Select 
                value={String(form.abv)} 
                onValueChange={v => setForm(p => ({ ...p, abv: parseFloat(v) }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 18, 20, 25, 30, 40, 50, 60].map(abv => (
                    <SelectItem key={abv} value={String(abv)}>{abv}%</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Émoji</label>
            <div className="flex gap-2 flex-wrap">
              {['🍺', '🍻', '🍷', '🥃', '🍹', '🍾', '🥂', '🍸', '🧃', '🥤'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => setForm(p => ({ ...p, emoji }))}
                  className={cn(
                    "w-10 h-10 rounded-lg text-xl flex items-center justify-center",
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
          
          <Button 
            onClick={async () => { 
              if (!drinkType) return; 
              await onCustomize(form); 
              onOpenChange(false); 
            }} 
            className="w-full"
          >
            Enregistrer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface GoalSetterDialogProps { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  onSetGoal: (limit: number) => Promise<any>; 
  initialLimit: number; 
}
export function GoalSetterDialog({ open, onOpenChange, onSetGoal, initialLimit }: GoalSetterDialogProps) {
  const [limit, setLimit] = useState(initialLimit);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-4">
        <DialogHeader><DialogTitle>Objectif hebdomadaire</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4" />
              Limite (unités/semaine)
            </label>
            <Select value={String(limit)} onValueChange={v => setLimit(parseInt(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 (strict)</SelectItem>
                <SelectItem value="10">10 (modéré)</SelectItem>
                <SelectItem value="14">14 (recommandé OMS)</SelectItem>
                <SelectItem value="21">21 (souple)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">L'OMS recommande maximum 14 unités/semaine.</p>
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
  onUpdateProfile: (data: { weightKg?: number; sex?: 'male' | 'female' | 'unspecified' }) => Promise<any>; 
  initialData: { weightKg: number; sex: 'male' | 'female' | 'unspecified' }; 
}
export function ProfileEditorDialog({ open, onOpenChange, onUpdateProfile, initialData }: ProfileEditorDialogProps) {
  const [form, setForm] = useState(initialData);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-4">
        <DialogHeader><DialogTitle>Paramètres</DialogTitle></DialogHeader>
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
              onChange={e => setForm(p => ({ ...p, weightKg: parseInt(e.target.value) }))} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Sexe (estimation BAC)</label>
            <Select 
              value={form.sex} 
              onValueChange={v => setForm(p => ({ ...p, sex: v as 'male' | 'female' | 'unspecified' }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="unspecified">Non spécifié</SelectItem>
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