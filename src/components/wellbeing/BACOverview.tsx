"use client";

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BACOverviewProps {
  currentBAC: number;
  isAboveLimit: boolean;
  isNearLimit: boolean;
  legalLimit: number;
}

export default function BACOverview({ currentBAC, isAboveLimit, isNearLimit, legalLimit }: BACOverviewProps) {
  const getStatusConfig = () => {
    if (currentBAC === 0) return { label: 'Sobre maintenant', color: 'text-secondary', bgClass: 'bg-secondary/10', icon: CheckCircle2 };
    if (isAboveLimit) return { label: 'Au-dessus de la limite', color: 'text-destructive', bgClass: 'bg-destructive/10', icon: AlertTriangle };
    if (isNearLimit) return { label: 'Proche de la limite', color: 'text-[hsl(38,92%,50%)]', bgClass: 'bg-[hsl(38,92%,50%)]/10', icon: AlertTriangle };
    return { label: 'Dans les limites', color: 'text-secondary', bgClass: 'bg-secondary/10', icon: CheckCircle2 };
  };

  const status = getStatusConfig();
  const StatusIcon = status.icon;
  const progress = Math.min((currentBAC / legalLimit) * 100, 100);

  return (
    <Card className={status.bgClass}>
      <CardContent className="p-5 space-y-4">
        <div className="text-center">
          <motion.div key={`bac-${currentBAC.toFixed(2)}`} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={cn("text-5xl font-bold", status.color)}>
            {currentBAC.toFixed(2)}
          </motion.div>
          <p className="text-xl text-muted-foreground">g/L</p>
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className={cn("inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full text-sm font-medium", status.bgClass)}>
            <StatusIcon className={cn("w-4 h-4", status.color)} />
            <span className={status.color}>{status.label}</span>
          </motion.div>
        </div>
        {currentBAC > 0 && (
          <div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(progress, 100)}%` }} className={cn("h-full rounded-full", progress < 70 && "bg-secondary", progress >= 70 && progress < 100 && "bg-[hsl(38,92%,50%)]", progress >= 100 && "bg-destructive")} />
            </div>
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>0 g/L</span>
              <span className="text-destructive">{legalLimit} g/L</span>
            </div>
          </div>
        )}
        {currentBAC === 0 && (
          <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-secondary/10">
            <Activity className="w-5 h-5 text-secondary" />
            <span className="text-sm text-secondary font-medium">Pret pour la route</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}