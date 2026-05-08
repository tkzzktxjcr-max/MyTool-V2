import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Shield, Check, Navigation, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LiveAccuracy } from '../types';

interface LiveOnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onActivate: (accuracy: LiveAccuracy, durationMinutes: number) => void;
}

const DURATIONS = [
  { value: 60, label: '1 heure', description: 'Apéro, dîner' },
  { value: 240, label: '4 heures', description: 'Soirée' },
  { value: -1, label: 'Illimité', description: 'Jusqu\'à désactivation' },
];

export default function LiveOnboardingDialog({ open, onOpenChange, onActivate }: LiveOnboardingDialogProps) {
  const [step, setStep] = useState(0);
  const [accuracy, setAccuracy] = useState<LiveAccuracy>('approximate');
  const [duration, setDuration] = useState(240);

  const handleActivate = () => {
    onActivate(accuracy, duration);
    onOpenChange(false);
    setStep(0);
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep(0);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-4 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <MapPin className="w-5 h-5 text-secondary" />
            Live Circle
          </DialogTitle>
        </DialogHeader>

        {step === 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="p-4 rounded-2xl bg-secondary/10 border border-secondary/20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center mx-auto mb-3">
                <Navigation className="w-8 h-8 text-secondary" />
              </div>
              <p className="text-sm text-secondary">
                Partage ta position avec ton Circle le temps de la soirée. Tes proches pourront te suivre sur la carte et savoir que tu vas bien.
              </p>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                <Eye className="w-5 h-5 text-secondary flex-shrink-0" />
                <span>Tu choisis qui te voit et pendant combien de temps</span>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                <Shield className="w-5 h-5 text-secondary flex-shrink-0" />
                <span>Tes données ne sont pas stockées au-delà de la session</span>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                <EyeOff className="w-5 h-5 text-secondary flex-shrink-0" />
                <span>Tu peux couper le partage à tout moment</span>
              </div>
            </div>

            <Button onClick={() => setStep(1)} className="w-full h-12 rounded-xl bg-secondary hover:bg-secondary/80">
              C'est parti
            </Button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Durée du partage
              </label>
              <div className="grid gap-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDuration(d.value)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left",
                      duration === d.value
                        ? "border-secondary bg-secondary/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    )}
                  >
                    <div>
                      <p className={cn("font-medium text-sm", duration === d.value ? "text-secondary" : "")}>
                        {d.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{d.description}</p>
                    </div>
                    {duration === d.value && <Check className="w-5 h-5 text-secondary" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Précision GPS</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setAccuracy('approximate')}
                  className={cn(
                    "p-3 rounded-xl border-2 transition-all text-center",
                    accuracy === 'approximate'
                      ? "border-secondary bg-secondary/10"
                      : "border-white/10 bg-white/5"
                  )}
                >
                  <p className={cn("font-medium text-sm", accuracy === 'approximate' ? "text-secondary" : "")}>
                    Approximative
                  </p>
                  <p className="text-xs text-muted-foreground">±200m • Économie batterie</p>
                </button>
                <button
                  onClick={() => setAccuracy('precise')}
                  className={cn(
                    "p-3 rounded-xl border-2 transition-all text-center",
                    accuracy === 'precise'
                      ? "border-secondary bg-secondary/10"
                      : "border-white/10 bg-white/5"
                  )}
                >
                  <p className={cn("font-medium text-sm", accuracy === 'precise' ? "text-secondary" : "")}>
                    Précise
                  </p>
                  <p className="text-xs text-muted-foreground">±10m • Plus de batterie</p>
                </button>
              </div>
            </div>

            <Button onClick={handleActivate} className="w-full h-12 rounded-xl bg-secondary hover:bg-secondary/80 gap-2">
              <Check className="w-4 h-4" />
              Activer le Live Circle
            </Button>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}