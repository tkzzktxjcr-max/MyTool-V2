"use client";
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Scale, Check, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateProfile: (data: { weightKg?: number; sex?: 'male' | 'female' | 'unspecified' }) => Promise<void>;
  initialData: { weightKg: number; sex: 'male' | 'female' | 'unspecified' };
}

export function ProfileEditorDialog({ open, onOpenChange, onUpdateProfile, initialData }: ProfileEditorDialogProps) {
  const [form, setForm] = useState(initialData);

  const sexOptions = [
    { value: 'unspecified', label: 'Non spécifié', description: 'Pour une estimation générale' },
    { value: 'male', label: 'Homme', description: 'R = 0.68 (plus précis)' },
    { value: 'female', label: 'Femme', description: 'R = 0.55 (plus précis)' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-4 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-secondary" />
            Paramètres
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Scale className="w-4 h-4" />
              Poids (kg)
            </label>
            <Input type="number" min="30" max="200" value={form.weightKg} onChange={(e) => setForm(p => ({ ...p, weightKg: parseInt(e.target.value) }))} className="rounded-xl h-12 text-center text-lg font-medium" />
            <p className="text-xs text-muted-foreground text-center">
              Utilise ton poids actuel pour des estimations précises
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Sexe (estimation BAC)</label>
            <div className="grid gap-2">
              {sexOptions.map(option => (
                <button key={option.value} onClick={() => setForm(p => ({ ...p, sex: option.value as 'male' | 'female' | 'unspecified' }))} className={cn(
                  "flex items-center justify-between p-3 rounded-xl border transition-all text-left",
                  form.sex === option.value ? "bg-secondary/20 border-secondary text-secondary" : "bg-white/5 border-white/10 hover:bg-white/10"
                )}>
                  <div>
                    <p className="font-medium">{option.label}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                  {form.sex === option.value && <Check className="w-5 h-5" />}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={async () => { await onUpdateProfile(form); onOpenChange(false); }} className="w-full rounded-xl h-12 bg-secondary hover:bg-secondary/80">
            <Check className="w-4 h-4 mr-2" />
            Enregistrer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}