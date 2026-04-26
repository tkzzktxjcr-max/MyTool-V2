"use client";

import { Sparkles, Star, Heart, Beer, Wine, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PremiumEmptyStateProps {
  emoji?: string;
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  className?: string;
}

// Map emoji strings to Lucide icon components
const EMOJI_TO_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  '📝': Star,
  '🌱': Sparkles,
  '🍷': Wine,
  '🍺': Beer,
  '🌅': Coffee,
  '✨': Sparkles,
};

export function PremiumEmptyState({ 
  emoji, 
  icon,
  title, 
  description, 
  action,
  className 
}: PremiumEmptyStateProps) {
  // Get the appropriate icon component
  const IconComponent = emoji ? EMOJI_TO_ICON[emoji] : null;
  
  return (
    <div className={cn("text-center py-6 px-4", className)}>
      {/* Icon */}
      <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-3">
        {icon || (IconComponent ? (
          <IconComponent className="w-7 h-7 text-secondary" />
        ) : (
          <Sparkles className="w-7 h-7 text-secondary" />
        ))}
      </div>
      
      {/* Title */}
      <h4 className="text-base font-semibold mb-1">{title}</h4>
      
      {/* Description */}
      <p className="text-sm text-muted-foreground max-w-[240px] mx-auto mb-4">
        {description}
      </p>
      
      {/* Action button */}
      {action && (
        <Button 
          onClick={action.onClick}
          variant={action.variant || 'secondary'}
          size="sm"
          className="rounded-xl"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

export default PremiumEmptyState;