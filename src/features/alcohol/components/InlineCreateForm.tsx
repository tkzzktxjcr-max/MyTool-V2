"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DRINK_TYPES } from '../types';
import type { DrinkType } from '../types';

interface InlineCreateFormProps {
  initialName: string;
  onSubmit: (data: { name: string; type: DrinkType; abv: number; defaultServingSize: number; emoji: string }) => void;
  onCancel: () => void;
  error: string | null;
}

const EMOJI_OPTIONS = ['🍺', '🍻', '🍷', '🥃', '🍹', '🍾', '🥂', '🍸', '🧃', '🥤', '☕', '🍵'];

export default function InlineCreateForm({ initialName, onSubmit, onCancel, error }: InlineCreateFormProps) {
  const [name, setName] = useState(initialName);
  const [type, setType] = useState<DrinkType>('other');
  const [abv, setAbv] = useState(5);
  const [size, setSize] = useState(25);
  const [emoji, setEmoji] = useState('🍺');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || loading) return;
    
    setLoading(true);
    await onSubmit({ name: name.trim(), type, abv, defaultServingSize: size, emoji });
    setLoading(false);
  };

  const handleTypeChange = (newType: DrinkType) => {
    setType(newType);
    const defaults = DRINK_TYPES[newType];
    if (defaults) {
      setAbv(defaults.defaultAbv);
      setSize(newType === 'wine' ? 12 : newType === 'spirit' ? 4 : 33);
      setEmoji(defaults.icon);
    }
  };

  return (
    <div className="p-4 bg-card rounded-2xl border border-secondary/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{emoji}</span>
          <span className="font-medium">Nouvelle boisson</span>
        </div>
        <button onClick={onCancel} className="p-1 rounded-full hover:bg-white/10">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Input */}
        <div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom de la boisson"
            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-secondary/50"
            autoFocus
          />
        </div>

        {/* Quick Emoji Picker */}
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">Icône</label>
          <div className="flex gap-2 flex-wrap">
            {EMOJI_OPTIONS.map(e => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={cn(
                  "w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all",
                  emoji === e ? "bg-secondary/30 ring-2 ring-secondary" : "bg-white/5 hover:bg-white/10"
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Type Selector */}
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">Catégorie</label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {Object.entries(DRINK_TYPES).map(([key, data]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleTypeChange(key as DrinkType)}
                className={cn(
                  "flex-shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1",
                  type === key ? "bg-secondary/20 text-secondary" : "bg-white/5 text-muted-foreground hover:bg-white/10"
                )}
              >
                <span>{data.icon}</span>
                <span className="hidden sm:inline">{data.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Basic Fields */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Volume (cl)</label>
            <input
              type="number"
              value={size}
              onChange={(e) => setSize(parseInt(e.target.value) || 0)}
              className="w-full h-11 px-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-center font-medium"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Degré (%)</label>
            <input
              type="number"
              value={abv}
              onChange={(e) => setAbv(parseFloat(e.target.value) || 0)}
              step="0.1"
              className="w-full h-11 px-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-secondary/50 text-center font-medium"
            />
          </div>
        </div>

        {/* Units Preview */}
        <div className="text-center text-xs text-muted-foreground">
          ≈ {(size * abv / 100 * 0.789 / 10).toFixed(1)} unités par verre
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-12 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={!name.trim() || loading}
            className={cn(
              "flex-1 h-12 rounded-xl font-medium transition-all flex items-center justify-center gap-2",
              "bg-secondary text-white hover:bg-secondary/90",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4" />
                Créer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}