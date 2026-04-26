"use client";

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { calculateUnits } from '@/features/alcohol/utils/units';

interface QuantitySelectorProps {
  quantity: number;
  onChange: (quantity: number) => void;
  maxQuantity?: number;
}

export default function QuantitySelector({ 
  quantity, 
  onChange, 
  maxQuantity = 10 
}: QuantitySelectorProps) {
  const handleDecrement = () => {
    if (quantity > 1) {
      onChange(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < maxQuantity) {
      onChange(quantity + 1);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleDecrement}
        disabled={quantity <= 1}
        className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center transition-all",
          "bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed"
        )}
      >
        <Minus className="w-5 h-5" />
      </motion.button>

      <div className="flex flex-col items-center min-w-[3rem]">
        <motion.span 
          key={quantity}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-3xl font-bold"
        >
          {quantity}
        </motion.span>
        <span className="text-xs text-muted-foreground">
          {quantity === 1 ? 'verre' : 'verres'}
        </span>
      </div>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleIncrement}
        disabled={quantity >= maxQuantity}
        className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center transition-all",
          "bg-secondary/20 hover:bg-secondary/30 text-secondary disabled:opacity-40 disabled:cursor-not-allowed"
        )}
      >
        <Plus className="w-5 h-5" />
      </motion.button>
    </div>
  );
}

/**
 * Calcule les unités d'alcool avec quantité
 * @deprecated Utiliser calculateUnitsWithQuantity depuis '@/features/alcohol/utils/units'
 */
export const calculateUnitsFromQuantity = (servingSize: number, abv: number, quantity: number): number => {
  const singleUnit = calculateUnits(servingSize, abv);
  return Math.round(singleUnit * quantity * 10) / 10;
};