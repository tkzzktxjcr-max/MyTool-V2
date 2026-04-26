"use client";

import { motion } from 'framer-motion';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface PremiumEmptyStateProps {
  emoji: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'secondary' | 'outline';
  };
  className?: string;
}

export function PremiumEmptyState({
  emoji,
  title,
  description,
  action,
  className,
}: PremiumEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col items-center justify-center py-8 px-4 text-center",
        className
      )}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 15, stiffness: 200 }}
        className="mb-4"
      >
        <span className="text-5xl">{emoji}</span>
      </motion.div>
      
      <h3 className="text-lg font-semibold text-foreground mb-1">
        {title}
      </h3>
      
      <p className="text-sm text-muted-foreground max-w-[260px] mb-4">
        {description}
      </p>
      
      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || 'default'}
          className={cn(
            "rounded-xl",
            action.variant === 'secondary' && "bg-secondary/20 text-secondary hover:bg-secondary/30 border-0",
            action.variant === 'outline' && "border-white/10 bg-white/5 hover:bg-white/10"
          )}
        >
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}
