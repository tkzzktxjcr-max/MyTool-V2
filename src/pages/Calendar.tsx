"use client";

import { useEffect, useState } from 'react';
import { useFamily } from '@/features/family/context';
import { useCalendar } from '@/features/calendar/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { CreateEventForm, EventCategory } from '@/features/calendar/types';

const categories = [
  { value: 'family', label: 'Famille' },
  { value: 'school', label: 'École' },
  { value: 'work', label: 'Travail' },
  { value: 'leisure', label: 'Loisirs' },
  { value: 'medical', label: 'Médical' },
  { value: 'other', label: 'Autre' },
];

export default function CalendarPage() {
  const { family } = useFamily();
  const { events, loadEvents, createEvent, deleteEvent } = useCalendar();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateEventForm>({ title: '', description: '', date: new Date(), category: 'family' });

  useEffect(() => { if (family?.id) loadEvents(); }, [family?.id, loadEvents]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createEvent(formData);
    setIsDialogOpen(false);
    setFormData({ title: '', description: '', date: new Date(), category: 'family' });
  };

  const monthDays = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const getEventsForDate = (date: Date) => events.filter(e => parseISO(e.date).toDateString() === date.toDateString());
  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <div className="space-y-4 md:space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-bold flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4 md:w-6 md:h-6 text-secondary" />
            </div>
            <span className="hidden sm:inline">Calendrier</span>
          </h1>
          <p className="text-muted-foreground text-sm hidden md:block">{family?.name}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Nouvel événement</span>
              <span className="sm:hidden">Ajouter</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-4">
            <DialogHeader>
              <DialogTitle>Créer un événement</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Titre</label>
                <Input placeholder="Anniversaire..." value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input type="datetime-local" value={format(formData.date, "yyyy-MM-dd'T'HH:mm")} onChange={(e) => setFormData(prev => ({ ...prev, date: new Date(e.target.value) }))} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Catégorie</label>
                  <Select value={formData.category} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v as EventCategory }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full">Créer</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <div className="flex items-center justify-between p-3 md:p-5 border-b border-white/10">
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <h2 className="text-base md:text-xl font-semibold">
            {format(currentMonth, 'MMMM yyyy', { locale: fr })}
          </h2>
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
        <CardContent className="p-2 md:p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
              <div key={d} className="text-center text-xs md:text-sm font-medium text-muted-foreground py-2">{d}</div>
            ))}
          </div>
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: (startOfMonth(currentMonth).getDay() + 6) % 7 }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {monthDays.map(day => {
              const dayEvents = getEventsForDate(day);
              const isSelected = isSameDay(day, selectedDate);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "aspect-square p-1 rounded-lg md:rounded-xl transition-all relative flex flex-col items-center justify-center text-xs md:text-sm",
                    isSelected && "bg-primary text-primary-foreground",
                    !isSelected && isToday(day) && "bg-secondary/20 text-secondary",
                    !isSelected && !isToday(day) && "hover:bg-white/5"
                  )}
                >
                  <span className="font-medium">{format(day, 'd')}</span>
                  {dayEvents.length > 0 && (
                    <div className="absolute bottom-0.5 md:bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                      {dayEvents.slice(0, 3).map(e => (
                        <div key={e.id} className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full" style={{ backgroundColor: isSelected ? 'white' : e.color }} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Events */}
      <Card>
        <CardContent className="p-3 md:p-5">
          <h3 className="font-semibold text-sm md:text-base mb-3">
            {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
          </h3>
          <AnimatePresence mode="wait">
            {selectedDateEvents.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-6">
                <CalendarIcon className="w-8 h-8 md:w-10 md:h-10 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-muted-foreground text-sm">Aucun événement</p>
              </motion.div>
            ) : (
              <motion.div key="events" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                {selectedDateEvents.map(event => (
                  <div key={event.id} className="p-3 rounded-xl border-l-2 bg-white/[0.03]" style={{ borderLeftColor: event.color }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {format(parseISO(event.date), 'HH:mm')}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteEvent(event.id)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}