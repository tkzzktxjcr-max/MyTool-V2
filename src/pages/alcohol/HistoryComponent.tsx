"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Activity, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { AlcoholLog } from '@/features/alcohol/types';

interface Props { logs: AlcoholLog[]; onDeleteLog: (logId: string) => void; }

export default function HistoryComponent({ logs, onDeleteLog }: Props) {
  const recentLogs = logs.slice(0, 7);

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-medium text-sm mb-4">Historique</h3>
        {recentLogs.length === 0 ? (
          <div className="text-center py-8"><Activity className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" /><p className="text-sm text-muted-foreground">Aucun enregistrement</p></div>
        ) : (
          <div className="space-y-3">
            {recentLogs.map((log, i) => (
              <motion.div key={log.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                <div className="text-2xl">{log.drinkEmoji}</div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{log.drinkName}</p>
                  <p className="text-xs text-muted-foreground">{format(parseISO(log.timestamp), 'd MMM à HH:mm', { locale: fr })}</p>
                </div>
                <div className="text-right"><p className="font-bold">{log.units.toFixed(1)}</p><p className="text-xs text-muted-foreground">unités</p></div>
                <button onClick={() => onDeleteLog(log.id)} className="p-1 text-muted-foreground hover:text-destructive"><X className="w-4 h-4" /></button>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}