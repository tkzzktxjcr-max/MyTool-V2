export type EventCategory = 'family' | 'school' | 'work' | 'leisure' | 'medical' | 'other';

export interface CalendarEvent {
  id: string;
  familyId: string;
  title: string;
  description?: string;
  date: string;
  endDate?: string;
  color?: string;
  category: EventCategory;
  assignedTo?: string;
  reminder?: boolean;
  createdBy: string;
}

export interface CreateEventForm {
  title: string;
  description?: string;
  date: Date;
  endDate?: Date;
  category: EventCategory;
  assignedTo?: string;
  reminder?: boolean;
}

export const EVENT_COLORS: Record<EventCategory, string> = {
  family: '#FF6B6B',
  school: '#4ECDC4',
  work: '#45B7D1',
  leisure: '#FFE66D',
  medical: '#96CEB4',
  other: '#95A5A6',
};