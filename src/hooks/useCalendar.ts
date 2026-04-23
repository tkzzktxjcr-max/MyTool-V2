"use client";

import { useState, useCallback } from 'react';
import { 
  createDocument, 
  listDocuments, 
  deleteDocument,
  COLLECTIONS,
  databases,
  APPWRITE_CONFIG,
  Query,
} from '@/lib/appwrite';
import { useFamily } from '@/contexts/FamilyContext';
import type { CalendarEvent, CreateEventForm, EventCategory } from '@/types';

export const useCalendar = () => {
  const { family } = useFamily();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const loadEvents = useCallback(async () => {
    if (!family?.id) return;

    setLoading(true);
    try {
      // Use proper server-side query filtering
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        COLLECTIONS.EVENTS,
        [Query.equal('familyId', family.id)]
      );
      
      const familyEvents = response.documents.map((doc: any) => ({
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
      }));
      
      setEvents(familyEvents);
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

    const doc: any = await createDocument(COLLECTIONS.EVENTS, {
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

  const deleteEvent = async (eventId: string): Promise<void> => {
    await deleteDocument(COLLECTIONS.EVENTS, eventId);
    setEvents(prev => prev.filter(e => e.id !== eventId));
  };

  return {
    events,
    loading,
    loadEvents,
    createEvent,
    deleteEvent,
  };
};