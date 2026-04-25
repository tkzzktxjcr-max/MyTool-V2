"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Activity, X, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow, format, parseISO, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { AlcoholLog } from '@/features/alcohol/types';

interface HistoryCardProps { 
  logs: AlcoholLog[]; 
  onDeleteLog: (logId: string) => void; 
}

const formatTimestamp = (timestamp: string): string => {
  const date = parseISO(timestamp);
  const now = new Date();
  const hoursDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  // If more than 24 hours ago, show date
  if (hoursDiff > 24) {
    if (isYesterday(date)) {
      return `Hier ${format(date, 'HH:mm')}`;
    }
    return format(date, 'd MMM a HH:mm', { locale: fr });
  }
  
  // Otherwise show relative time
  return formatDistanceToNow(date, { addSuffix: true, locale: fr });
};

const isRetroactiveLog = (timestamp: string): boolean => {
  const date = parseISO(timestamp);
  const now = new Date();
  const hoursDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  return hoursDiff > 0.5; // More than 30 minutes ago
};

export default function HistoryCard({ logs, onDeleteLog }: HistoryCardProps) {
  const recentLogs = logs.slice(0, 7);

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-medium text-sm mb-4">Historique</h3>
        {recentLogs.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">Aucun enregistrement</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentLogs.map((log, i) => {
              const retroactive = isRetroactiveLog(log.timestamp);
              const quantity = log.quantity || 1;
              
              return (
                <motion.div 
                  key={log.id} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i * 0.05 }} 
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl",
                    retroactive ? "bg-accent/10 border border-accent/20" : "bg-white/5"
                  )}
                >
                  <div className="text-2xl">{log.drinkEmoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{log.drinkName}</p>
                      {quantity > 1 && (
                        <span className="text-xs bg-secondary/20 text-secondary px-1.5 py-0.5 rounded">
                          x{quantity}
                        </span>
                      )}
                      {retroactive && (
                        <span className="flex items-center gap-1 text-xs text-accent">
                          <Clock className="w-3 h-3" />
                          Retroactif
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{formatTimestamp(log.timestamp)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{log.units.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">unites</p>
                  </div>
                  <button 
                    onClick={() => onDeleteLog(log.id)} 
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}