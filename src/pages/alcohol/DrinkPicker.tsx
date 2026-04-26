drink">
"use client";
import { useState } from 'react';
import { Search, Plus, X, ChevronRight, Sparkles, Globe, Star, Trash2, AlertTriangle, Beer, Wine, GlassWater } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { Drink } from '@/features/alcohol/services';
import type { DrinkType } from '@/features/alcohol/types';
import { DRINK_TYPES } from '@/features/alcohol/types';
import { getTimeOfDay, type TimeOfDay } from '@/features/alcohol/services';

const TIME_LABELS: Record<TimeOfDay, string> = { morning: 'Matin', afternoon: 'Après-midi', evening: 'Soirée', night: 'Nuit' };

const getDrinkIcon = (type: string) => {
  switch (type) {
    case 'beer': case 'lager': case 'pilsner': case 'wheat_beer': case 'ipa': case 'ale': case 'cider': case 'calvados':
      return Beer;
    case 'wine': case 'red_wine': case 'white_wine': case 'rose_wine': case 'sangria':
      return Wine;
    default:
      return GlassWater;
  }
};

interface DrinkPickerProps {
  drinks: Drink[];
  libraryDrinks?: Drink[];
  userDrinks?: Drink[];
  smartDrinks?: Drink[];
  onSelect: (drink: Drink) => void;
  onCreate: (data: { name: string; type: DrinkType; abv: number; defaultServingSize: number; emoji: string }) => void;
  onToggleFavorite?: (drinkId: string) => void;
  onDeleteDrink?: (drinkId: string) => void;
  currentUserId?: string;
}

