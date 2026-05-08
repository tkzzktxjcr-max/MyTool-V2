import { useState } from 'react';
import { Clock, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface TimeSelectorProps {
  onSelect: (timestamp: string) => void;
  defaultTime?: Date;
  maxPastHours?: number;
}

const TIME_PRESETS = [
  { label: 'A l\'instant', minutes: 0 },
  { label: 'Il y a 15 min', minutes: 15 },
  { label: 'Il y a 30 min', minutes: 30 },
  { label: 'Il y a 1h', minutes: 60 },
  { label: 'Il y a 2h', minutes: 120 },
  { label: 'Il y a 3h', minutes: 180 },
];

export default function TimeSelector({ 
  onSelect, 
  defaultTime,
  maxPastHours = 24 
}: TimeSelectorProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [selectedHours, setSelectedHours] = useState(0);
  const [selectedMinutes, setSelectedMinutes] = useState(0);

  const handlePresetSelect = (minutes: number) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - minutes);
    onSelect(now.toISOString());
  };

  const handleCustomTime = () => {
    const now = new Date();
    const totalMinutes = selectedHours * 60 + selectedMinutes;
    
    if (totalMinutes > 0) {
      now.setMinutes(now.getMinutes() - totalMinutes);
      onSelect(now.toISOString());
    }
  };

  const handleYesterdayEvening = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(21, 0, 0, 0);
    onSelect(yesterday.toISOString());
  };

  return (
    <div className="space-y-4">
      {/* Preset options */}
      <div className="grid grid-cols-2 gap-2">
        {TIME_PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => handlePresetSelect(preset.minutes)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium",
              "bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
            )}
          >
            <Clock className="w-4 h-4 text-muted-foreground" />
            {preset.label}
          </button>
        ))}
      </div>

      {/* Yesterday option */}
      <button
        onClick={handleYesterdayEvening}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium",
          "bg-accent/10 hover:bg-accent/20 border border-accent/20 transition-colors"
        )}
      >
        <Calendar className="w-4 h-4 text-accent" />
        Hier soir (~21:00)
      </button>

      {/* Custom time picker */}
      {showCustom ? (
        <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs text-muted-foreground text-center">Combien de temps avant ?</p>
          <div className="flex items-center justify-center gap-2">
            <div className="flex flex-col items-center">
              <input
                type="number"
                min="0"
                max="23"
                value={selectedHours}
                onChange={(e) => setSelectedHours(Math.min(23, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-16 h-12 text-center text-xl font-bold bg-white/10 rounded-xl border border-white/10"
              />
              <span className="text-xs text-muted-foreground mt-1">heures</span>
            </div>
            <span className="text-2xl text-muted-foreground">:</span>
            <div className="flex flex-col items-center">
              <input
                type="number"
                min="0"
                max="59"
                step="5"
                value={selectedMinutes}
                onChange={(e) => setSelectedMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-16 h-12 text-center text-xl font-bold bg-white/10 rounded-xl border border-white/10"
              />
              <span className="text-xs text-muted-foreground mt-1">minutes</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowCustom(false)} className="flex-1">
              Annuler
            </Button>
            <Button size="sm" onClick={handleCustomTime} className="flex-1 bg-secondary hover:bg-secondary/80">
              Confirmer
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowCustom(true)}
          className={cn(
            "w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          )}
        >
          Autre heure...
        </button>
      )}
    </div>
  );
}