"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Leaf, Droplets, Sparkles, LeafIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useMonthlyData, type DayData, type MonthlyData } from '@/features/alcohol/hooks/useMonthlyData';
import type { AlcoholLog } from '@/features/alcohol/types';
import { PremiumEmptyState } from '@/components/ui/PremiumEmptyState';

interface MonthlyHeatmapProps {
  logs: AlcoholLog[];
  onAddDrink?: () => void;
}

const INTENSITY_STYLES = {
  0: 'bg-white/5 hover:bg-white/10',
  1: 'bg-secondary/40 hover:bg-secondary/50',
  2: 'bg-secondary/70 hover:bg-secondary/80',
  3: 'bg-accent hover:bg-accent/80',
};

const INTENSITY_OUTSIDE = 'bg-muted/20 hover:bg-muted/30';

// Import missing Lucide icon
import { Sun } from 'lucide-react';

interface DayDetail {
  dateStr: string;
  logs: AlcoholLog[];
  units: number;
  logCount: number;
}

export default function MonthlyHeatmap({ logs, onAddDrink }: MonthlyHeatmapProps) {
  const {
    currentMonth,
    canGoBack,
    goToPreviousMonth,
    goToNextMonth,
  } = useMonthlyData(logs);

  const [selectedDay, setSelectedDay] = useState<DayDetail | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleDayClick = (day: DayData) => {
    if (!day.isCurrentMonth) return;
    
    setSelectedDay({
      dateStr: day.dateStr,
      logs: day.logs,
      units: day.units,
      logCount: day.logCount,
    });
    setSheetOpen(true);
  };

  const hasLogs = logs.length > 0;

  if (!hasLogs) {
    return (
      <div className="rounded-2xl bg-card border border-white/10 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-secondary" />
          <h2 className="font-semibold">Mon parcours</h2>
        </div>
        <PremiumEmptyState
          icon={<Sparkles className="w-7 h-7 text-secondary" />}
          title="Cultive ta conscience"
          description="Chaque verre que tu consommes est une donnée précieuse pour toi."
          action={{
            label: "+ Mon premier verre",
            onClick: () => onAddDrink?.(),
            variant: 'secondary',
          }}
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-secondary" />
          <h2 className="font-semibold">Mon parcours</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={goToPreviousMonth}
            disabled={!canGoBack}
            className={cn(
              "p-2 rounded-xl transition-colors",
              canGoBack
                ? "hover:bg-white/10 text-foreground"
                : "text-muted-foreground/50 cursor-not-allowed"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium min-w-[120px] text-center capitalize">
            {currentMonth.monthLabel}
          </span>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-xl hover:bg-white/10 text-muted-foreground transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((label, i) => (
            <div key={i} className="text-center text-xs text-muted-foreground py-1">
              {label}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {currentMonth.days.map((day, index) => (
            <motion.button
              key={day.dateStr}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01, duration: 0.2 }}
              onClick={() => handleDayClick(day)}
              disabled={!day.isCurrentMonth}
              className={cn(
                "aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all relative",
                day.isCurrentMonth
                  ? INTENSITY_STYLES[day.intensity]
                  : INTENSITY_OUTSIDE,
                day.isToday && "ring-2 ring-secondary ring-offset-2 ring-offset-background",
              )}
            >
              {format(day.date, 'd')}
              
              {/* Pulsing indicator for today */}
              {day.isToday && day.intensity === 0 && (
                <motion.span
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-lg border-2 border-secondary/50"
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-3 h-3 rounded bg-white/5" />
            <span>0</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-3 h-3 rounded bg-secondary/40" />
            <span>1-2</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-3 h-3 rounded bg-secondary/70" />
            <span>3-4</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-3 h-3 rounded bg-accent" />
            <span>5+</span>
          </div>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-px bg-white/5 border-t border-white/5">
        <div className="p-3 text-center bg-card/50">
          <p className="text-lg font-bold text-secondary">{currentMonth.drinkingDays}</p>
          <p className="text-[10px] text-muted-foreground">jours bu</p>
        </div>
        <div className="p-3 text-center bg-card/50 border-x border-white/5">
          <p className="text-lg font-bold">{currentMonth.totalUnits}</p>
          <p className="text-[10px] text-muted-foreground">unités total</p>
        </div>
        <div className="p-3 text-center bg-card/50">
          <p className="text-lg font-bold text-accent">{currentMonth.soberDays}</p>
          <p className="text-[10px] text-muted-foreground">jours sobre</p>
        </div>
      </div>

      {/* Day Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle className="text-center">
              {selectedDay && format(new Date(selectedDay.dateStr), 'EEEE d MMMM', { locale: fr })}
            </SheetTitle>
          </SheetHeader>
          
          <AnimatePresence mode="wait">
            {selectedDay && (
              <motion.div
                key={selectedDay.dateStr}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mt-4 space-y-4"
              >
                {/* Summary */}
                <div className="flex items-center justify-center gap-6 py-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{selectedDay.units}</p>
                    <p className="text-xs text-muted-foreground">unités</p>
                  </div>
                  <div className="w-px h-12 bg-white/10" />
                  <div className="text-center">
                    <p className="text-3xl font-bold">{selectedDay.logCount}</p>
                    <p className="text-xs text-muted-foreground">consommations</p>
                  </div>
                </div>

                {/* Logs list */}
                {selectedDay.logs.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDay.logs.map((log, index) => (
                      <motion.div
                        key={log.id || index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                          <Leaf className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{log.drinkName}</p>
                          <p className="text-xs text-muted-foreground">
                            {log.quantity}x - {log.units?.toFixed(1)} u
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(log.timestamp), 'HH:mm')}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <div className="flex items-center justify-center mb-3">
                      <Leaf className="w-8 h-8 text-secondary/50" />
                    </div>
                    <p className="text-sm text-muted-foreground">Aucune consommation ce jour</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Continue comme ça !</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </SheetContent>
      </Sheet>
    </div>
  );
}