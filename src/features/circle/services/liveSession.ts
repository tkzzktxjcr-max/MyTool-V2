import { account, createDocument, listDocuments, updateDocument, deleteDocument, Query, Permission, Role } from '@/lib/appwrite';
import { COLLECTIONS, APPWRITE_CONFIG } from '@/lib/appwrite';
import type { LiveSession, LiveLocation, LiveAccuracy, LiveStatus, TransportMode } from '../types';

interface LiveSessionDoc {
  $id: string;
  userId: string;
  circleId: string;
  isActive: boolean;
  accuracy: string;
  durationMinutes: number;
  startedAt: string;
  expiresAt: string;
  status: string;
  lastLocation?: string;
  batteryLevel?: number;
  eta?: string;
  safeReturnMode: boolean;
  safeReturnDestination?: string;
  safeReturnTransportMode?: string;
  userName?: string;
}

const mapDocToSession = (doc: LiveSessionDoc): LiveSession => ({
  id: doc.$id,
  userId: doc.userId,
  circleId: doc.circleId,
  isActive: doc.isActive,
  accuracy: doc.accuracy as LiveAccuracy,
  durationMinutes: doc.durationMinutes,
  startedAt: doc.startedAt,
  expiresAt: doc.expiresAt,
  status: doc.status as LiveStatus,
  lastLocation: doc.lastLocation ? JSON.parse(doc.lastLocation) : undefined,
  batteryLevel: doc.batteryLevel,
  eta: doc.eta,
  safeReturnMode: doc.safeReturnMode,
  safeReturnDestination: doc.safeReturnDestination ? JSON.parse(doc.safeReturnDestination) : undefined,
  safeReturnTransportMode: doc.safeReturnTransportMode as TransportMode,
  userName: doc.userName,
});

const getExpirationDate = (durationMinutes: number): string => {
  if (durationMinutes < 0) return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Default 24h for unlimited
  return new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
};

