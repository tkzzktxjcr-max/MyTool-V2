import { createDocument, listDocuments, updateDocument, deleteDocument, Query } from '@/lib/appwrite';
import { COLLECTIONS } from '@/lib/appwrite';
import type { EmergencySession } from '../types';

interface EmergencyDoc {
  $id: string;
  userId: string;
  isActive: boolean;
  duration: number;
  startedAt: string;
  expiresAt: string;
  memberIds: string;
  $createdAt: string;
}

const mapDocToSession = (doc: EmergencyDoc): EmergencySession => ({
  id: doc.$id,
  userId: doc.userId,
  isActive: doc.isActive,
  duration: doc.duration,
  startedAt: doc.startedAt,
  expiresAt: doc.expiresAt,
  memberIds: JSON.parse(doc.memberIds || '[]'),
});

export const emergencyService = {
  async startSession(userId: string, duration: number, memberIds: string[]): Promise<EmergencySession> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + duration * 60 * 60 * 1000);
    
    const doc = await createDocument(COLLECTIONS.CIRCLE_EMERGENCY, {
      userId,
      isActive: true,
      duration,
      startedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      memberIds: JSON.stringify(memberIds),
    });
    return mapDocToSession(doc as unknown as EmergencyDoc);
  },

  async getActiveSession(userId: string): Promise<EmergencySession | null> {
    const response = await listDocuments(COLLECTIONS.CIRCLE_EMERGENCY, [
      Query.equal('userId', userId),
      Query.equal('isActive', true),
      Query.limit(1),
    ]);
    if (response.documents.length === 0) return null;
    
    const session = mapDocToSession(response.documents[0] as unknown as EmergencyDoc);
    if (new Date(session.expiresAt) < new Date()) {
      await this.deactivateSession(session.id);
      return null;
    }
    return session;
  },

  async deactivateSession(sessionId: string): Promise<void> {
    await updateDocument(COLLECTIONS.CIRCLE_EMERGENCY, sessionId, { isActive: false });
  },

  async deleteSession(sessionId: string): Promise<void> {
    await deleteDocument(COLLECTIONS.CIRCLE_EMERGENCY, sessionId);
  },

  async cleanupExpiredSessions(): Promise<void> {
    const response = await listDocuments(COLLECTIONS.CIRCLE_EMERGENCY, [
      Query.equal('isActive', true),
      Query.lessThan('expiresAt', new Date().toISOString()),
    ]);
    for (const doc of response.documents) {
      await updateDocument(COLLECTIONS.CIRCLE_EMERGENCY, doc.$id, { isActive: false });
    }
  },
};