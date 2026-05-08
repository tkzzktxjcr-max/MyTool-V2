import { motion } from 'framer-motion';
import { ThumbsUp, Home, AlertTriangle, BatteryWarning, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LiveStatus } from '../types';

interface LiveStatusBarProps {
  currentStatus: LiveStatus;
  onStatusChange: (status: LiveStatus) => void;
  disabled?: boolean;
}

const STATUSES: { id: LiveStatus; icon: React.ComponentType<{ className?: string }>; label: string; color: string; bg: string }[] = [
  { id: 'ok', icon: ThumbsUp, label: 'Tout va bien', color: 'text-green-400', bg: 'bg-green-500/20 border-green-500/30' },
  { id: 'heading_home', icon: Home, label: 'Je rentre', color: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-500/30' },
  { id: 'need_help', icon: AlertTriangle, label: 'Besoin d\'aide', color: 'text-orange-400', bg: 'bg-orange-500/20 border-orange-500/30' },
  { id: 'low_battery', icon: BatteryWarning, label: 'Batterie faible', color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500/30' },
];

export default function LiveStatusBar({ currentStatus, onStatusChange, disabled }: LiveStatusBarProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {STATUSES.map((status) => {
        const Icon = status.icon;
        const isActive = currentStatus === status.id;

        return (
          <motion.button
            key={status.id}
            whileTap={{ scale: 0.92 }}
            onClick={() => onStatusChange(status.id)}
            disabled={disabled}
            className={cn(
              "flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all",
              isActive ? status.bg : "bg-white/5 border-white/10 hover:bg-white/10",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all",
              isActive ? "bg-white/20" : "bg-white/10"
            )}>
              <Icon className={cn("w-6 h-6", isActive ? status.color : "text-muted-foreground")} />
            </div>
            <span className={cn(
              "text-[11px] font-medium",
              isActive ? status.color : "text-muted-foreground"
            )}>
              {status.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}