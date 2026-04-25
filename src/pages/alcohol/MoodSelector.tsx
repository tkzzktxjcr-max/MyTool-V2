"use client";

import { cn } from '@/lib/utils';

interface MoodSelectorProps {
  onSelect: (mood: string) => void;
  quantity?: number;
  totalUnits?: number;
}

const MOODS = [
  { id: 'happy', emoji: '😊', label: 'Heureux' },
  { id: 'relaxed', emoji: '😌', label: 'Detendu' },
  { id: 'social', emoji: '🥂', label: 'Social' },
  { id: 'celebrating', emoji: '🎉', label: 'Fete' },
  { id: 'stressed', emoji: '😰', label: 'Stress' },
  { id: 'sad', emoji: '😢', label: 'Triste' },
  { id: 'tired', emoji: '😴', label: 'Fatigue' },
  { id: 'neutral', emoji: '😐', label: 'Neutre' },
];

export default function MoodSelector({ onSelect, quantity = 1, totalUnits }: MoodSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2">
        {MOODS.map((mood) => (
          <button
            key={mood.id}
            onClick={() => onSelect(mood.id)}
            className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-white/10 transition-colors"
          >
            <span className="text-2xl">{mood.emoji}</span>
            <span className="text-xs text-muted-foreground">{mood.label}</span>
          </button>
        ))}
      </div>
      
      {/* Skip mood option */}
      <button
        onClick={() => onSelect('none')}
        className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Sans emotion
      </button>
    </div>
  );
}