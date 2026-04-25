"use client";

import { Card, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Area, ReferenceLine, CartesianGrid } from 'recharts';
import { format, formatDistanceToNow } from 'date-fns';
import { CheckCircle2, Car, Clock, TrendingUp, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { BACDataPoint } from '@/features/alcohol/utils/bac';
import SoberCountdown from './SoberCountdown';

interface BACCardProps {
  currentBAC: number;
  peakBAC: number;
  peakTime: Date;
  zeroTime: Date;
  timeline: BACDataPoint[];
  isAboveLimit: boolean;
  isNearLimit: boolean;
  legalLimit: number;
  safeToDriveTime?: Date;
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
  safeToDriveTime,
}: BACCardProps) {
  const chartData = timeline.map(point => ({
    time: format(point.time, 'HH:mm'),
    bac: point.bac,
  }));

  const hasActiveBAC = currentBAC > 0;
  
  // Premium messaging - positive framing
  const getStatusConfig = () => {
    if (!hasActiveBAC) {
      return {
        label: 'Zéro alcool',
        sublabel: 'Tu es sobre',
        icon: Leaf,
        color: 'text-secondary',
        bgClass: 'status-excellent',
        progress: 0,
      };
    }
    
    if (!isAboveLimit && !isNearLimit) {
      return {
        label: 'Sous la limite',
        sublabel: `Conduite autorisée`,
        icon: CheckCircle2,
        color: 'text-secondary',
        bgClass: 'status-excellent',
        progress: Math.min((currentBAC / legalLimit) * 100, 100),
      };
    }
    
    if (isNearLimit) {
      return {
        label: 'Approche de la limite',
        sublabel: safeToDriveTime ? `OK dans ${formatDistanceToNow(safeToDriveTime, { addSuffix: false })}` : 'Bientôt',
        icon: Clock,
        color: 'text-[hsl(38,92%,50%)]',
        bgClass: 'status-moderate',
        progress: Math.min((currentBAC / legalLimit) * 100, 100),
      };
    }
    
    return {
      label: 'Au-dessus de la limite',
      sublabel: safeToDriveTime ? `Conduite OK dans ~${formatDistanceToNow(safeToDriveTime, { addSuffix: false })}` : 'Plus tard',
      icon: Clock,
      color: 'text-destructive',
      bgClass: 'status-high',
      progress: Math.min((currentBAC / legalLimit) * 100, 100),
    };
  };

  const status = getStatusConfig();
  const StatusIcon = status.icon;

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-500 border-0",
      status.bgClass
    )}>
      <CardContent className="p-5 space-y-4">
        {/* Current BAC Display - Premium Hero */}
        <div className="text-center">
          <motion.div
            key={`bac-${currentBAC.toFixed(2)}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "text-6xl md:text-8xl font-bold transition-colors duration-500",
              !hasActiveBAC && "text-secondary",
              hasActiveBAC && !isAboveLimit && !isNearLimit && "text-secondary",
              isNearLimit && "text-[hsl(38,92%,50%)]",
              isAboveLimit && "text-destructive"
            )}
          >
            {currentBAC.toFixed(2)}
          </motion.div>
          <p className="text-2xl text-muted-foreground">g/L</p>
          
          {/* Status badge */}
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={cn(
              "inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full text-sm font-medium",
              !hasActiveBAC && "bg-secondary/20 text-secondary",
              hasActiveBAC && !isAboveLimit && !isNearLimit && "bg-secondary/20 text-secondary",
              isNearLimit && "bg-[hsl(38,92%,50%)]/20 text-[hsl(38,92%,50%)]",
              isAboveLimit && "bg-destructive/20 text-destructive"
            )}
          >
            <StatusIcon className="w-4 h-4" />
            {status.label}
          </motion.div>
        </div>

        {/* Driving status */}
        {!isAboveLimit && hasActiveBAC && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-secondary/10 border border-secondary/20"
          >
            <Car className="w-5 h-5 text-secondary" />
            <span className="text-sm text-secondary font-medium">
              Conduite autorisée
            </span>
          </motion.div>
        )}

        {/* Progress ring to legal limit */}
        {hasActiveBAC && (
          <div className="relative">
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(status.progress, 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full shimmer",
                  status.progress < 70 && "bg-secondary",
                  status.progress >= 70 && status.progress < 100 && "bg-[hsl(38,92%,50%)]",
                  status.progress >= 100 && "bg-destructive"
                )}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>0 g/L</span>
              <span className="text-destructive">{legalLimit} g/L (limite)</span>
            </div>
          </div>
        )}

        {/* Timeline Chart */}
        {timeline.length > 0 && hasActiveBAC && (
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <defs>
                  <linearGradient id="bacGradientPositive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(215, 20%, 65%)' }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} />
                <YAxis domain={[0, Math.ceil(Math.max(...timeline.map(p => p.bac), legalLimit) * 10) / 10]} tick={{ fontSize: 10, fill: 'hsl(215, 20%, 65%)' }} axisLine={false} tickLine={false} tickFormatter={(v) => v.toFixed(1)} />
                <ReferenceLine y={legalLimit} stroke="hsl(0, 62%, 50%)" strokeDasharray="5 5" strokeWidth={2} />
                <Area type="monotone" dataKey="bac" stroke="hsl(142, 71%, 45%)" strokeWidth={2} fill="url(#bacGradientPositive)" />
                <Line type="monotone" dataKey="bac" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={false} activeDot={{ r: 5, fill: 'hsl(142, 71%, 45%)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Sober Countdown */}
        {hasActiveBAC && safeToDriveTime && (
          <SoberCountdown
            zeroTime={zeroTime}
            safeToDriveTime={safeToDriveTime}
            currentBAC={currentBAC}
            legalLimit={legalLimit}
            isAboveLimit={isAboveLimit}
          />
        )}

        {/* Quick stats */}
        <div className="flex items-center justify-around text-center border-t border-white/10 pt-4">
          <div>
            <p className="text-xs text-muted-foreground">Pic estimé</p>
            <p className="text-lg font-bold">{peakBAC > 0 ? format(peakTime, 'HH:mm') : '—'}</p>
            {peakBAC > currentBAC && peakBAC > 0 && (
              <p className="text-xs text-secondary">dans {formatDistanceToNow(peakTime)}</p>
            )}
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div>
            <p className="text-xs text-muted-foreground">Retour à 0</p>
            <p className="text-lg font-bold">{hasActiveBAC ? format(zeroTime, 'HH:mm') : '—'}</p>
            {hasActiveBAC && (
              <p className="text-xs text-muted-foreground">{formatDistanceToNow(zeroTime, { addSuffix: true })}</p>
            )}
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div>
            <p className="text-xs text-muted-foreground">Limite</p>
            <p className="text-lg font-bold">{legalLimit} g/L</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}