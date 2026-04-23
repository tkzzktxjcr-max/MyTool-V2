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
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
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
  const getEventsForDate = (date: Date) => events.filter(e => e.date.split('T')[0] === format(date, 'yyyy-MM-dd'));
  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold flex items-center gap-3"><CalendarIcon className="h-8 w-8 text-secondary" />Calendrier</h1><p className="text-muted-foreground">{family?.name}</p></div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Nouvel événement</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Créer un événement</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2"><label className="text-sm font-medium">Titre</label><Input placeholder="Anniversaire" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-sm font-medium">Date</label><Input type="datetime-local" value={format(formData.date, "yyyy-MM-dd'T'HH:mm")} onChange={(e) => setFormData(prev => ({ ...prev, date: new Date(e.target.value) }))} required /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Catégorie</label><Select value={formData.category} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v as EventCategory }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <Button type="submit" className="w-full">Créer</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between p-5">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft className="h-5 w-5" /></Button>
            <h2 className="text-xl font-semibold">{format(currentMonth, 'MMMM yyyy', { locale: fr })}</h2>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight className="h-5 w-5" /></Button>
          </div>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => <div key={d} className="text-center text-sm font-medium text-muted-foreground py-2">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: (startOfMonth(currentMonth).getDay() + 6) % 7 }).map((_, i) => <div key={`empty-${i}`} className="aspect-square" />)}
              {monthDays.map(day => {
                const dayEvents = getEventsForDate(day);
                const isSelected = isSameDay(day, selectedDate);
                return (
                  <button key={day.toISOString()} onClick={() => setSelectedDate(day)} className={cn("aspect-square p-1 rounded-xl transition-all relative", isSelected && "bg-primary text-primary-foreground", !isSelected && isToday(day) && "bg-secondary/10", !isSelected && !isToday(day) && "hover:bg-muted")}>
                    <span className="text-sm font-medium">{format(day, 'd')}</span>
                    {dayEvents.length > 0 && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">{dayEvents.slice(0, 3).map(e => <div key={e.id} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: e.color }} />)}</div>}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold mb-4">{format(selectedDate, 'EEEE d MMMM', { locale: fr })}</h3>
            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-8"><CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" /><p className="text-muted-foreground">Aucun événement</p></div>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map(event => (
                  <div key={event.id} className="p-4 rounded-xl border-l-4" style={{ borderLeftColor: event.color }}>
                    <div className="flex justify-between">
                      <div><h4 className="font-medium">{event.title}</h4><div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{format(new Date(event.date), 'HH:mm')}</div></div>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteEvent(event.id)}><X className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}