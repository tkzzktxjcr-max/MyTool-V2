import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { client, APPWRITE_CONFIG, COLLECTIONS } from '@/lib/appwrite';
import { liveSessionService } from '../services/liveSession';
import type { LiveSession } from '../types';

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
  accuracy: doc.accuracy as any,
  durationMinutes: doc.durationMinutes,
  startedAt: doc.startedAt,
  expiresAt: doc.expiresAt,
  status: doc.status as any,
  lastLocation: doc.lastLocation ? JSON.parse(doc.lastLocation) : undefined,
  batteryLevel: doc.batteryLevel,
  eta: doc.eta,
  safeReturnMode: doc.safeReturnMode,
  safeReturnDestination: doc.safeReturnDestination ? JSON.parse(doc.safeReturnDestination) : undefined,
  safeReturnTransportMode: doc.safeReturnTransportMode as any,
  userName: doc.userName,
});

export const useLiveLocations = (circleId: string | undefined) => {
  const [realtimeSessions, setRealtimeSessions] = useState<LiveSession[]>([]);

  // Initial fetch
  const sessionsQuery = useQuery({
    queryKey: ['live-locations', circleId],
    queryFn: () => (circleId ? liveSessionService.getActiveSessions(circleId) : Promise.resolve([])),
    enabled: !!circleId,
    staleTime: 30000,
    refetchInterval: 30000,
  });

  const baseSessions = sessionsQuery.data ?? [];
  const allSessions = realtimeSessions.length > 0 ? realtimeSessions : baseSessions;

  // Realtime subscription
  useEffect(() => {
    if (!circleId) return;

    const channel = `databases.${APPWRITE_CONFIG.databaseId}.collections.${COLLECTIONS.LIVE_SESSIONS}.documents`;

    const unsubscribe = client.subscribe(channel, (response) => {
      const events = response.events;
      const payload = response.payload as LiveSessionDoc;

      if (!payload || payload.circleId !== circleId) return;

      setRealtimeSessions((prev) => {
        // Remove existing entry for this session
        const filtered = prev.filter((s) => s.id !== payload.$id);

        if (events.some((e) => e.includes('.create') || e.includes('.update'))) {
          if (payload.isActive && new Date(payload.expiresAt) > new Date()) {
            return [...filtered, mapDocToSession(payload)];
          }
        }

        return filtered;
      });
    });

    return () => unsubscribe();
  }, [circleId]);

  // Merge and deduplicate
  const mergedSessions = [...baseSessions, ...realtimeSessions].reduce((acc, session) => {
    const existing = acc.find((s) => s.id === session.id);
    if (!existing) {
      acc.push(session);
    } else if (new Date(session.expiresAt) > new Date(existing.expiresAt)) {
      const idx = acc.indexOf(existing);
      acc[idx] = session;
    }
    return acc;
  }, [] as LiveSession[]);

  const activeSessions = mergedSessions.filter(
    (s) => s.isActive && new Date(s.expiresAt) > new Date()
  );

  return {
    sessions: activeSessions,
    isLoading: sessionsQuery.isLoading,
    memberCount: activeSessions.length,
  };
};