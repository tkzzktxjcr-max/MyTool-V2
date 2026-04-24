"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X, ChevronRight, Sparkles, Clock, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Drink } from '../services/drinks.service';
import type { DrinkType } from '../types';
import { DRINK_TYPES } from '../types';

interface DrinkPickerProps {
  drinks: Drink[];
  onSelect: (drink: Drink) => void;
  onCreate: (data: { name: string; type: DrinkType; abv: number; defaultServingSize: number; emoji: string }) => Promise<Drink>;
}

const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export default function DrinkPicker({ drinks, onSelect, onCreate }: DrinkPickerProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<DrinkType>('other');
  const [abv, setAbv] = useState(5);
  const [size, setSize] = useState(25);
  const [emoji, setEmoji] = useState('🍺');
  const [success, setSuccess] = useState<Drink | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setName(query); }, [query]);

  const sortedDrinks = [...drinks].sort((a, b) => {
    if ((b.usageCount || 0) !== (a.usageCount || 0)) return (b.usageCount || 0) - (a.usageCount || 0);
    return a.name.localeCompare(b.name);
  });

  const filteredDrinks = query.trim()
    ? sortedDrinks.filter(drink => {
        const normalizedQuery = normalizeString(query);
        const normalizedName = normalizeString(drink.name);
        const normalizedType = normalizeString(DRINK_TYPES[drink.type]?.label || '');
        return normalizedName.includes(normalizedQuery) || normalizedType.includes(normalizedQuery) ||
               normalizedQuery.split(' ').some(word => normalizedName.includes(word) || normalizedType.includes(word));
      })
    : sortedDrinks;

  useEffect(() => { setSelectedIndex(0); }, [filteredDrinks.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isCreating) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredDrinks.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredDrinks.length > 0) handleSelect(filteredDrinks[selectedIndex]);
        else if (query.trim()) setIsCreating(true);
        break;
      case 'Escape':
        if (isCreating) setIsCreating(false);
        else setQuery('');
        break;
    }
  };

  const handleSelect = (drink: Drink) => {
    onSelect(drink);
    setQuery('');
    setSelectedIndex(0);
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setError(null);
    try {
      const newDrink = await onCreate({ name: name.trim(), type, abv, defaultServingSize: size, emoji });
      setSuccess(newDrink);
      onSelect(newDrink);
      setQuery('');
      setIsCreating(false);
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Impossible de créer la boissons.');
    }
  };

  const EMOJI_OPTIONS = ['🍺', '🍻', '🍷', '🥃', '🍹', '🍾', '🥂', '🍸', '🧃', '🥤'];

  return (
    <div className="w-full space-y-2">
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"><Search className="w-5 h-5" /></div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Recherche ta boissons…"
          className="w-full h-14 pl-12 pr-12 rounded-2xl bg-white/5 border border-white/10 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
          autoFocus
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-4 bg-card rounded-2xl border border-secondary/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2"><span className="text-xl">{emoji}</span><span className="font-medium">Nouvelle boissons</span></div>
              <button onClick={() => setIsCreating(false)} className="p-1 rounded-full hover:bg-white/10"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom de la boissons" className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-secondary/50" autoFocus />
              <div className="flex gap-2 flex-wrap">
                {EMOJI_OPTIONS.map(e => (
                  <button key={e} type="button" onClick={() => setEmoji(e)} className={cn("w-10 h-10 rounded-xl text-xl flex items-center justify-center", emoji === e ? "bg-secondary/30 ring-2 ring-secondary" : "bg-white/5 hover:bg-white/10")}>{e}</button>
                ))}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {Object.entries(DRINK_TYPES).map(([key, data]) => (
                  <button key={key} type="button" onClick={() => { setType(key as DrinkType); setAbv(data.defaultAbv); setSize(key === 'wine' ? 12 : key === 'spirit' ? 4 : 33); setEmoji(data.icon); }} className={cn("flex-shrink-0 px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-1", type === key ? "bg-secondary/20 text-secondary" : "bg-white/5 text-muted-foreground hover:bg-white/10")}>
                    <span>{data.icon}</span><span className="hidden sm:inline">{data.label}</span>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-muted-foreground mb-1 block">Volume (cl)</label><input type="number" value={size} onChange={(e) => setSize(parseInt(e.target.value) || 0)} className="w-full h-11 px-3 rounded-xl bg-white/5 border border-white/10 text-center font-medium" /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">Degré (%)</label><input type="number" value={abv} onChange={(e) => setAbv(parseFloat(e.target.value) || 0)} className="w-full h-11 px-3 rounded-xl bg-white/5 border border-white/10 text-center font-medium" /></div>
              </div>
              {error && <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm">{error}</div>}
              <div className="flex gap-2">
                <button onClick={() => setIsCreating(false)} className="flex-1 h-12 rounded-xl bg-white/5 hover:bg-white/10">Annuler</button>
                <button onClick={handleCreate} disabled={!name.trim()} className="flex-1 h-12 rounded-xl bg-secondary text-white hover:bg-secondary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />Créer
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isCreating && (
        <div className={cn("rounded-2xl bg-card border border-white/10 overflow-hidden", query.trim() && filteredDrinks.length > 0 && "max-h-80 overflow-y-auto")}>
          {query.trim() ? (
            filteredDrinks.length > 0 ? (
              filteredDrinks.map((drink, index) => (
                <button key={drink.id} onClick={() => handleSelect(drink)} className={cn("w-full flex items-center gap-3 p-4 text-left hover:bg-white/5", index === selectedIndex && "bg-secondary/10")}>
                  <span className="text-2xl">{drink.emoji}</span>
                  <div className="flex-1 min-w-0"><p className="font-medium truncate">{drink.name}</p><p className="text-xs text-muted-foreground">{drink.abv}% · {drink.defaultServingSize} cl</p></div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </button>
              ))
            ) : (
              <button onClick={() => setIsCreating(true)} className="w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/10">
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center"><Plus className="w-6 h-6 text-secondary" /></div>
                <div className="flex-1"><p className="font-medium text-secondary">Créer "{query}"</p><p className="text-xs text-muted-foreground">Ajouter une nouvelle boissons</p></div>
                <Sparkles className="w-5 h-5 text-secondary flex-shrink-0" />
              </button>
            )
          ) : (
            <div className="p-4">
              <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1"><Clock className="w-3 h-3" />Les plus utilisés</p>
              <div className="grid grid-cols-3 gap-2">
                {sortedDrinks.slice(0, 6).map((drink, index) => (
                  <button key={drink.id} onClick={() => handleSelect(drink)} className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-white/5">
                    <span className="text-2xl">{drink.emoji}</span>
                    <span className="text-xs font-medium truncate w-full text-center">{drink.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl bg-secondary text-white shadow-lg flex items-center gap-2">
            <Check className="w-5 h-5" /><span className="font-medium">{success.name} ajouté !</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}