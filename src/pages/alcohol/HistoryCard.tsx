"use client";
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Calendar, ChevronRight, Sparkles, Beer, Wine, GlassWater, Apple, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow, format, parseISO, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { AlcoholLog } from '@/features/alcohol/types';

const getDrinkIcon = (type: string) => {
  switch (type) {
    case 'beer': case 'lager': case 'pilsner': case 'wheat_beer': case 'ipa': case 'ale': case 'cider': case 'calvados':
      return Beer;
    case 'wine': case 'red_wine': case 'white_wine': case 'rose_wine': case 'champagne': case 'sangria':
      return Wine;
    case 'spirit': case 'whisky': case 'tequila': case 'brandy': case 'cognac':
    case 'cocktail': case 'martini': case 'mojito': case 'margarita': case 'old_fashioned': case 'cosmopolitan':
      return GlassWater;
    default:
      return Beer;
  }
};

interface HistoryCardProps { logs: AlcoholLog[]; onDeleteLog: (logId: string) => void; }

const formatTimestamp = (timestamp: string): string => {
  const date = parseISO(timestamp);
  const hoursDiff = (Date.now() - date.getTime()) / (1000 * 60 * 60);
  if (hoursDiff > 24) return isYesterday(date) ? `Hier ${format(date, 'HH:mm')}` : format(date, 'd MMM à HH:mm', { locale: fr });
  return formatDistanceToNow(date, { addSuffix: true, locale: fr });
};

const EmptyHistory = () => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
    <div className="w-14 h-14 rounded-2xl bg-secondary/20 flex items-center justify-center mx-auto mb-3">
      <Sparkles className="w-7 h-7 text-secondary" />
    </div>
    <h4 className="font-medium text-base mb-1">Ton parcours commence ici</h4>
    <p className="text-sm text-muted-foreground">Ajoute ta première consommation</p>
  </motion.div>
);

export default function HistoryCard({ logs, onDeleteLog }: HistoryCardProps) {
  const groupedLogs = logs.reduce((g, log) => {
    const date = log.timestamp.split('T')[0];
    if (!g[date]) g[date] = [];
    g[date].push(log);
    return g;
  }, {} as Record<string, AlcoholLog[]>);

  const todayLogs = logs.filter(l => isToday(parseISO(l.timestamp)));
  const yesterdayLogs = logs.filter(l => isYesterday(parseISO(l.timestamp)));

  if (logs.length === 0) return (
    <Card><CardContent className="p-4">
      <h3 className="font-medium text-sm mb-2 flex items-center gap-2"><Calendar className="w-4 h-4" />Mon parcours</h3>
      <EmptyHistory />
    </CardContent></Card>
  );

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-medium text-sm mb-4 flex items-center gap-2"><Calendar className="w-4 h-4" />Mon parcours</h3>
        <div className="space-y-4">
          {todayLogs.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-secondary" />Aujourd'hui</p>
              <div className="space-y-2">
                {todayLogs.slice(0, 3).map((log, i) => {
                  const Icon = getDrinkIcon(log.drinkType);
                  return (
                    <motion.div key={log.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><Icon className="w-5 h-5" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{log.drinkName}</p>
                        <p className="text-xs text-muted-foreground">{formatTimestamp(log.timestamp)}</p>
                      </div>
                      <div className="text-right"><p className="font-bold">{log.units.toFixed(1)}</p><p className="text-[10px] text-muted-foreground">u</p></div>
                      <button onClick={() => onDeleteLog(log.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><X className="w-4 h-4" /></button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
          {yesterdayLogs.length > 0 && todayLogs.length === 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[hsl(38,92%,50%)]" />Hier</p>
              <div className="space-y-2">
                {yesterdayLogs.slice(0, 3).map((log, i) => {
                  const Icon = getDrinkIcon(log.drinkType);
                  return (
                    <motion.div key={log.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><Icon className="w-5 h-5" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{log.drinkName}</p>
                        <p className="text-xs text-muted-foreground">Hier</p>
                      </div>
                      <div className="text-right"><p className="font-bold">{log.units.toFixed(1)}</p><p className="text-[10px] text-muted-foreground">u</p></div>
                      <button onClick={() => onDeleteLog(log.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><X className="w-4 h-4" /></button>
                    </motion.div>
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