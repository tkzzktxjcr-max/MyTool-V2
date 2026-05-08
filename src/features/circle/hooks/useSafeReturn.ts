import { useState, useEffect, useRef, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { safetyEventService } from '../services/safetyEvent';
import type { LiveSession, TransportMode, LiveLocation } from '../types';

const STOPPED_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes

export const useSafeReturn = (session: LiveSession | null) => {
  const [isAnomalyDetected, setIsAnomalyDetected] = useState(false);
  const [hasArrived, setHasArrived] = useState(false);

  const lastMovementRef = useRef<number>(Date.now());
  const lastLocationRef = useRef<LiveLocation | null>(null);
  const anomalyTriggeredRef = useRef(false);

  // Detect abnormal stop
  useEffect(() => {
    if (!session?.safeReturnMode || !session.lastLocation) return;

    const checkInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastMove = now - lastMovementRef.current;

      if (timeSinceLastMove > STOPPED_THRESHOLD_MS && !anomalyTriggeredRef.current) {
        anomalyTriggeredRef.current = true;
        setIsAnomalyDetected(true);

        safetyEventService.createEvent({
          sessionId: session.id,
          userId: session.userId,
          type: 'stopped_abnormally',
          severity: 'soft_warning',
          message: 'Tu as fait une pause ? Tout va bien ?',
          location: session.lastLocation,
        });
      }
    }, 60000);

    return () => clearInterval(checkInterval);
  }, [session?.safeReturnMode, session?.id, session?.userId]);

  // Track movement
  useEffect(() => {
    if (!session?.lastLocation) return;

    const prev = lastLocationRef.current;
    const curr = session.lastLocation;

    if (prev) {
      const distance = calculateDistance(prev.lat, prev.lng, curr.lat, curr.lng);
      if (distance > 100) {
        // Significant movement
        lastMovementRef.current = Date.now();
        anomalyTriggeredRef.current = false;
        setIsAnomalyDetected(false);
      }
    }

    lastLocationRef.current = curr;
  }, [session?.lastLocation]);

  const arriveMutation = useMutation({
    mutationFn: () => {
      if (!session?.id || !session.userId) throw new Error('No session');
      return safetyEventService.createEvent({
        sessionId: session.id,
        userId: session.userId,
        type: 'arrived_home',
        severity: 'info',
        message: 'Bien arrivé !',
        location: session.lastLocation,
      });
    },
  });

  const markArrived = useCallback(async () => {
    await arriveMutation.mutateAsync();
    setHasArrived(true);
  }, [arriveMutation]);

  return {
    isAnomalyDetected,
    hasArrived,
    markArrived,
    isLoading: arriveMutation.isPending,
  };
};

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}