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
  { value: 'family', label: 'Famille', color: '#FF6B6B' },
  { value: 'school', label: 'École', color: '#4ECDC4' },
  { value: 'work', label: 'Travail', color: '#45B7D1' },
  { value: 'leisure', label: 'Loisirs', color: '#FFE66D' },
  { value: 'medical', label: 'Médical', color: '#96CEB4' },
  { value: 'other', label: 'Autre', color: '#95A5A6' },
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
    <div className="space-y-6 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-secondary" />
            </div>
            Calendrier
          </h1>
          <p className="text-muted-foreground mt-1">{family?.name}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel événement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un événement</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Titre</label>
                <Input 
                  placeholder="Anniversaire, réunion..." 
                  value={formData.title} 
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input 
                    type="datetime-local" 
                    value={format(formData.date, "yyyy-MM-dd'T'HH:mm")} 
                    onChange={(e) => setFormData(prev => ({ ...prev, date: new Date(e.target.value) }))} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Catégorie</label>
                  <Select value={formData.category} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v as EventCategory }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.value} value={c.value}>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                            {c.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full">Créer</Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card>
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-xl font-semibold">
                {format(currentMonth, 'MMMM yyyy', { locale: fr })}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <CardContent className="p-5">
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
                  <div key={d} className="text-center text-sm font-medium text-muted-foreground py-2">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: (startOfMonth(currentMonth).getDay() + 6) % 7 }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                {monthDays.map((day, i) => {
                  const dayEvents = getEventsForDate(day);
                  const isSelected = isSameDay(day, selectedDate);
                  return (
                    <motion.button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "aspect-square p-2 rounded-xl transition-all relative flex flex-col items-center justify-center",
                        isSelected && "bg-primary text-primary-foreground",
                        !isSelected && isToday(day) && "bg-secondary/20 text-secondary",
                        !isSelected && !isToday(day) && "hover:bg-white/5"
                      )}
                    >
                      <span className="text-sm font-medium">{format(day, 'd')}</span>
                      {dayEvents.length > 0 && (
                        <div className="flex gap-0.5 mt-1">
                          {dayEvents.slice(0, 3).map(e => (
                            <div 
                              key={e.id} 
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: isSelected ? 'white' : e.color }}
                            />
                          ))}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Selected Date Events */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full">
            <CardContent className="p-5">
              <h3 className="font-semibold text-lg mb-4">
                {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
              </h3>
              <AnimatePresence mode="wait">
                {selectedDateEvents.length === 0 ? (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12"
                  >
                    <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground">Aucun événement</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="events"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    {selectedDateEvents.map(event => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="p-4 rounded-xl border-l-4 bg-white/[0.03]"
                        style={{ borderLeftColor: event.color }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{event.title}</h4>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {format(parseISO(event.date), 'HH:mm')}
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={() => deleteEvent(event.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}