import { databases, APPWRITE_CONFIG, COLLECTIONS, createDocument, deleteDocument, Query } from '@/lib/appwrite';
import type { CalendarEvent, CreateEventForm, EventCategory } from './types';

export const EVENT_COLORS: Record<EventCategory, string> = { family: '#FF6B6B', school: '#4ECDC4', work: '#45B7D1', leisure: '#FFE66D', medical: '#96CEB4', other: '#95A5A6' };

export const calendarService = {
  async getEvents(familyId: string): Promise<CalendarEvent[]> {
    const response = await databases.listDocuments(APPWRITE_CONFIG.databaseId, COLLECTIONS.EVENTS, [Query.equal('familyId', familyId)]);
    return response.documents.map((doc: any) => ({ id: doc.$id, familyId: doc.familyId, title: doc.title, description: doc.description, date: doc.date, endDate: doc.endDate, color: doc.color, category: doc.category, assignedTo: doc.assignedTo, reminder: doc.reminder, createdBy: doc.createdBy }));
  },

  async createEvent(familyId: string, ownerId: string, form: CreateEventForm): Promise<CalendarEvent> {
    const doc = await createDocument(COLLECTIONS.EVENTS, { familyId, title: form.title, description: form.description, date: form.date.toISOString(), endDate: form.endDate?.toISOString(), color: EVENT_COLORS[form.category], category: form.category, assignedTo: form.assignedTo, reminder: form.reminder || false, createdBy: ownerId });
    return { id: doc.$id, familyId: doc.familyId, title: doc.title, description: doc.description, date: doc.date, endDate: doc.endDate, color: doc.color, category: doc.category, assignedTo: doc.assignedTo, reminder: doc.reminder, createdBy: doc.createdBy };
  },

  async deleteEvent(eventId: string): Promise<void> { await deleteDocument(COLLECTIONS.EVENTS, eventId); },
};