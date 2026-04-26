"use client";
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Target, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    { value: 10, label: '10 (modéré)', description: 'Au-dessus de la moyenne' },
    { value: 14, label: '14 (recommandé)', description: 'Conforme aux recommandations OMS' },
    { value: 21, label: '21 (souple)', description: 'Pour plus de flexibilité' },
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
          <div className="grid gap-2">
            {presets.map(preset => (
              <button key={preset.value} onClick={() => setLimit(preset.value)} className={cn(
                "flex items-center justify-between p-3 rounded-xl border transition-all text-left", 
                limit === preset.value ? "bg-secondary/20 border-secondary text-secondary" : "bg-white/5 border-white/10 hover:bg-white/10"
              )}>
                <div>
                  <p className="font-medium">{preset.label}</p>
                  <p className="text-xs text-muted-foreground">{preset.description}</p>
                </div>
                {limit === preset.value && <Check className="w-5 h-5" />}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center py-2">
            L'OMS recommande maximum 14 unités/semaine pour un équilibre sain
          </p>
          <Button onClick={async () => { await onSetGoal(limit); onOpenChange(false); }} className="w-full rounded-xl h-12 bg-secondary hover:bg-secondary/80">
            <Check className="w-4 h-4 mr-2" />
            Enregistrer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}