export default function DrinkPicker({ drinks, libraryDrinks = [], userDrinks = [], smartDrinks = drinks, onSelect, onCreate, onToggleFavorite, onDeleteDrink, currentUserId }: DrinkPickerProps) {
  const [query, setQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [drinkToDelete, setDrinkToDelete] = useState<Drink | null>(null);
  const [newDrink, setNewDrink] = useState({ name: '', type: 'beer' as DrinkType, abv: 5, defaultServingSize: 33, emoji: 'Beer' });

  const timeInfo = TIME_LABELS[getTimeOfDay()];
  const filtered = query.trim() ? smartDrinks.filter(d => d.name.toLowerCase().includes(query.toLowerCase()) || DRINK_TYPES[d.type]?.label.toLowerCase().includes(query.toLowerCase())) : smartDrinks;
  const filteredUser = filtered.filter(d => d.userId === currentUserId);
  const filteredLibrary = filtered.filter(d => !d.userId);

  const handleTypeChange = (type: DrinkType) => {
    const defaults = DRINK_TYPES[type];
    setNewDrink({ type, abv: defaults?.defaultAbv || 5, defaultServingSize: type === 'wine' ? 15 : type === 'spirit' ? 4 : 33, emoji: defaults?.icon || 'CupSoda', name: defaults?.label || '' });
  };

  const handleCreate = () => {
    if (!newDrink.name.trim()) return;
    onCreate({ ...newDrink, name: newDrink.name.trim() });
    setShowCreate(false);
    setNewDrink({ name: '', type: 'beer', abv: 5, defaultServingSize: 33, emoji: 'Beer' });
  };

  const renderDrinkItem = (drink: Drink, isUser: boolean) => {
    const Icon = getDrinkIcon(drink.type);
    return (
      <div key={drink.id} onClick={() => onSelect(drink)} className="flex items-center gap-3 p-4 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-b-0">
        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center"><Icon className="w-6 h-6" /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">{drink.name}</p>
            {drink.isGlobal && <Globe className="w-3.5 h-3.5 text-muted-foreground" />}
            {isUser && <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/20 text-secondary">Perso</span>}
          </div>
          <p className="text-xs text-muted-foreground">{DRINK_TYPES[drink.type]?.label} - {drink.abv}% - {drink.defaultServingSize} cl</p>
        </div>
        <div className="flex items-center gap-1">
          {onToggleFavorite && (
            <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(drink.id); }} className={cn("p-2 rounded-lg", drink.isFavorite ? "text-yellow-400" : "text-muted-foreground")}>
              <Star className={cn("w-5 h-5", drink.isFavorite && "fill-current")} />
            </button>
          )}
          {isUser && onDeleteDrink && (
            <button onClick={(e) => { e.stopPropagation(); setDrinkToDelete(drink); }} className="p-2 text-muted-foreground hover:text-destructive">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-secondary/10 text-secondary text-sm">{timeInfo}</div>
      
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher..." className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white/5 border border-white/10 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50" />
        {query && <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2"><X className="w-4 h-4" /></button>}
      </div>

      {showCreate ? (
        <div className="p-4 rounded-2xl bg-card border border-secondary/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center"><Beer className="w-5 h-5 text-secondary" /></div>
              <span className="font-medium">Nouvelle boissons</span>
            </div>
            <button onClick={() => setShowCreate(false)}><X className="w-5 h-5" /></button>
          </div>
          <input type="text" value={newDrink.name} onChange={e => setNewDrink(p => ({ ...p, name: e.target.value }))} placeholder="Nom" autoFocus className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10" />
          <div className="flex gap-2 overflow-x-auto pb-1">
            {Object.entries(DRINK_TYPES).slice(0, 12).map(([key, data]) => (
              <button key={key} onClick={() => handleTypeChange(key as DrinkType)} className={cn("flex-shrink-0 px-3 py-2 rounded-xl text-sm font-medium", newDrink.type === key ? "bg-secondary/20 text-secondary" : "bg-white/5 text-muted-foreground")}>
                {data.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-muted-foreground">Volume (cl)</label><input type="number" value={newDrink.defaultServingSize} onChange={e => setNewDrink(p => ({ ...p, defaultServingSize: parseInt(e.target.value) || 0 }))} className="w-full h-11 px-3 rounded-xl bg-white/5 border text-center font-medium" /></div>
            <div><label className="text-xs text-muted-foreground">Degré (%)</label><input type="number" value={newDrink.abv} onChange={e => setNewDrink(p => ({ ...p, abv: parseFloat(e.target.value) || 0 }))} className="w-full h-11 px-3 rounded-xl bg-white/5 border text-center font-medium" /></div>
          </div>
          <Button onClick={handleCreate} className="w-full bg-secondary" disabled={!newDrink.name.trim()}>Créer</Button>
        </div>
      ) : (
        <>
          {filteredUser.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 px-2 py-1"><span className="text-xs text-muted-foreground font-medium">Mes Boissons</span><span className="text-xs text-secondary">({filteredUser.length})</span></div>
              <div className="rounded-2xl bg-card border border-white/10 overflow-hidden">{filteredUser.slice(0, 6).map(d => renderDrinkItem(d, true))}</div>
            </div>
          )}
          {filteredLibrary.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 px-2 py-1"><Globe className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-xs text-muted-foreground font-medium">Bibliothèque</span></div>
              <div className="rounded-2xl bg-card border border-white/10 overflow-hidden">{filteredLibrary.slice(0, 6).map(d => renderDrinkItem(d, false))}</div>
            </div>
          )}
        </>
      )}

      <Dialog open={!!drinkToDelete} onOpenChange={o => !o && setDrinkToDelete(null)}>
        <DialogContent className="mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="w-5 h-5" />Supprimer ?</DialogTitle>
          </DialogHeader>
          {drinkToDelete && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center"><Beer className="w-6 h-6" /></div>
                <div><p className="font-medium">{drinkToDelete.name}</p><p className="text-sm text-muted-foreground">{DRINK_TYPES[drinkToDelete.type]?.label} - {drinkToDelete.abv}% - {drinkToDelete.defaultServingSize} cl</p></div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setDrinkToDelete(null)} className="flex-1">Annuler</Button>
                <Button variant="destructive" onClick={() => { onDeleteDrink?.(drinkToDelete.id); setDrinkToDelete(null); }} className="flex-1"><Trash2 className="w-4 h-4 mr-2" />Supprimer</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}