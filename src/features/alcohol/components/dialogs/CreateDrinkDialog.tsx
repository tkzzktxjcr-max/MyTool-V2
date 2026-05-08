import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Check, Beer, Wine, CupSoda, Apple } from 'lucide-react';
import { DRINK_TYPES } from '@/features/alcohol/types';
import type { DrinkType } from '@/features/alcohol/types';
import { cn } from '@/lib/utils';

interface CreateDrinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: { name: string; type: DrinkType; abv: number; defaultServingSize: number; emoji: string }) => void;
}

export function CreateDrinkDialog({ open, onOpenChange, onCreate }: CreateDrinkDialogProps) {
  const [form, setForm] = useState({ name: '', type: 'beer' as DrinkType, abv: 5, servingSize: 33, emoji: 'Beer' });

  const handleTypeChange = (type: string) => {
    const drinkType = type as DrinkType;
    const defaults = DRINK_TYPES[drinkType];
    setForm({ 
      name: defaults?.label || '', 
      type: drinkType, 
      abv: defaults?.defaultAbv || 5, 
      servingSize: drinkType === 'wine' ? 15 : drinkType === 'spirit' ? 4 : 33, 
      emoji: defaults?.icon || 'CupSoda' 
    });
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onCreate({ name: form.name.trim(), type: form.type, abv: form.abv, defaultServingSize: form.servingSize, emoji: form.emoji });
    setForm({ name: '', type: 'beer', abv: 5, servingSize: 33, emoji: 'Beer' });
    onOpenChange(false);
  };

  const ICON_OPTIONS = [
    { icon: Beer, value: 'Beer', label: 'Beer' },
    { icon: Wine, value: 'Wine', label: 'Wine' },
    { icon: CupSoda, value: 'CupSoda', label: 'Spirit' },
    { icon: CupSoda, value: 'Cocktail', label: 'Cocktail' },
    { icon: Apple, value: 'Apple', label: 'Cidre' },
  ];

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
            <Input placeholder="Ma biere preferee" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} className="rounded-xl h-12" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Icone</label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map(({ icon: IconComp, value, label }) => (
                <button key={value} onClick={() => setForm(p => ({ ...p, emoji: value }))}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                    form.emoji === value ? "bg-secondary/30 ring-2 ring-secondary" : "bg-white/10 hover:bg-white/20"
                  )} title={label}>
                  <IconComp className={cn("w-5 h-5", form.emoji === value ? "text-secondary" : "text-muted-foreground")} />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <Select value={form.type} onValueChange={handleTypeChange}>
              <SelectTrigger className="rounded-xl h-12"><SelectValue /></SelectTrigger>
              <SelectContent>{Object.entries(DRINK_TYPES).map(([type, data]) => (
                <SelectItem key={type} value={type}>{data.label}</SelectItem>
              ))}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Volume (cl)</label>
              <Input type="number" min="1" max="200" value={form.servingSize} onChange={(e) => setForm(p => ({ ...p, servingSize: parseInt(e.target.value) || 0 }))} className="rounded-xl h-12 text-center font-medium" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Degre (%)</label>
              <Input type="number" min="0.1" max="100" step="0.1" value={form.abv} onChange={(e) => setForm(p => ({ ...p, abv: parseFloat(e.target.value) || 0 }))} className="rounded-xl h-12 text-center font-medium" />
            </div>
          </div>
          <Button onClick={handleSubmit} className="w-full rounded-xl h-12 bg-secondary hover:bg-secondary/80" disabled={!form.name.trim()}>
            <Check className="w-4 h-4 mr-2" />Creer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}