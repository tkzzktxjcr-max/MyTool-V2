"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ConfettiAnimationProps {
  show: boolean;
  onComplete?: () => void;
  message?: string;
  emoji?: string;
}

const CONFETTI_COLORS = [
  'hsl(142, 71%, 45%)', // green
  'hsl(38, 92%, 50%)',  // amber
  'hsl(263, 70%, 58%)', // purple
  'hsl(199, 89%, 48%)', // blue
  'hsl(280, 85%, 65%)', // pink
  'hsl(32, 95%, 55%)',  // orange
];

const EMOJIS = ['🎉', '✨', '🌟', '💫', '🎊', '⭐'];

const generateConfetti = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 1,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    rotation: Math.random() * 360,
    size: 6 + Math.random() * 6,
    emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    isEmoji: Math.random() > 0.7,
  }));
};

export default function ConfettiAnimation({ 
  show, 
  onComplete,
  message = 'Excellent !',
  emoji = '🎉'
}: ConfettiAnimationProps) {
  const [confetti, setConfetti] = useState<any[]>([]);

  useEffect(() => {
    if (show) {
      setConfetti(generateConfetti(30));
      
      const timer = setTimeout(() => {
        setConfetti([]);
        onComplete?.();
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      setConfetti([]);
    }
  }, [show, onComplete]);

  if (!show && confetti.length === 0) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
        >
          {/* Confetti pieces */}
          {confetti.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{ 
                x: `${piece.x}%`, 
                y: -20,
                rotate: 0,
                opacity: 1,
                scale: 0,
              }}
              animate={{ 
                y: '100vh',
                rotate: piece.rotation + 720,
                opacity: [1, 1, 0],
                scale: [0, 1, 0.5],
              }}
              transition={{ 
                duration: piece.duration,
                delay: piece.delay,
                ease: 'easeOut',
              }}
              className="absolute"
              style={{ left: `${piece.x}%` }}
            >
              {piece.isEmoji ? (
                <span className="text-2xl">{piece.emoji}</span>
              ) : (
                <div
                  className="rounded-full"
                  style={{
                    width: piece.size,
                    height: piece.size,
                    backgroundColor: piece.color,
                  }}
                />
              )}
            </motion.div>
          ))}

          {/* Celebration message */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="relative z-10 text-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [-5, 5, -5, 5, 0],
              }}
              transition={{ 
                duration: 0.6,
                repeat: 2,
              }}
              className="text-6xl mb-4"
            >
              {emoji}
            </motion.div>
            <div className="px-6 py-3 rounded-2xl bg-secondary/20 backdrop-blur-sm border border-secondary/30">
              <p className="text-xl font-bold text-secondary">{message}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}