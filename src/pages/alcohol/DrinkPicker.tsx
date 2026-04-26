"use client";

import { useState } from 'react';
import { Search, Plus, X, ChevronRight, Sparkles, Globe, Star, Check, Trash2, AlertTriangle, Beer, Wine, CupSoda, Apple } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Drink } from '@/features/alcohol/services';
import type { DrinkType } from '@/features/alcohol/types';
import { DRINK_TYPES } from '@/features/alcohol/types';
import { getTimeOfDay, type TimeOfDay } from '@/features/alcohol/services';
import { GlassWater } from 'lucide-react';

const TIME_LABELS: Record<TimeOfDay, { label: string; icon: string }> = {
  morning: { label: 'Matin', icon: '🌅' },
  afternoon: { label: 'Après-midi', icon: '☀️' },
  evening: { label: 'Soirée', icon: '🌆' },
  night: { label: 'Nuit', icon: '🌙' },
};

const getDrinkIconComponent = (type: string) => {
  switch (type) {
    case 'beer':
    case 'lager':
    case 'pilsner':
    case 'wheat_beer':
    case 'ipa':
    case 'ale':
    case 'stout':
      return Beer;
    case 'wine':
    case 'red_wine':
    case 'white_wine':
    case 'rose_wine':
    case 'sangria':
    case 'sherry':
    case 'port':
      return Wine;
    case 'spirit':
    case 'whisky':
    case 'tequila':
    case 'brandy':
    case 'cognac':
      return CupSoda;
    case 'cocktail':
    case 'martini':
    case 'mojito':
    case 'margarita':
    case 'old_fashioned':
    case 'cosmopolitan':
    case 'daiquiri':
    case 'pina_colada':
    case 'aperol_spritz':
    case 'champagne':
    case 'sparkling':
      return CupSoda;
    case 'cider':
    case 'calvados':
      return Apple;
    case 'vodka':
    case 'rum':
    case 'gin':
    case 'soju':
      return GlassWater;
    default:
      return Beer;
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

export default function DrinkPicker({ 
  drinks, 
  libraryDrinks = [], 
  userDrinks = [], 
  smartDrinks = drinks,
  onSelect, 
  onCreate,
  onToggleFavorite,
  onDeleteDrink,
  currentUserId
}: DrinkPickerProps) {
  const [query, setQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [drinkToDelete, setDrinkToDelete] = useState<Drink | null>(null);
  const [newDrink, setNewDrink] = useState({
    name: '',
    type: 'beer' as DrinkType,
    abv: 5,
    servingSize: 33,
    emoji: 'Beer',
  });

  const currentTime = getTimeOfDay();
  const timeInfo = TIME_LABELS[currentTime];

  const filteredDrinks = query.trim()
    ? smartDrinks.filter(d => d.name.toLowerCase().includes(query.toLowerCase()) || DRINK_TYPES[d.type]?.label.toLowerCase().includes(query.toLowerCase()))
    : smartDrinks;

  const filteredUserDrinks = filteredDrinks.filter(d => d.userId === currentUserId);
  const filteredLibraryDrinks = filteredDrinks.filter(d => !d.userId);

  const handleSelect = (drink: Drink) => {
    onSelect(drink);
    setQuery('');
  };

  const handleCreate = () => {
    if (!newDrink.name.trim()) return;
    onCreate({
      name: newDrink.name.trim(),
      type: newDrink.type,
      abv: newDrink.abv,
      defaultServingSize: newDrink.servingSize,
      emoji: newDrink.emoji,
    });
    setShowCreate(false);
    setNewDrink({ name: '', type: 'beer', abv: 5, servingSize: 33, emoji: 'Beer' });
  };

  const handleDelete = () => {
    if (drinkToDelete && onDeleteDrink) {
      onDeleteDrink(drinkToDelete.id);
      setDrinkToDelete(null);
    }
  };

  const handleTypeChange = (type: DrinkType) => {
    const defaults = DRINK_TYPES[type];
    setNewDrink(prev => ({
      ...prev,
      type,
      abv: defaults?.defaultAbv || 5,
      servingSize: type === 'wine' ? 15 : type === 'spirit' ? 4 : 33,
      emoji: defaults?.icon || 'CupSoda',
    }));
  };

  const renderDrinkItem = (drink: Drink, isUserDrink: boolean = false) => {
    const IconComponent = getDrinkIconComponent(drink.type);
    
    return (
      <div key={drink.id} onClick={() => handleSelect(drink)}
        className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors cursor-pointer rounded-xl border-b border-white/5 last:border-b-0">
        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
          <IconComponent className="w-6 h-6 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">{drink.name}</p>
            {drink.isGlobal && <Globe className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
            {isUserDrink && <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/20 text-secondary">Perso</span>}
          </div>
          <p className="text-xs text-muted-foreground">
            {DRINK_TYPES[drink.type]?.label} - {drink.abv}% - {drink.defaultServingSize} cl
            {(drink.usageCount || 0) > 0 && <span className="ml-1 text-secondary">- {drink.usageCount}x</span>}
          </p>
        </div>
        
        <div className="flex items-center gap-1 flex-shrink-0">
          {onToggleFavorite && (
            <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); onToggleFavorite(drink.id); }}
              className={cn("p-2 rounded-lg transition-all", drink.isFavorite ? "text-yellow-400 bg-yellow-400/10" : "text-muted-foreground hover:text-yellow-400 hover:bg-yellow-400/10")}
              title={drink.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}>
              <Star className={cn("w-5 h-5", drink.isFavorite && "fill-current")} />
            </button>
          )}
          {isUserDrink && onDeleteDrink && (
            <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); setDrinkToDelete(drink); }}
              className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
              title="Supprimer cette boisson">
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
      <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-secondary/10 text-secondary text-sm">
        <span>{timeInfo.icon}</span>
        <span>Suggestions pour le {timeInfo.label.toLowerCase()}</span>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une boissons..."
          className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white/5 border border-white/10 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50" />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {showCreate ? (
        <div className="p-4 rounded-2xl bg-card border border-secondary/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                <Beer className="w-5 h-5 text-secondary" />
              </div>
              <span className="font-medium">Nouvelle boissons</span>
            </div>
            <button onClick={() => setShowCreate(false)} className="p-1 rounded-full hover:bg-white/10">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <input type="text" value={newDrink.name} onChange={(e) => setNewDrink(p => ({ ...p, name: e.target.value }))}
            placeholder="Nom de la boissons"
            className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-secondary/50"
            autoFocus />

          <div className="flex gap-2 overflow-x-auto pb-1">
            {Object.entries(DRINK_TYPES).slice(0, 12).map(([key, data]) => (
              <button key={key} onClick={() => handleTypeChange(key as DrinkType)}
                className={cn(
                  "flex-shrink-0 px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-1 transition-all",
                  newDrink.type === key ? "bg-secondary/20 text-secondary" : "bg-white/5 text-muted-foreground hover:bg-white/10"
                )}>
                <span>{data.label}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Volume (cl)</label>
              <input type="number" value={newDrink.servingSize} onChange={(e) => setNewDrink(p => ({ ...p, servingSize: parseInt(e.target.value) || 0 }))}
                className="w-full h-11 px-3 rounded-xl bg-white/5 border border-white/10 text-center font-medium" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Degré (%)</label>
              <input type="number" value={newDrink.abv} onChange={(e) => setNewDrink(p => ({ ...p, abv: parseFloat(e.target.value) || 0 }))}
                className="w-full h-11 px-3 rounded-xl bg-white/5 border border-white/10 text-center font-medium" />
            </div>
          </div>

          <Button onClick={handleCreate} className="w-full rounded-xl bg-secondary hover:bg-secondary/80" disabled={!newDrink.name.trim()}>
            <Check className="w-4 h-4 mr-2" />Créer
          </Button>
        </div>
      ) : (
        <>
          {filteredUserDrinks.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 px-2 py-1">
                <span className="text-xs text-muted-foreground font-medium">Mes Boissons</span>
                <span className="text-xs text-secondary">({filteredUserDrinks.length})</span>
              </div>
              <div className="rounded-2xl bg-card border border-white/10 overflow-hidden">
                {filteredUserDrinks.slice(0, 6).map((drink) => renderDrinkItem(drink, true))}
              </div>
            </div>
          )}

          {filteredLibraryDrinks.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 px-2 py-1">
                <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">Bibliothèque</span>
              </div>
              <div className="rounded-2xl bg-card border border-white/10 overflow-hidden">
                {filteredLibraryDrinks.slice(0, 6).map((drink) => renderDrinkItem(drink, false))}
              </div>
            </div>
          )}

          {query.trim() && filteredDrinks.length === 0 && (
            <button onClick={() => { setNewDrink(p => ({ ...p, name: query })); setShowCreate(true); }}
              className="w-full flex items-center gap-3 p-4 rounded-2xl bg-secondary/10 border border-secondary/20 hover:bg-secondary/20">
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                <Plus className="w-6 h-6 text-secondary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-secondary">Créer "{query}"</p>
                <p className="text-xs text-muted-foreground">Nouvelle boissons personnalisée</p>
              </div>
              <Sparkles className="w-5 h-5 text-secondary" />
            </button>
          )}
        </>
      )}

      <Dialog open={!!drinkToDelete} onOpenChange={(open) => !open && setDrinkToDelete(null)}>
        <DialogContent className="mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Supprimer cette boissons ?
            </DialogTitle>
          </DialogHeader>
          {drinkToDelete && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <Beer className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{drinkToDelete.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {DRINK_TYPES[drinkToDelete.type]?.label} - {drinkToDelete.abv}% - {drinkToDelete.defaultServingSize} cl
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Cette action est irréversible. Les statistiques liées à cette boissons seront conservées.
              </p>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setDrinkToDelete(null)} className="flex-1 rounded-xl">Annuler</Button>
                <Button variant="destructive" onClick={handleDelete} className="flex-1 rounded-xl">
                  <Trash2 className="w-4 h-4 mr-2" />Supprimer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}