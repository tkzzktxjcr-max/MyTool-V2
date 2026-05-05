"use client";

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Shield, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface EmergencyModeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberIds: string[];
  onActivate: (duration: number, memberIds: string[]) => Promise<void>;
}

const DURATIONS = [
  { value: 2, label: '2 heures', description: 'Apéro, dîner' },
  { value: 4, label: '4 heures', description: 'Soirée' },
  { value: 8, label: '8 heures', description: 'Grande soirée' },
  { value: 12, label: '12 heures', description: "Jusqu'à désactivation" },
];

export default function EmergencyModeSheet({
  open,
  onOpenChange,
  memberIds,
  onActivate,
}: EmergencyModeSheetProps) {
  const [selectedDuration, setSelectedDuration] = useState(4);
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    setLoading(true);
    try {
      await onActivate(selectedDuration, memberIds);
      toast.success('Mode urgence activé', {
        description: `Tes proches seront alertés pendant ${selectedDuration}h`,
      });
      onOpenChange(false);
    } catch {
      toast.error('Erreur lors de l\'activation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Mode urgence
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">
              En mode urgence, tes proches reçoivent automatiquement tes alertes et ta position si tu dépasses un seuil critique.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Durée
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setSelectedDuration(d.value)}
                  className={cn(
                    "p-3 rounded-xl border-2 text-left transition-all",
                    selectedDuration === d.value
                      ? "border-destructive bg-destructive/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  )}
                >
                  <p className={cn(
                    "font-semibold text-sm",
                    selectedDuration === d.value ? "text-destructive" : ""
                  )}>
                    {d.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{d.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {memberIds.length} proche{memberIds.length > 1 ? 's' : ''} seront notifié{memberIds.length > 1 ? 's' : ''}
            </span>
          </div>

          <Button
            onClick={handleActivate}
            disabled={loading || memberIds.length === 0}
            loading={loading}
            className="w-full h-12 rounded-xl bg-destructive hover:bg-destructive/80"
          >
            <Shield className="w-4 h-4 mr-2" />
            Activer le mode urgence
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}