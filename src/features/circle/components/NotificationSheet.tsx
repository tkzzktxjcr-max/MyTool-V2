import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Bell, Check, X, AlertTriangle, Info, ShieldAlert, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { CircleAlert } from '../types';

interface NotificationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alerts: CircleAlert[];
  onMarkAsRead: (alertId: string) => void;
  onDismiss: (alertId: string) => void;
  onMarkAllAsRead: () => void;
}

const getAlertIcon = (severity: string) => {
  switch (severity) {
    case 'urgent': return ShieldAlert;
    case 'warning': return AlertTriangle;
    case 'info': return Info;
    default: return Heart;
  }
};

const getAlertColor = (severity: string) => {
  switch (severity) {
    case 'urgent': return 'text-destructive bg-destructive/10 border-destructive/20';
    case 'warning': return 'text-[hsl(38,92%,50%)] bg-[hsl(38,92%,50%)]/10 border-[hsl(38,92%,50%)]/20';
    default: return 'text-secondary bg-secondary/10 border-secondary/20';
  }
};

export default function NotificationSheet({
  open,
  onOpenChange,
  alerts,
  onMarkAsRead,
  onDismiss,
  onMarkAllAsRead,
}: NotificationSheetProps) {
  const unreadAlerts = alerts.filter(a => !a.isRead);
  const readAlerts = alerts.filter(a => a.isRead);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-accent" />
              Notifications
            </SheetTitle>
            {unreadAlerts.length > 0 && (
              <Button variant="ghost" size="sm" onClick={onMarkAllAsRead} className="text-xs">
                <Check className="w-3.5 h-3.5 mr-1" />
                Tout lire
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {unreadAlerts.length} non lue{unreadAlerts.length > 1 ? 's' : ''}
          </p>
        </SheetHeader>

        <div className="mt-6 space-y-3 max-h-[calc(100vh-180px)] overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Aucune notification</p>
            </div>
          ) : (
            <>
              {unreadAlerts.map((alert, index) => {
                const Icon = getAlertIcon(alert.severity);
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "p-4 rounded-2xl border cursor-pointer transition-colors",
                      getAlertColor(alert.severity)
                    )}
                    onClick={() => onMarkAsRead(alert.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true, locale: fr })}
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDismiss(alert.id); }}
                        className="p-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}

              {readAlerts.length > 0 && unreadAlerts.length > 0 && (
                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs text-muted-foreground mb-3">Déjà lues</p>
                </div>
              )}

              {readAlerts.map((alert) => {
                const Icon = getAlertIcon(alert.severity);
                return (
                  <div
                    key={alert.id}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 opacity-60"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true, locale: fr })}
                        </p>
                      </div>
                      <button
                        onClick={() => onDismiss(alert.id)}
                        className="p-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}