"use client";

interface MoodSelectorProps {
  onSelect: (mood: string) => void;
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

export default function MoodSelector({ onSelect }: MoodSelectorProps) {
  return (
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
  );
}