"use client";

import { useState, useCallback } from 'react';
import { 
  createDocument, 
  listDocuments, 
  updateDocument, 
  deleteDocument,
  COLLECTIONS,
} from '@/lib/appwrite';
import { useFamily } from '@/contexts/FamilyContext';
import type { CalendarEvent, CreateEventForm, EventCategory } from '@/types';

export const useCalendar = () => {
  const { family } = useFamily();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const loadEvents = useCallback(async (startDate?: Date, endDate?: Date) => {
    if (!family?.id) return;

    setLoading(true);
    try {
      const queries = [`familyId=${family.id}`];
      
      const response = await listDocuments(COLLECTIONS.EVENTS, queries);
      
      setEvents(
        response.documents.map(doc => ({
          id: doc.$id,
          familyId: doc.familyId,
          title: doc.title,
          description: doc.description,
          date: doc.date,
          endDate: doc.endDate,
          color: doc.color,
          category: doc.category as EventCategory,
          assignedTo: doc.assignedTo,
          reminder: doc.reminder,
          createdBy: doc.createdBy,
        }))
      );
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  }, [family?.id]);

  const createEvent = async (form: CreateEventForm): Promise<CalendarEvent> => {
    if (!family?.id) throw new Error('No family selected');

    const eventColors: Record<EventCategory, string> = {
      family: '#FF6B6B',
      school: '#4ECDC4',
      work: '#45B7D1',
      leisure: '#FFE66D',
      medical: '#96CEB4',
      other: '#95A5A6',
    };

    const doc = await createDocument(COLLECTIONS.EVENTS, {
      familyId: family.id,
      title: form.title,
      description: form.description,
      date: form.date.toISOString(),
      endDate: form.endDate?.toISOString(),
      color: eventColors[form.category],
      category: form.category,
      assignedTo: form.assignedTo,
      reminder: form.reminder || false,
      createdBy: family.ownerId,
    });

    const event: CalendarEvent = {
      id: doc.$id,
      familyId: doc.familyId,
      title: doc.title,
      description: doc.description,
      date: doc.date,
      endDate: doc.endDate,
      color: doc.color,
      category: doc.category as EventCategory,
      assignedTo: doc.assignedTo,
      reminder: doc.reminder,
      createdBy: doc.createdBy,
    };

    setEvents(prev => [...prev, event]);
    return event;
  };

  const updateEvent = async (eventId: string, data: Partial<CreateEventForm>): Promise<void> => {
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.date !== undefined) updateData.date = data.date.toISOString();
    if (data.endDate !== undefined) updateData.endDate = data.endDate?.toISOString();
    if (data.category !== undefined) updateData.category = data.category;
    if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo;
    if (data.reminder !== undefined) updateData.reminder = data.reminder;

    await updateDocument(COLLECTIONS.EVENTS, eventId, updateData);

    setEvents(prev =>
      prev.map(e =>
        e.id === eventId
          ? { ...e, ...updateData, date: updateData.date as string, endDate: updateData.endDate as string | undefined }
          : e
      )
    );
  };

  const deleteEvent = async (eventId: string): Promise<void> => {
    await deleteDocument(COLLECTIONS.EVENTS, eventId);
    setEvents(prev => prev.filter(e => e.id !== eventId));
  };

  const getEventsByDate = (date: Date): CalendarEvent[] => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(e => e.date.split('T')[0] === dateStr);
  };

  return {
    events,
    loading,
    loadEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventsByDate,
  };
};