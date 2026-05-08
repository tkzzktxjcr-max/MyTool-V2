import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Home, Bike, Car, Bus, MapPin, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { TransportMode } from '../types';

interface SafeReturnSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: (transportMode: TransportMode) => void;
}

const TRANSPORT_MODES: { id: TransportMode; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { id: 'walk', icon: Home, label: 'À pied' },
  { id: 'bike', icon: Bike, label: 'Vélo' },
  { id: 'car', icon: Car, label: 'Voiture' },
  { id: 'transit', icon: Bus, label: 'Transport' },
];

export default function SafeReturnSheet({ open, onOpenChange, onStart }: SafeReturnSheetProps) {
  const [selectedMode, setSelectedMode] = useState<TransportMode>('walk');

  const handleStart = () => {
    onStart(selectedMode);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader>
          <SheetTitle className="text-center flex items-center justify-center gap-2">
            <MapPin className="w-5 h-5 text-blue-400" />
            Je rentre
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm text-blue-400 text-center">
              Active le mode retour sécurisé pour que ton Circle suive ton trajet et soit alerté en cas d'anomalie.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Moyen de transport</label>
            <div className="grid grid-cols-2 gap-2">
              {TRANSPORT_MODES.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                      selectedMode === mode.id
                        ? "border-blue-400 bg-blue-500/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      selectedMode === mode.id ? "bg-blue-500/20" : "bg-white/10"
                    )}>
                      <Icon className={cn("w-5 h-5", selectedMode === mode.id ? "text-blue-400" : "text-muted-foreground")} />
                    </div>
                    <span className={cn(
                      "font-medium text-sm",
                      selectedMode === mode.id ? "text-blue-400" : ""
                    )}>
                      {mode.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            onClick={handleStart}
            className="w-full h-14 rounded-2xl bg-blue-500 hover:bg-blue-500/80 gap-2 text-base"
          >
            <Check className="w-5 h-5" />
            Démarrer le retour sécurisé
          </Button>

          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full rounded-xl"
          >
            <X className="w-4 h-4 mr-2" />
            Annuler
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}