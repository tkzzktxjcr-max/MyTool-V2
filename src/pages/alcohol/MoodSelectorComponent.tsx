"use client";

import { motion } from 'framer-motion';

const MOOD_EMOJIS: Record<string, string> = {
  happy: '😊', relaxed: '😌', social: '🥂', celebrating: '🎉',
  stressed: '😰', sad: '😢', tired: '😴', neutral: '😐',
};

export default function MoodSelectorComponent({ onSelect }: { onSelect: (mood: string) => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-4 gap-2 p-2">
      {Object.entries(MOOD_EMOJIS).map(([mood, emoji]) => (
        <button key={mood} onClick={() => onSelect(mood)} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 transition-colors">
          <span className="text-2xl">{emoji}</span>
          <span className="text-xs text-muted-foreground capitalize">{mood}</span>
        </button>
      ))}
    </motion.div>
  );
}