export const liveSessionService = {
  async createSession(data: {
    userId: string;
    circleId: string;
    accuracy: LiveAccuracy;
    durationMinutes: number;
    userName?: string;
  }): Promise<LiveSession> {
    const currentUser = await account.get();
    if (currentUser.$id !== data.userId) throw new Error('Unauthorized');

    const now = new Date().toISOString();
    const expiresAt = getExpirationDate(data.durationMinutes);

    const doc = await createDocument(
      COLLECTIONS.LIVE_SESSIONS,
      {
        userId: data.userId,
        circleId: data.circleId,
        isActive: true,
        accuracy: data.accuracy,
        durationMinutes: data.durationMinutes,
        startedAt: now,
        expiresAt,
        status: 'ok',
        lastLocation: null,
        batteryLevel: null,
        eta: null,
        safeReturnMode: false,
        safeReturnDestination: null,
        safeReturnTransportMode: null,
        userName: data.userName || currentUser.name || 'Moi',
      }
    );
    return mapDocToSession(doc as unknown as LiveSessionDoc);
  },

  async updateLocation(sessionId: string, location: LiveLocation): Promise<void> {
    const currentUser = await account.get();
    const res = await listDocuments(COLLECTIONS.LIVE_SESSIONS, [
      Query.equal('$id', sessionId),
      Query.limit(1),
    ]);
    if (res.documents.length === 0) return;
    const doc = res.documents[0] as unknown as LiveSessionDoc;
    if (doc.userId !== currentUser.$id) throw new Error('Unauthorized');

    await updateDocument(COLLECTIONS.LIVE_SESSIONS, sessionId, {
      lastLocation: JSON.stringify(location),
    });
  },

  async updateStatus(sessionId: string, status: LiveStatus): Promise<void> {
    const currentUser = await account.get();
    const res = await listDocuments(COLLECTIONS.LIVE_SESSIONS, [
      Query.equal('$id', sessionId),
      Query.limit(1),
    ]);
    if (res.documents.length === 0) return;
    const doc = res.documents[0] as unknown as LiveSessionDoc;
    if (doc.userId !== currentUser.$id) throw new Error('Unauthorized');

    await updateDocument(COLLECTIONS.LIVE_SESSIONS, sessionId, { status });
  },

  async updateBattery(sessionId: string, level: number): Promise<void> {
    const currentUser = await account.get();
    const res = await listDocuments(COLLECTIONS.LIVE_SESSIONS, [
      Query.equal('$id', sessionId),
      Query.limit(1),
    ]);
    if (res.documents.length === 0) return;
    const doc = res.documents[0] as unknown as LiveSessionDoc;
    if (doc.userId !== currentUser.$id) throw new Error('Unauthorized');

    await updateDocument(COLLECTIONS.LIVE_SESSIONS, sessionId, { batteryLevel: level });
  },

  async startSafeReturn(sessionId: string, data: {
    transportMode: TransportMode;
    destination?: LiveLocation & { address?: string };
  }): Promise<void> {
    const currentUser = await account.get();
    const res = await listDocuments(COLLECTIONS.LIVE_SESSIONS, [
      Query.equal('$id', sessionId),
      Query.limit(1),
    ]);
    if (res.documents.length === 0) return;
    const doc = res.documents[0] as unknown as LiveSessionDoc;
    if (doc.userId !== currentUser.$id) throw new Error('Unauthorized');

    await updateDocument(COLLECTIONS.LIVE_SESSIONS, sessionId, {
      safeReturnMode: true,
      safeReturnTransportMode: data.transportMode,
      safeReturnDestination: data.destination ? JSON.stringify(data.destination) : null,
      status: 'heading_home',
    });
  },

  async stopSafeReturn(sessionId: string): Promise<void> {
    const currentUser = await account.get();
    const res = await listDocuments(COLLECTIONS.LIVE_SESSIONS, [
      Query.equal('$id', sessionId),
      Query.limit(1),
    ]);
    if (res.documents.length === 0) return;
    const doc = res.documents[0] as unknown as LiveSessionDoc;
    if (doc.userId !== currentUser.$id) throw new Error('Unauthorized');

    await updateDocument(COLLECTIONS.LIVE_SESSIONS, sessionId, {
      safeReturnMode: false,
      safeReturnTransportMode: null,
      safeReturnDestination: null,
      status: 'ok',
    });
  },

  async stopSession(sessionId: string): Promise<void> {
    const currentUser = await account.get();
    const res = await listDocuments(COLLECTIONS.LIVE_SESSIONS, [
      Query.equal('$id', sessionId),
      Query.limit(1),
    ]);
    if (res.documents.length === 0) return;
    const doc = res.documents[0] as unknown as LiveSessionDoc;
    if (doc.userId !== currentUser.$id) throw new Error('Unauthorized');

    await updateDocument(COLLECTIONS.LIVE_SESSIONS, sessionId, {
      isActive: false,
      status: 'ok',
    });
  },

  async getActiveSessions(circleId: string): Promise<LiveSession[]> {
    const now = new Date().toISOString();
    const response = await listDocuments(COLLECTIONS.LIVE_SESSIONS, [
      Query.equal('circleId', circleId),
      Query.equal('isActive', true),
      Query.greaterThanEqual('expiresAt', now),
      Query.orderDesc('$updatedAt'),
    ]);
    return (response.documents as unknown as LiveSessionDoc[]).map(mapDocToSession);
  },

  async getActiveSessionsForIds(circleIds: string[]): Promise<LiveSession[]> {
    if (circleIds.length === 0) return [];
    const now = new Date().toISOString();
    const response = await listDocuments(COLLECTIONS.LIVE_SESSIONS, [
      Query.in('circleId', circleIds),
      Query.equal('isActive', true),
      Query.greaterThanEqual('expiresAt', now),
      Query.orderDesc('$updatedAt'),
    ]);
    return (response.documents as unknown as LiveSessionDoc[]).map(mapDocToSession);
  },

  async getMyActiveSession(userId: string): Promise<LiveSession | null> {
    const currentUser = await account.get();
    if (currentUser.$id !== userId) throw new Error('Unauthorized');
    const now = new Date().toISOString();
    const response = await listDocuments(COLLECTIONS.LIVE_SESSIONS, [
      Query.equal('userId', userId),
      Query.equal('isActive', true),
      Query.greaterThanEqual('expiresAt', now),
      Query.limit(1),
    ]);
    if (response.documents.length === 0) return null;
    return mapDocToSession(response.documents[0] as unknown as LiveSessionDoc);
  },

  async cleanupExpiredSessions(): Promise<void> {
    const now = new Date().toISOString();
    const response = await listDocuments(COLLECTIONS.LIVE_SESSIONS, [
      Query.equal('isActive', true),
      Query.lessThan('expiresAt', now),
    ]);
    for (const doc of response.documents) {
      await updateDocument(COLLECTIONS.LIVE_SESSIONS, doc.$id, { isActive: false });
    }
  },
};