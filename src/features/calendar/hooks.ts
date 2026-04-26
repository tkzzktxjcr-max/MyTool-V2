import { useState, useCallback, useEffect } from 'react';
import { useFamily } from '@/features/family/context';
import { useAuth } from '@/features/auth/context';
import { calendarService } from './service';
import type { CalendarEvent, CreateEventForm } from './types';

export const useCalendar = () => {
  const { family } = useFamily();
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const loadEvents = useCallback(async () => {
    if (!family?.id) return;
    setLoading(true);
    try {
      const data = await calendarService.getEvents(family.id);
      setEvents(data);
    } finally {
      setLoading(false);
    }
  }, [family?.id]);

  const createEvent = async (form: CreateEventForm): Promise<CalendarEvent> => {
    if (!family?.id || !user) throw new Error('No family or user');
    const event = await calendarService.createEvent(family.id, user.$id, form);
    setEvents(prev => [...prev, event]);
    return event;
  };

  const deleteEvent = async (eventId: string): Promise<void> => {
    await calendarService.deleteEvent(eventId);
    setEvents(prev => prev.filter(e => e.id !== eventId));
  };

  useEffect(() => { if (family?.id) loadEvents(); }, [family?.id, loadEvents]);

  return { events, loading, loadEvents, createEvent, deleteEvent };
};
