"use client";

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuantitySelectorProps {
  quantity: number;
  onChange: (quantity: number) => void;
  maxQuantity?: number;
}

const calculateUnits = (servingSize: number, abv: number, quantity: number): number => {
  return ((servingSize * abv / 100 * 0.789) / 10) * quantity;
};

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
      <button
        onClick={handleDecrement}
        disabled={quantity <= 1}
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
          "bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed"
        )}
      >
        <Minus className="w-4 h-4" />
      </button>

      <div className="flex flex-col items-center min-w-[3rem]">
        <span className="text-2xl font-bold">{quantity}</span>
        <span className="text-xs text-muted-foreground">
          {quantity === 1 ? 'verre' : 'verres'}
        </span>
      </div>

      <button
        onClick={handleIncrement}
        disabled={quantity >= maxQuantity}
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
          "bg-secondary/20 hover:bg-secondary/30 text-secondary disabled:opacity-40 disabled:cursor-not-allowed"
        )}
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}

export { calculateUnits };