import { account, createDocument, listDocuments, updateDocument, Query, Permission, Role } from '@/lib/appwrite';
import { COLLECTIONS } from '@/lib/appwrite';
import type { SafetyEvent, SafetyEventType, SafetySeverity, LiveLocation } from '../types';

interface SafetyEventDoc {
  $id: string;
  sessionId: string;
  userId: string;
  type: string;
  severity: string;
  message: string;
  location?: string;
  isResolved: boolean;
  $createdAt: string;
}

const mapDocToEvent = (doc: SafetyEventDoc): SafetyEvent => ({
  id: doc.$id,
  sessionId: doc.sessionId,
  userId: doc.userId,
  type: doc.type as SafetyEventType,
  severity: doc.severity as SafetySeverity,
  message: doc.message,
  location: doc.location ? JSON.parse(doc.location) : undefined,
  isResolved: doc.isResolved,
  createdAt: doc.$createdAt,
});

export const safetyEventService = {
  async createEvent(data: {
    sessionId: string;
    userId: string;
    type: SafetyEventType;
    severity: SafetySeverity;
    message: string;
    location?: LiveLocation;
  }): Promise<SafetyEvent> {
    const currentUser = await account.get();
    if (currentUser.$id !== data.userId) throw new Error('Unauthorized');

    const doc = await createDocument(
      COLLECTIONS.SAFETY_EVENTS,
      {
        sessionId: data.sessionId,
        userId: data.userId,
        type: data.type,
        severity: data.severity,
        message: data.message,
        location: data.location ? JSON.stringify(data.location) : null,
        isResolved: false,
      },
      [
        Permission.read(Role.users()),
        Permission.update(Role.user(data.userId)),
        Permission.delete(Role.user(data.userId)),
      ]
    );
    return mapDocToEvent(doc as unknown as SafetyEventDoc);
  },

  async getEventsForCircle(circleId: string, limit: number = 50): Promise<SafetyEvent[]> {
    const response = await listDocuments(COLLECTIONS.SAFETY_EVENTS, [
      Query.equal('circleId', circleId),
      Query.orderDesc('$createdAt'),
      Query.limit(limit),
    ]);
    return (response.documents as unknown as SafetyEventDoc[]).map(mapDocToEvent);
  },

  async getEventsForSession(sessionId: string): Promise<SafetyEvent[]> {
    const response = await listDocuments(COLLECTIONS.SAFETY_EVENTS, [
      Query.equal('sessionId', sessionId),
      Query.orderDesc('$createdAt'),
    ]);
    return (response.documents as unknown as SafetyEventDoc[]).map(mapDocToEvent);
  },

  async resolveEvent(eventId: string): Promise<void> {
    const currentUser = await account.get();
    const res = await listDocuments(COLLECTIONS.SAFETY_EVENTS, [
      Query.equal('$id', eventId),
      Query.limit(1),
    ]);
    if (res.documents.length === 0) return;
    const doc = res.documents[0] as unknown as SafetyEventDoc;
    if (doc.userId !== currentUser.$id) throw new Error('Unauthorized');
    await updateDocument(COLLECTIONS.SAFETY_EVENTS, eventId, { isResolved: true });
  },
};