"use client";

import { motion } from 'framer-motion';
import { Scale, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SexType } from './useAlcoholOnboarding';

interface ProfileStepProps {
  sex: SexType;
  weight: number;
  onSexChange: (sex: SexType) => void;
  onWeightChange: (weight: number) => void;
}

export function ProfileStep({ 
  sex, 
  weight, 
  onSexChange, 
  onWeightChange 
}: ProfileStepProps) {
  const handleWeightChange = (value: string) => {
    const num = parseInt(value) || 0;
    if (num >= 30 && num <= 250) {
      onWeightChange(num);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="text-5xl mb-3">👤</div>
        <h2 className="text-xl font-bold">Votre profil</h2>
        <p className="text-sm text-muted-foreground">
          Pour des calculs plus précis de votre taux d'alcoolémie
        </p>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium flex items-center gap-2">
          <User className="w-4 h-4" />
          Sexe
        </label>
        
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onSexChange('male')}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
              sex === 'male'
                ? "border-secondary bg-secondary/10"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            )}
          >
            <span className="text-3xl">👨</span>
            <span className={cn(
              "font-medium text-sm",
              sex === 'male' ? "text-secondary" : ""
            )}>
              Homme
            </span>
            <span className="text-xs text-muted-foreground">R = 0.68</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onSexChange('female')}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
              sex === 'female'
                ? "border-secondary bg-secondary/10"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            )}
          >
            <span className="text-3xl">👩</span>
            <span className={cn(
              "font-medium text-sm",
              sex === 'female' ? "text-secondary" : ""
            )}>
              Femme
            </span>
            <span className="text-xs text-muted-foreground">R = 0.55</span>
          </motion.button>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium flex items-center gap-2">
          <Scale className="w-4 h-4" />
          Poids (kg)
        </label>
        
        <div className="relative">
          <input
            type="number"
            min="30"
            max="250"
            value={weight || ''}
            onChange={(e) => handleWeightChange(e.target.value)}
            placeholder="70"
            className={cn(
              "w-full h-16 px-6 pr-16 rounded-2xl bg-white/5 border-2 text-center text-2xl font-bold",
              "focus:outline-none focus:border-secondary transition-colors",
              weight > 0 && weight < 300 ? "border-white/20" : "border-white/10"
            )}
          />
          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">
            kg
          </span>
        </div>

        <div className="flex justify-center gap-2">
          {[50, 70, 90].map(w => (
            <button
              key={w}
              onClick={() => onWeightChange(w)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                weight === w
                  ? "bg-secondary text-white"
                  : "bg-white/10 text-muted-foreground hover:bg-white/20"
              )}
            >
              {w}kg
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20">
        <p className="text-xs text-muted-foreground text-center">
          💡 Le poids et le sexe influencent le calcul du taux d'alcoolémie selon la formule de Widmark
        </p>
      </div>
    </div>
  );
}