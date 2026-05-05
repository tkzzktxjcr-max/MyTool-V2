"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Check, RotateCcw, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAlcoholOnboarding } from './useAlcoholOnboarding';
import { GoalStep } from './GoalStep';
import { ProfileStep } from './ProfileStep';
import { FavoritesStep } from './FavoritesStep';
import { toast } from 'sonner';

interface AlcoholOnboardingWizardProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export function AlcoholOnboardingWizard({ 
  onComplete, 
  onSkip 
}: AlcoholOnboardingWizardProps) {
  const {
    profile,
    step,
    hasCompleted,
    isLoading,
    drinks,
    setGoal,
    setSex,
    setWeight,
    setBudget,
    toggleFavoriteDrink,
    nextStep,
    prevStep,
    complete,
    reset,
    canProceed,
  } = useAlcoholOnboarding();

  const [isOpen, setIsOpen] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (hasCompleted) {
      setIsOpen(false);
      onComplete?.();
    }
  }, [hasCompleted, onComplete]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-12 w-12 rounded-full border-4 border-secondary border-t-transparent"
          />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (hasCompleted) {
    return null;
  }

  const handleClose = () => {
    setIsOpen(false);
    onSkip?.();
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    
    try {
      await complete();
      setIsOpen(false);
      toast.success('Configuration terminée ! 🎉', {
        description: 'Tes préférences ont été sauvegardées.',
      });
      onComplete?.();
    } catch {
      toast.error('Erreur', {
        description: 'Impossible de sauvegarder. Réessaie plus tard.',
        icon: <AlertTriangle className="w-5 h-5" />,
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const handleNext = () => { setDirection(1); nextStep(); };
  const handlePrev = () => { setDirection(-1); prevStep(); };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto p-0 rounded-2xl">
        <div className="relative p-6">
          <div className="absolute top-4 right-4">
            <button onClick={handleClose} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  i === step ? "w-6 bg-secondary" : i < step ? "bg-secondary/50" : "bg-white/20"
                )} />
              ))}
            </div>
          </div>

          <div className="min-h-[400px]">
            <AnimatePresence mode="wait" custom={direction}>
              {step === 0 && (
                <motion.div key="step-0" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                  <GoalStep 
                    selectedGoal={profile.goal} 
                    onSelectGoal={setGoal} 
                    budget={profile.budget}
                    onBudgetChange={setBudget}
                  />
                </motion.div>
              )}
              {step === 1 && (
                <motion.div key="step-1" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                  <ProfileStep sex={profile.sex} weight={profile.weight} onSexChange={setSex} onWeightChange={setWeight} />
                </motion.div>
              )}
              {step === 2 && (
                <motion.div key="step-2" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                  <FavoritesStep drinks={drinks} selectedDrinks={profile.favoriteDrinks} onToggleDrink={toggleFavoriteDrink} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            {step > 0 ? (
              <Button variant="ghost" onClick={handlePrev} className="gap-2">
                <ChevronLeft className="w-4 h-4" /> Précédent
              </Button>
            ) : (
              <Button variant="ghost" onClick={handleClose} className="text-muted-foreground">Plus tard</Button>
            )}
            <span className="text-sm text-muted-foreground">{step + 1} / 3</span>
            {step < 2 ? (
              <Button onClick={handleNext} disabled={!canProceed()} className="gap-2 bg-secondary hover:bg-secondary/80">
                Suivant <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={!canProceed() || isCompleting} loading={isCompleting} className="gap-2 bg-secondary hover:bg-secondary/80">
                <Check className="w-4 h-4" /> Terminer
              </Button>
            )}
          </div>

          {process.env.NODE_ENV === 'development' && (
            <button onClick={reset} className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}