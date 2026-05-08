import { motion } from 'framer-motion';
import { Clock, Navigation, Battery, Power, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, differenceInMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { LiveSession } from '../types';

interface LiveSessionPanelProps {
  session: LiveSession;
  onStop: () => void;
  batteryLevel?: number | null;
}

export default function LiveSessionPanel({ session, onStop, batteryLevel }: LiveSessionPanelProps) {
  const remainingMinutes = Math.max(0, differenceInMinutes(new Date(session.expiresAt), new Date()));
  const isUnlimited = session.durationMinutes < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl border p-4 space-y-3",
        session.safeReturnMode
          ? "bg-blue-500/10 border-blue-500/30"
          : "bg-secondary/10 border-secondary/20"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            session.safeReturnMode ? "bg-blue-500/20" : "bg-secondary/20"
          )}>
            <Navigation className={cn("w-5 h-5", session.safeReturnMode ? "text-blue-400" : "text-secondary")} />
          </div>
          <div>
            <p className="font-semibold text-sm">
              {session.safeReturnMode ? 'Retour sécurisé actif' : 'Partage de position actif'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isUnlimited
                ? 'Jusqu\'à désactivation'
                : `${remainingMinutes} min restantes`
              }
            </p>
          </div>
        </div>
        <button
          onClick={onStop}
          className="p-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
          title="Arrêter le partage"
        >
          <Power className="w-5 h-5" />
        </button>
      </div>

      {/* Details */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>Précision {session.accuracy === 'precise' ? 'haute' : 'approximative'}</span>
        </div>
        {batteryLevel !== null && batteryLevel !== undefined && (
          <div className="flex items-center gap-1.5">
            <Battery className={cn("w-3.5 h-3.5", batteryLevel <= 20 ? "text-yellow-400" : "")} />
            <span className={batteryLevel <= 20 ? "text-yellow-400" : ""}>{batteryLevel}%</span>
          </div>
        )}
        {session.safeReturnMode && (
          <div className="flex items-center gap-1.5 text-blue-400">
            <Shield className="w-3.5 h-3.5" />
            <span>Mode retour</span>
          </div>
        )}
      </div>

      {/* Progress bar for time */}
      {!isUnlimited && session.durationMinutes > 0 && (
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              remainingMinutes < 10 ? "bg-destructive" : "bg-secondary"
            )}
            style={{
              width: `${Math.max(0, Math.min(100, (remainingMinutes / session.durationMinutes) * 100))}%`,
            }}
          />
        </div>
      )}
    </motion.div>
  );
}