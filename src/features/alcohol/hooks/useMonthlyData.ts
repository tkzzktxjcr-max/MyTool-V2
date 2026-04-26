import React, { useState, useMemo } from 'react';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isToday, subMonths, addMonths, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { AlcoholLog } from '@/features/alcohol/types';

export interface DayData {
  date: Date;
  dateStr: string;
  dayLabel: string;
  units: number;
  logCount: number;
  logs: AlcoholLog[];
  intensity: 0 | 1 | 2 | 3; // 0=0 units, 1=1-2, 2=3-4, 3=5+
  isToday: boolean;
  isCurrentMonth: boolean;
}

export interface MonthlyData {
  month: Date;
  monthLabel: string;
  days: DayData[];
  totalUnits: number;
  averagePerDay: number;
  soberDays: number;
  drinkingDays: number;
}

export interface UseMonthlyDataResult {
  currentMonth: MonthlyData;
  previousMonth: MonthlyData;
  canGoBack: boolean;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
}

const getIntensity = (units: number): 0 | 1 | 2 | 3 => {
  if (units === 0) return 0;
  if (units <= 2) return 1;
  if (units <= 4) return 2;
  return 3;
};

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export const useMonthlyData = (
  logs: AlcoholLog[],
  initialMonth?: Date
): UseMonthlyDataResult => {
  const [currentMonth, setCurrentMonth] = React.useState(() => initialMonth || new Date());

  const currentMonthData = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    
    // Include padding days from previous/next month to complete the calendar grid
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    const daysInMonth = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    
    const days: DayData[] = daysInMonth.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayLogs = logs.filter(log => log.timestamp.split('T')[0] === dateStr);
      const units = dayLogs.reduce((sum, l) => sum + (l.units || 0), 0);
      
      return {
        date,
        dateStr,
        dayLabel: DAY_LABELS[date.getDay() === 0 ? 6 : date.getDay() - 1],
        units: Math.round(units * 10) / 10,
        logCount: dayLogs.length,
        logs: dayLogs,
        intensity: getIntensity(units),
        isToday: isToday(date),
        isCurrentMonth: date >= monthStart && date <= monthEnd,
      };
    });
    
    const monthLogs = days.filter(d => d.isCurrentMonth);
    const totalUnits = monthLogs.reduce((sum, d) => sum + d.units, 0);
    const soberDays = monthLogs.filter(d => d.units === 0).length;
    const drinkingDays = monthLogs.filter(d => d.units > 0).length;
    
    return {
      month: currentMonth,
      monthLabel: format(currentMonth, 'MMMM yyyy', { locale: fr }),
      days,
      totalUnits: Math.round(totalUnits * 10) / 10,
      averagePerDay: monthLogs.length > 0 ? Math.round((totalUnits / monthLogs.length) * 10) / 10 : 0,
      soberDays,
      drinkingDays,
    };
  }, [logs, currentMonth]);
  
  const previousMonthData = useMemo(() => {
    const prevMonth = subMonths(currentMonth, 1);
    const monthStart = startOfMonth(prevMonth);
    const monthEnd = endOfMonth(prevMonth);
    
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    const daysInMonth = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    
    const days: DayData[] = daysInMonth.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayLogs = logs.filter(log => log.timestamp.split('T')[0] === dateStr);
      const units = dayLogs.reduce((sum, l) => sum + (l.units || 0), 0);
      
      return {
        date,
        dateStr,
        dayLabel: DAY_LABELS[date.getDay() === 0 ? 6 : date.getDay() - 1],
        units: Math.round(units * 10) / 10,
        logCount: dayLogs.length,
        logs: dayLogs,
        intensity: getIntensity(units),
        isToday: isToday(date),
        isCurrentMonth: date >= monthStart && date <= monthEnd,
      };
    });
    
    const monthLogs = days.filter(d => d.isCurrentMonth);
    const totalUnits = monthLogs.reduce((sum, d) => sum + d.units, 0);
    const soberDays = monthLogs.filter(d => d.units === 0).length;
    const drinkingDays = monthLogs.filter(d => d.units > 0).length;
    
    return {
      month: prevMonth,
      monthLabel: format(prevMonth, 'MMMM yyyy', { locale: fr }),
      days,
      totalUnits: Math.round(totalUnits * 10) / 10,
      averagePerDay: monthLogs.length > 0 ? Math.round((totalUnits / monthLogs.length) * 10) / 10 : 0,
      soberDays,
      drinkingDays,
    };
  }, [logs, currentMonth]);
  
  const canGoBack = useMemo(() => {
    const now = new Date();
    const earliestAllowed = subMonths(startOfMonth(now), 1);
    return currentMonth > earliestAllowed;
  }, [currentMonth]);
  
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };
  
  return {
    currentMonth: currentMonthData,
    previousMonth: previousMonthData,
    canGoBack,
    goToPreviousMonth,
    goToNextMonth,
  };
};
