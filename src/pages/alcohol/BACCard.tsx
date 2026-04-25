"use client";

import { Card, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Area, ReferenceLine, CartesianGrid } from 'recharts';
import { format, formatDistanceToNow } from 'date-fns';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { BACDataPoint } from '@/features/alcohol/utils/bac';

interface BACCardProps {
  currentBAC: number;
  peakBAC: number;
  peakTime: Date;
  zeroTime: Date;
  timeline: BACDataPoint[];
  isAboveLimit: boolean;
  isNearLimit: boolean;
  legalLimit: number;
}

export default function BACCard({
  currentBAC,
  peakBAC,
  peakTime,
  zeroTime,
  timeline,
  isAboveLimit,
  isNearLimit,
  legalLimit,
}: BACCardProps) {
  const chartData = timeline.map(point => ({
    time: format(point.time, 'HH:mm'),
    bac: point.bac,
  }));

  const hasActiveBAC = currentBAC > 0;

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300",
      isAboveLimit && "ring-2 ring-destructive/50",
      isNearLimit && "ring-2 ring-accent/50"
    )}>
      <CardContent className="p-6">
        <div className="text-center mb-4">
          <p className="text-sm text-muted-foreground mb-1">Alcoolémie actuelle</p>
          <motion.div
            key={`bac-${currentBAC.toFixed(2)}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "text-5xl md:text-7xl font-bold transition-colors duration-300",
              isAboveLimit && "text-destructive",
              isNearLimit && "text-accent",
              !isAboveLimit && !isNearLimit && hasActiveBAC && "text-secondary",
              !hasActiveBAC && "text-muted-foreground"
            )}
          >
            {currentBAC.toFixed(2)}
          </motion.div>
          <p className="text-xl text-muted-foreground">g/L</p>
          
          {hasActiveBAC && (
            <motion.div
              animate={hasActiveBAC ? {
                scale: [1, 1.02, 1],
                transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" as const }
              } : {}}
              className="mt-2 p-2 rounded-lg bg-white/5 inline-block"
            >
              <p className="text-sm">
                Pic attendu : <span className="font-bold text-accent">{peakBAC.toFixed(2)} g/L</span> à {format(peakTime, 'HH:mm')}
              </p>
            </motion.div>
          )}
        </div>

        {isAboveLimit && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 mb-4 p-3 rounded-xl bg-destructive/10 text-destructive"
          >
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">Au-dessus de la limite légale (0.5 g/L)</span>
          </motion.div>
        )}

        {timeline.length > 0 && hasActiveBAC && (
          <div className="h-40 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <defs>
                  <linearGradient id="bacGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(215, 20%, 65%)' }} axisLine={{ stroke: 'rgba(255,255,255,0.2)' }} tickLine={false} />
                <YAxis domain={[0, Math.ceil(Math.max(...timeline.map(p => p.bac), legalLimit) * 10) / 10]} tick={{ fontSize: 10, fill: 'hsl(215, 20%, 65%)' }} axisLine={{ stroke: 'rgba(255,255,255,0.2)' }} tickLine={false} tickFormatter={(v) => v.toFixed(1)} />
                <ReferenceLine y={legalLimit} stroke="hsl(0, 62%, 50%)" strokeDasharray="5 5" strokeWidth={2} />
                <Area type="monotone" dataKey="bac" stroke="hsl(142, 71%, 45%)" strokeWidth={3} fill="url(#bacGradient)" />
                <Line type="monotone" dataKey="bac" stroke="hsl(142, 71%, 45%)" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: 'hsl(142, 71%, 45%)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="flex items-center justify-around text-center border-t border-white/10 pt-4">
          <div>
            <p className="text-xs text-muted-foreground">Pic estimé</p>
            <p className="text-lg font-bold">{peakBAC > 0 ? format(peakTime, 'HH:mm') : '—'}</p>
            {peakBAC > currentBAC && peakBAC > 0 && (
              <p className="text-xs text-accent">dans {formatDistanceToNow(peakTime)}</p>
            )}
          </div>
          <div className="w-px h-12 bg-white/10" />
          <div>
            <p className="text-xs text-muted-foreground">Retour à 0</p>
            <p className="text-lg font-bold">{hasActiveBAC ? format(zeroTime, 'HH:mm') : '—'}</p>
            {hasActiveBAC && (
              <p className="text-xs text-muted-foreground">{formatDistanceToNow(zeroTime, { addSuffix: true })}</p>
            )}
          </div>
          <div className="w-px h-12 bg-white/10" />
          <div>
            <p className="text-xs text-muted-foreground">Limite</p>
            <p className="text-lg font-bold text-destructive">{legalLimit} g/L</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}