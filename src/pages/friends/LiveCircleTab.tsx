import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Radio, MapPin, Shield } from "lucide-react";
import type { LiveSession } from "@/features/circle/types";
import LiveMap from "@/features/circle/components/LiveMap";
import LiveSessionPanel from "@/features/circle/components/LiveSessionPanel";
import LiveStatusBar from "@/features/circle/components/LiveStatusBar";

interface LiveCircleTabProps {
  isLive: boolean;
  liveSession: LiveSession | null;
  liveSessions: LiveSession[];
  batteryLevel?: number | null;
  handleStopLive: () => Promise<void>;
  handleStatusChange: (status: string) => Promise<void>;
  stopSafeReturn: () => Promise<void>;
  startSafeReturn: (mode: string) => Promise<void>;
  setShowSafeReturn: (v: boolean) => void;
  setShowLiveOnboarding: (v: boolean) => void;
  liveMemberCount: number;
}

export default function LiveCircleTab(props: LiveCircleTabProps) {
  const {
    isLive, liveSession, liveSessions, batteryLevel,
    handleStopLive, handleStatusChange, stopSafeReturn, startSafeReturn,
    setShowSafeReturn, setShowLiveOnboarding, liveMemberCount,
  } = props;

  return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5 relative z-0"
        >
          {/* Live Map - isolated stacking context */}
          <div className="relative isolate">
            <LiveMap
              sessions={liveSessions}
              mySession={liveSession}
            />
          </div>

          {/* My Live Session Panel */}
          {isLive && liveSession && (
            <div className="space-y-4">
              <LiveSessionPanel
                session={liveSession}
                onStop={handleStopLive}
                batteryLevel={batteryLevel}
              />

              <LiveStatusBar
                currentStatus={liveSession.status}
                onStatusChange={handleStatusChange}
              />

              {/* Safe Return Button */}
              {!liveSession.safeReturnMode ? (
                <Button
                  variant="outline"
                  onClick={() => setShowSafeReturn(true)}
                  className="w-full h-12 rounded-2xl justify-start px-4 border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mr-3">
                    <MapPin className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">Je rentre</p>
                    <p className="text-xs text-blue-400/80">Activer le retour sécurisé</p>
                  </div>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={stopSafeReturn}
                  className="w-full h-12 rounded-2xl justify-start px-4 border-blue-500/30 bg-blue-500/10 text-blue-400"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mr-3">
                    <Shield className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">Retour sécurisé actif</p>
                    <p className="text-xs text-blue-400/80">Appuyez pour arrêter</p>
                  </div>
                </Button>
              )}
            </div>
          )}

          {/* Activate Live Button - clear separation from map */}
          {!isLive && (
            <div className="pt-2">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowLiveOnboarding(true)}
                className="w-full h-16 rounded-2xl bg-secondary/10 border-2 border-dashed border-secondary/30 flex items-center justify-center gap-3 text-secondary hover:bg-secondary/20 transition-all"
              >
                <Radio className="w-6 h-6" />
                <div className="text-left">
                  <p className="font-semibold">Activer le Live Circle</p>
                  <p className="text-xs text-secondary/80">Partage ta position avec tes proches</p>
                </div>
              </motion.button>
            </div>
          )}

          {/* Live Members List */}
          {liveSessions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Membres en ligne</h3>
              {liveSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-lg",
                    session.status === 'ok' && "bg-green-500/20",
                    session.status === 'heading_home' && "bg-blue-500/20",
                    session.status === 'need_help' && "bg-orange-500/20",
                    session.status === 'low_battery' && "bg-yellow-500/20",
                  )}>
                    {session.status === 'ok' && '👍'}
                    {session.status === 'heading_home' && '🏠'}
                    {session.status === 'need_help' && '⚠️'}
                    {session.status === 'low_battery' && '🔋'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{session.userName || 'Ami'}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.safeReturnMode && '🏠 Retour sécurisé • '}
                      {session.lastLocation ? 'Position active' : 'En attente de position...'}
                    </p>
                  </div>
                  {session.batteryLevel !== undefined && session.batteryLevel !== null && session.batteryLevel <= 20 && (
                    <span className="text-xs text-yellow-400">🔋 {session.batteryLevel}%</span>
                  )}
                </div>
              ))}
            </div>
          )}
    </motion.div>
  );
}