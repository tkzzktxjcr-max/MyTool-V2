"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X, ChevronRight, Sparkles, Clock, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Drink } from '../services/drinks.service';
import type { DrinkType } from '../types';
import { DRINK_TYPES } from '../types';

interface DrinkSearchProps {
  drinks: Drink[];
  recentDrinks?: Drink[];
  onSelect: (drink: Drink) => void;
  onCreate: (data: { name: string; type: DrinkType; abv: number; defaultServingSize: number; emoji: string }) => Promise<Drink>;
  className?: string;
}

type SearchState = 'idle' | 'searching' | 'creating' | 'success' | 'error';

const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const fuzzyMatch = (text: string, query: string): boolean => {
  const normalizedText = normalizeString(text);
  const normalizedQuery = normalizeString(query);
  
  if (normalizedText.includes(normalizedQuery)) return true;
  if (normalizedQuery.length >= 2) {
    return normalizedQuery.split(' ').every(word => normalizedText.includes(word));
  }
  return false;
};

const scoreDrink = (drink: Drink, query: string): number => {
  const normalizedQuery = normalizeString(query);
  const normalizedName = normalizeString(drink.name);
  
  let score = 0;
  if (normalizedName === normalizedQuery) score += 100;
  else if (normalizedName.startsWith(normalizedQuery)) score += 80;
  else if (normalizedName.includes(normalizedQuery)) score += 60;
  else if (normalizedQuery.split(' ').some(word => normalizedName.includes(word))) score += 40;
  else return 0;
  
  score += Math.min(drink.usageCount * 2, 20);
  return score;
};

export default function DrinkSearch({ drinks, recentDrinks = [], onSelect, onCreate, className }: DrinkSearchProps) {
  const [query, setQuery] = useState('');
  const [state, setState] = useState<SearchState>('idle');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [createdDrink, setCreatedDrink] = useState<Drink | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<DrinkType>('other');
  const [abv, setAbv] = useState(5);
  const [size, setSize] = useState(25);
  const [emoji, setEmoji] = useState('🍺');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setName(query); }, [query]);

  const filteredDrinks = useMemo(() => {
    if (!query.trim()) {
      return [...drinks].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
    }
    
    const scored = drinks
      .filter(drink => fuzzyMatch(drink.name, query) || fuzzyMatch(DRINK_TYPES[drink.type]?.label || '', query))
      .map(drink => ({ drink, score: scoreDrink(drink, query) }))
      .sort((a, b) => b.score - a.score);
    
    return scored.map(s => s.drink);
  }, [drinks, query]);

  useEffect(() => { setSelectedIndex(0); }, [filteredDrinks.length]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const maxIndex = filteredDrinks.length - 1;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, maxIndex));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredDrinks.length > 0 && selectedIndex < filteredDrinks.length) {
          onSelect(filteredDrinks[selectedIndex]);
        } else if (query.trim().length >= 1) {
          setIsCreating(true);
        }
        break;
      case 'Escape':
        if (isCreating) {
          setIsCreating(false);
        } else {
          setQuery('');
        }
        break;
    }
  }, [filteredDrinks, selectedIndex, query, isCreating, onSelect]);

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
      setCreatedDrink(newDrink);
      setState('success');
      onSelect(newDrink);
      setQuery('');
      setIsCreating(false);
      setTimeout(() => { setState('idle'); setCreatedDrink(null); }, 1500);
    } catch (err) {
      setError('Impossible de créer la boisson.');
      setState('error');
    }
  };

  const EMOJI_OPTIONS = ['🍺', '🍻', '🍷', '🥃', '🍹', '🍾', '🥂', '🍸', '🧃', '🥤'];

  return (
    <div ref={containerRef} className={cn("w-full", className)}>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Search className="w-5 h-5" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setState(e.target.value ? 'searching' : 'idle'); }}
          onKeyDown={handleKeyDown}
          placeholder="Recherche ta boissons…"
          className={cn(
            "w-full h-14 pl-12 pr-12 rounded-2xl bg-white/5 border border-white/10",
            "text-base placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-secondary/50"
          )}
        />
        {query && (
          <button onClick={() => { setQuery(''); inputRef.current?.focus(); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isCreating ? (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-2 p-4 bg-card rounded-2xl border border-secondary/30">
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
        ) : query.trim() ? (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-2 rounded-2xl bg-card border border-white/10 overflow-hidden">
            {filteredDrinks.map((drink, index) => (
              <button key={drink.id} onClick={() => handleSelect(drink)} className={cn("w-full flex items-center gap-3 p-4 text-left hover:bg-white/5", index === selectedIndex && "bg-secondary/10")}>
                <span className="text-2xl">{drink.emoji}</span>
                <div className="flex-1 min-w-0"><p className="font-medium truncate">{drink.name}</p><p className="text-xs text-muted-foreground">{DRINK_TYPES[drink.type]?.label} · {drink.abv}% · {drink.defaultServingSize} cl</p></div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
            {filteredDrinks.length === 0 && (
              <button onClick={() => setIsCreating(true)} className="w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/10">
                <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center"><Plus className="w-5 h-5 text-secondary" /></div>
                <div className="flex-1"><p className="font-medium text-secondary">Créer "{query}"</p><p className="text-xs text-muted-foreground">Nouvelle boissons personnalisée</p></div>
                <Sparkles className="w-4 h-4 text-secondary flex-shrink-0" />
              </button>
            )}
          </motion.div>
        ) : recentDrinks.length > 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Clock className="w-3 h-3" />Récents</p>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
              {recentDrinks.slice(0, 5).map(drink => (
                <button key={drink.id} onClick={() => handleSelect(drink)} className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-full bg-secondary/20 text-secondary">{drink.emoji}<span className="text-sm font-medium whitespace-nowrap">{drink.name}</span></button>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {state === 'success' && createdDrink && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-2xl bg-secondary text-white shadow-lg flex items-center gap-2">
            <Check className="w-5 h-5" /><span>{createdDrink.name} ajouté !</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}