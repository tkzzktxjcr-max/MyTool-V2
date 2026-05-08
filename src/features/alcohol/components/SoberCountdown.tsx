import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle, CheckCircle2, Car } from 'lucide-react';
import { format, formatDistanceToNow, differenceInSeconds } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface SoberCountdownProps {
  zeroTime: Date;
  safeToDriveTime: Date;
  currentBAC: number;
  legalLimit: number;
  isAboveLimit: boolean;
}

export default function SoberCountdown({
  zeroTime,
  safeToDriveTime,
  currentBAC,
  legalLimit,
  isAboveLimit,
}: SoberCountdownProps) {
  const [secondsToZero, setSecondsToZero] = useState(0);
  const [secondsToSafe, setSecondsToSafe] = useState(0);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
      setSecondsToZero(Math.max(0, differenceInSeconds(zeroTime, new Date())));
      setSecondsToSafe(Math.max(0, differenceInSeconds(safeToDriveTime, new Date())));
    }, 1000);

    return () => clearInterval(interval);
  }, [zeroTime, safeToDriveTime]);

  useEffect(() => {
    setSecondsToZero(Math.max(0, differenceInSeconds(zeroTime, now)));
    setSecondsToSafe(Math.max(0, differenceInSeconds(safeToDriveTime, now)));
  }, [zeroTime, safeToDriveTime, now]);

  const formatCountdown = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const isSafeToDrive = currentBAC <= legalLimit;
  const isCloseToSafe = secondsToSafe < 1800 && !isSafeToDrive; // Less than 30 min

  return (
    <div className={cn(
      "rounded-2xl p-5 text-center transition-all duration-500",
      isSafeToDrive && "bg-green-500/10 border border-green-500/20",
      isAboveLimit && !isSafeToDrive && "bg-red-500/10 border border-red-500/20",
      !isAboveLimit && !isSafeToDrive && "bg-yellow-500/10 border border-yellow-500/20"
    )}>
      {/* Status icon */}
      <div className="flex justify-center mb-3">
        <motion.div
          animate={isAboveLimit ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 2, repeat: isAboveLimit ? Infinity : 0 }}
        >
          {isSafeToDrive ? (
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          ) : isAboveLimit ? (
            <AlertTriangle className="w-8 h-8 text-red-500" />
          ) : (
            <Clock className="w-8 h-8 text-yellow-500" />
          )}
        </motion.div>
      </div>

      {/* Safe to drive countdown */}
      {isSafeToDrive ? (
        <div className="space-y-1">
          <p className="text-sm text-green-500 font-medium flex items-center justify-center gap-1.5">
            <Car className="w-4 h-4" />
            Aptes a conduire
          </p>
          <p className="text-xs text-muted-foreground">
            Alcoolemie sous la limite légale
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground mb-1">
            Retour a 0 (sans alcool)
          </p>
          <motion.div 
            key={formatCountdown(secondsToZero)}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-1"
          >
            {formatCountdown(secondsToZero)}
          </motion.div>
          
          {/* Safe to drive indicator */}
          <div className={cn(
            "mt-3 pt-3 border-t border-white/10",
            isCloseToSafe ? "text-green-400" : "text-muted-foreground"
          )}>
            <p className="text-xs">
              {isCloseToSafe ? (
                <span className="text-green-400 font-medium">
                  Bientôt aptes ! ({formatDistanceToNow(safeToDriveTime, { locale: fr, addSuffix: false })})
                </span>
              ) : (
                <>
                  <span className="font-medium">{formatCountdown(secondsToSafe)}</span>
                  <span className="text-muted-foreground"> avant d'être apte à conduire</span>
                </>
              )}
            </p>
          </div>

          {/* Warning message */}
          {isAboveLimit && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-xs text-red-400"
            >
              Au-dessus de la limite légale de {legalLimit} g/L
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}