"use client";

import { useState } from 'react';
import { Search, Plus, X, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Drink } from '@/features/alcohol/services/drinks.service';
import type { DrinkType } from '@/features/alcohol/types';
import { DRINK_TYPES } from '@/features/alcohol/types';

interface DrinkPickerProps {
  drinks: Drink[];
  onSelect: (drink: Drink) => void;
  onCreate: (data: { name: string; type: DrinkType; abv: number; defaultServingSize: number; emoji: string }) => void;
}

const EMOJI_OPTIONS = ['🍺', '🍻', '🍷', '🥃', '🍹', '🍾', '🥂', '🍸', '🧃', '🥤'];

export default function DrinkPicker({ drinks, onSelect, onCreate }: DrinkPickerProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [newDrink, setNewDrink] = useState({
    name: '',
    type: 'beer' as DrinkType,
    abv: 5,
    servingSize: 33,
    emoji: '🍺',
  });

  const filteredDrinks = query.trim()
    ? drinks.filter(d => 
        d.name.toLowerCase().includes(query.toLowerCase()) ||
        DRINK_TYPES[d.type]?.label.toLowerCase().includes(query.toLowerCase())
      )
    : drinks.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));

  const handleSelect = (drink: Drink) => {
    onSelect(drink);
    setQuery('');
    setSelectedIndex(0);
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
    setNewDrink({ name: '', type: 'beer', abv: 5, servingSize: 33, emoji: '🍺' });
  };

  const handleTypeChange = (type: DrinkType) => {
    const defaults = DRINK_TYPES[type];
    setNewDrink(prev => ({
      ...prev,
      type,
      abv: defaults?.defaultAbv || 5,
      servingSize: type === 'wine' ? 15 : type === 'spirit' ? 4 : 33,
      emoji: defaults?.icon || '🍺',
    }));
  };

  return (
    <div className="space-y-2">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
          placeholder="Recherche ta boisson..."
          className="w-full h-14 pl-12 pr-12 rounded-2xl bg-white/5 border border-white/10 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
        />
        {query && (
          <button 
            onClick={() => setQuery('')} 
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Results or create */}
      {showCreate ? (
        <div className="p-4 rounded-2xl bg-card border border-secondary/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{newDrink.emoji}</span>
              <span className="font-medium">Nouvelle boisson</span>
            </div>
            <button onClick={() => setShowCreate(false)} className="p-1 rounded-full hover:bg-white/10">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <input
            type="text"
            value={newDrink.name}
            onChange={(e) => setNewDrink(p => ({ ...p, name: e.target.value }))}
            placeholder="Nom de la boisson"
            className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-secondary/50"
            autoFocus
          />

          {/* Emoji picker */}
          <div className="flex flex-wrap gap-2">
            {EMOJI_OPTIONS.map(e => (
              <button
                key={e}
                onClick={() => setNewDrink(p => ({ ...p, emoji: e }))}
                className={cn(
                  "w-10 h-10 rounded-xl text-xl flex items-center justify-center",
                  newDrink.emoji === e ? "bg-secondary/30 ring-2 ring-secondary" : "bg-white/10 hover:bg-white/20"
                )}
              >
                {e}
              </button>
            ))}
          </div>

          {/* Type selector */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {Object.entries(DRINK_TYPES).slice(0, 12).map(([key, data]) => (
              <button
                key={key}
                onClick={() => handleTypeChange(key as DrinkType)}
                className={cn(
                  "flex-shrink-0 px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-1",
                  newDrink.type === key ? "bg-secondary/20 text-secondary" : "bg-white/5 text-muted-foreground hover:bg-white/10"
                )}
              >
                <span>{data.icon}</span>
                <span className="hidden sm:inline">{data.label}</span>
              </button>
            ))}
          </div>

          {/* Size and ABV */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Volume (cl)</label>
              <input
                type="number"
                value={newDrink.servingSize}
                onChange={(e) => setNewDrink(p => ({ ...p, servingSize: parseInt(e.target.value) || 0 }))}
                className="w-full h-11 px-3 rounded-xl bg-white/5 border border-white/10 text-center font-medium"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Degre (%)</label>
              <input
                type="number"
                value={newDrink.abv}
                onChange={(e) => setNewDrink(p => ({ ...p, abv: parseFloat(e.target.value) || 0 }))}
                className="w-full h-11 px-3 rounded-xl bg-white/5 border border-white/10 text-center font-medium"
              />
            </div>
          </div>

          <Button onClick={handleCreate} className="w-full" disabled={!newDrink.name.trim()}>
            Creer
          </Button>
        </div>
      ) : (
        <>
          {/* Drink list */}
          {filteredDrinks.length > 0 && (
            <div className="rounded-2xl bg-card border border-white/10 overflow-hidden">
              {filteredDrinks.slice(0, 8).map((drink, index) => (
                <button
                  key={drink.id}
                  onClick={() => handleSelect(drink)}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 text-left hover:bg-white/5",
                    index === selectedIndex && "bg-secondary/10"
                  )}
                >
                  <span className="text-2xl">{drink.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{drink.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {DRINK_TYPES[drink.type]?.label} - {drink.abv}% - {drink.defaultServingSize} cl
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Create option */}
          {query.trim() && filteredDrinks.length === 0 && (
            <button
              onClick={() => {
                setNewDrink(p => ({ ...p, name: query }));
                setShowCreate(true);
              }}
              className="w-full flex items-center gap-3 p-4 rounded-2xl bg-secondary/10 border border-secondary/20 hover:bg-secondary/20"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                <Plus className="w-6 h-6 text-secondary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-secondary">Creer "{query}"</p>
                <p className="text-xs text-muted-foreground">Nouvelle boisson personnalisee</p>
              </div>
              <Sparkles className="w-5 h-5 text-secondary" />
            </button>
          )}
        </>
      )}
    </div>
  );
}