import { useState, useEffect, useCallback, useRef } from 'react';

export interface GeolocationState {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

export interface UseGeolocationOptions {
  accuracy?: 'precise' | 'approximate';
  enabled?: boolean;
  minDistanceMeters?: number;
  throttleMs?: number;
}

export const useGeolocation = (options: UseGeolocationOptions = {}) => {
  const {
    accuracy = 'approximate',
    enabled = false,
    minDistanceMeters = accuracy === 'precise' ? 10 : 50,
    throttleMs = 30000,
  } = options;

  const [position, setPosition] = useState<GeolocationState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);

  const lastPositionRef = useRef<GeolocationState | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const watchIdRef = useRef<number | null>(null);

  // Battery monitoring
  useEffect(() => {
    if (!enabled) return;
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      });
    }
  }, [enabled]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handlePosition = useCallback(
    (geoPos: GeolocationPosition) => {
      const now = Date.now();
      const coords = geoPos.coords;

      const newPos: GeolocationState = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        altitude: coords.altitude,
        heading: coords.heading,
        speed: coords.speed,
        timestamp: geoPos.timestamp,
      };

      const lastPos = lastPositionRef.current;
      const timeSinceLastUpdate = now - lastUpdateRef.current;

      // Throttling check
      if (timeSinceLastUpdate < throttleMs) {
        // Allow through if significant movement even during throttle
        if (lastPos) {
          const distance = calculateDistance(
            lastPos.latitude,
            lastPos.longitude,
            newPos.latitude,
            newPos.longitude
          );
          if (distance < minDistanceMeters) return;
        } else {
          return;
        }
      }

      lastPositionRef.current = newPos;
      lastUpdateRef.current = now;
      setPosition(newPos);
      setError(null);
    },
    [minDistanceMeters, throttleMs]
  );

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Géolocalisation non supportée');
      return;
    }

    setIsTracking(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePosition,
      (err) => {
        setError(err.message);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: accuracy === 'precise',
        maximumAge: throttleMs,
        timeout: 15000,
      }
    );
  }, [accuracy, handlePosition, throttleMs]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  // Auto start/stop based on enabled
  useEffect(() => {
    if (enabled) {
      startTracking();
    } else {
      stopTracking();
    }
    return () => stopTracking();
  }, [enabled, startTracking, stopTracking]);

  // Pause when tab hidden to save battery
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && isTracking) {
        // Don't clear watch, just let throttling handle reduced updates
        // But we can increase throttle by updating lastUpdateRef
        lastUpdateRef.current = Date.now();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isTracking]);

  return {
    position,
    error,
    isTracking,
    batteryLevel,
    startTracking,
    stopTracking,
  };
};