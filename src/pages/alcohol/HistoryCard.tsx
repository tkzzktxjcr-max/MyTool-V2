"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Clock, Calendar, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  
  if (hoursDiff > 24) {
    if (isYesterday(date)) {
      return `Hier ${format(date, 'HH:mm')}`;
    }
    return format(date, 'd MMM à HH:mm', { locale: fr });
  }
  
  return formatDistanceToNow(date, { addSuffix: true, locale: fr });
};

const isRetroactiveLog = (timestamp: string): boolean => {
  const date = parseISO(timestamp);
  const now = new Date();
  const hoursDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  return hoursDiff > 0.5;
};

// Premium empty state
const EmptyHistory = () => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-8 px-4"
  >
    <div className="text-5xl mb-3">📝</div>
    <h4 className="font-medium text-base mb-1">Ton parcours commence ici</h4>
    <p className="text-sm text-muted-foreground max-w-[240px] mx-auto">
      Ajoute ta première consommation pour commencer à suivre tes habitudes
    </p>
    <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-secondary">
      <Sparkles className="w-3.5 h-3.5" />
      <span>Chaque verre compte</span>
    </div>
  </motion.div>
);

export default function HistoryCard({ logs, onDeleteLog }: HistoryCardProps) {
  // Group logs by date
  const groupedLogs = logs.reduce((groups, log) => {
    const date = log.timestamp.split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(log);
    return groups;
  }, {} as Record<string, AlcoholLog[]>);

  const sortedDates = Object.keys(groupedLogs).sort((a, b) => b.localeCompare(a));
  const todayLogs = logs.filter(l => isToday(parseISO(l.timestamp)));
  const yesterdayLogs = logs.filter(l => isYesterday(parseISO(l.timestamp)));

  // Show recent logs without grouping if few
  const recentLogs = logs.slice(0, 5);

  // Premium empty state
  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            Mon parcours
          </h3>
          <EmptyHistory />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-medium text-sm mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          Mon parcours
        </h3>
        
        <div className="space-y-4">
          {/* Today's summary */}
          {todayLogs.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                Aujourd'hui
              </p>
              <div className="space-y-2">
                {todayLogs.slice(0, 3).map((log, i) => (
                  <motion.div 
                    key={log.id} 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl",
                      isRetroactiveLog(log.timestamp) 
                        ? "bg-[hsl(263,70%,58%)]/10 border border-[hsl(263,70%,58%)]/20" 
                        : "bg-white/5"
                    )}
                  >
                    <span className="text-2xl">{log.drinkEmoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{log.drinkName}</p>
                        {(log.quantity || 1) > 1 && (
                          <span className="text-xs bg-secondary/20 text-secondary px-1.5 py-0.5 rounded">
                            ×{log.quantity}
                          </span>
                        )}
                        {isRetroactiveLog(log.timestamp) && (
                          <span className="flex items-center gap-1 text-xs text-[hsl(263,70%,58%)]">
                            <Clock className="w-3 h-3" />
                            Retroactif
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(log.timestamp)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold">{log.units.toFixed(1)}</p>
                      <p className="text-[10px] text-muted-foreground">unités</p>
                    </div>
                    <button 
                      onClick={() => onDeleteLog(log.id)} 
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors opacity-50 hover:opacity-100"
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Yesterday's summary */}
          {yesterdayLogs.length > 0 && todayLogs.length === 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[hsl(38,92%,50%)]" />
                Hier
              </p>
              <div className="space-y-2">
                {yesterdayLogs.slice(0, 3).map((log, i) => (
                  <motion.div 
                    key={log.id} 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5"
                  >
                    <span className="text-2xl">{log.drinkEmoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{log.drinkName}</p>
                      <p className="text-xs text-muted-foreground">Hier</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold">{log.units.toFixed(1)}</p>
                      <p className="text-[10px] text-muted-foreground">unités</p>
                    </div>
                    <button 
                      onClick={() => onDeleteLog(log.id)} 
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors opacity-50 hover:opacity-100"
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Older logs summary */}
          {sortedDates.filter(d => !isToday(parseISO(d)) && !isYesterday(parseISO(d))).length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Plus ancien</p>
              <div className="space-y-2">
                {sortedDates
                  .filter(d => !isToday(parseISO(d)) && !isYesterday(parseISO(d)))
                  .slice(0, 3)
                  .map(date => {
                    const dayLogs = groupedLogs[date];
                    const totalUnits = dayLogs.reduce((sum, l) => sum + l.units, 0);
                    return (
                      <div 
                        key={date}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5"
                      >
                        <div className="flex -space-x-2">
                          {dayLogs.slice(0, 3).map((log, i) => (
                            <span key={log.id} className="text-lg bg-card rounded-full p-1 border border-card">
                              {log.drinkEmoji}
                            </span>
                          ))}
                          {dayLogs.length > 3 && (
                            <span className="text-xs bg-muted rounded-full px-2 py-1 flex items-center">
                              +{dayLogs.length - 3}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">
                            {format(parseISO(date), 'EEEE d MMM', { locale: fr })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {dayLogs.length} consommation{dayLogs.length > 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold">{totalUnits.toFixed(1)}</p>
                          <p className="text-[10px] text-muted-foreground">unités</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}