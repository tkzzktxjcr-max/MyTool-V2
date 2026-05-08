import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  onClick: () => void;
  expanded?: boolean;
  onExpand?: () => void;
}

export default function FloatingActionButton({ 
  onClick, 
  expanded = false, 
  onExpand 
}: FloatingActionButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <div className="fixed bottom-24 right-5 z-40 flex flex-col items-end gap-3">
      {/* Expand button */}
      <AnimatePresence>
        {expanded && onExpand && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={onExpand}
            className="w-12 h-12 rounded-full bg-card border border-white/20 flex items-center justify-center shadow-lg"
          >
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onTapStart={() => setIsPressed(true)}
        onTap={() => {
          setIsPressed(false);
          onClick();
        }}
        onTapCancel={() => setIsPressed(false)}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-lg",
          "bg-secondary hover:bg-secondary/90 text-white",
          "transition-all duration-200",
          isPressed && "scale-95 shadow-md"
        )}
        style={{
          boxShadow: '0 4px 20px -5px hsl(142 71% 45% / 0.5)',
        }}
      >
        <motion.div
          animate={{ rotate: expanded ? 45 : 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <Plus className="w-6 h-6" />
        </motion.div>
      </motion.button>
    </div>
  );
}