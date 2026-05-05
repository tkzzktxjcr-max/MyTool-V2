"use client";

import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, Info, Heart, MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { CircleAlert } from '@/features/circle/types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CircleAlertCardProps {
  alert: CircleAlert;
  onMarkAsRead: (alertId: string) => void;
  onDismiss: (alertId: string) => void;
}

const ALERT_CONFIG = {
  urgent: { icon: ShieldAlert, color: 'text-destructive bg-destructive/10 border-destructive/20', label: 'Urgent' },
  warning: { icon: AlertTriangle, color: 'text-[hsl(38,92%,50%)] bg-[hsl(38,92%,50%)]/10 border-[hsl(38,92%,50%)]/20', label: 'Attention' },
  info: { icon: Info, color: 'text-secondary bg-secondary/10 border-secondary/20', label: 'Info' },
};

export default function CircleAlertCard({ alert, onMarkAsRead, onDismiss }: CircleAlertCardProps) {
  const config = ALERT_CONFIG[alert.severity] || ALERT_CONFIG.info;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 rounded-2xl border",
        config.color,
        !alert.isRead && "ring-1 ring-white/10"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium">{config.label}</span>
            {!alert.isRead && (
              <span className="w-2 h-2 rounded-full bg-accent" />
            )}
          </div>
          <p className="text-sm font-medium">{alert.message}</p>

          {alert.locationData && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>Position partagée</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true, locale: fr })}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        {!alert.isRead && (
          <Button size="sm" variant="outline" onClick={() => onMarkAsRead(alert.id)} className="flex-1 rounded-xl text-xs">
            <Heart className="w-3.5 h-3.5 mr-1" />
            Envoyer encouragement
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={() => onDismiss(alert.id)} className="rounded-xl text-xs">
          Ignorer
        </Button>
      </div>
    </motion.div>
  );
}