import { Smile, Coffee, Users, PartyPopper, AlertCircle, Frown, Moon, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MoodSelectorProps {
  onSelect: (mood: string) => void;
  quantity?: number;
  totalUnits?: number;
}

const MOODS = [
  { id: 'happy', icon: Smile, label: 'Heureux' },
  { id: 'relaxed', icon: Coffee, label: 'Détendu' },
  { id: 'social', icon: Users, label: 'Social' },
  { id: 'celebrating', icon: PartyPopper, label: 'Fête' },
  { id: 'stressed', icon: AlertCircle, label: 'Stress' },
  { id: 'sad', icon: Frown, label: 'Triste' },
  { id: 'tired', icon: Moon, label: 'Fatigué' },
  { id: 'neutral', icon: Circle, label: 'Neutre' },
];

export default function MoodSelector({ onSelect, quantity = 1, totalUnits }: MoodSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground text-center">Comment te sens-tu ?</p>
      
      <div className="grid grid-cols-4 gap-2">
        {MOODS.map((mood) => {
          const IconComponent = mood.icon;
          return (
            <button
              key={mood.id}
              onClick={() => onSelect(mood.id)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-white/10 transition-all active:scale-95"
            >
              <IconComponent className="w-6 h-6 text-muted-foreground hover:text-secondary transition-colors" />
              <span className="text-xs text-muted-foreground">{mood.label}</span>
            </button>
          );
        })}
      </div>
      
      {/* Skip mood option */}
      <button
        onClick={() => onSelect('none')}
        className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Sans émotion
      </button>
    </div>
  );
}