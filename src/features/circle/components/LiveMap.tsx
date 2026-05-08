import { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import { MapPin, Navigation } from 'lucide-react';
import type { LiveSession, LiveStatus } from '../types';

interface LiveMapProps {
  sessions: LiveSession[];
  mySession?: LiveSession | null;
  onCenterGroup?: () => void;
}

const STATUS_COLORS: Record<LiveStatus, string> = {
  ok: '#22C55E',
  heading_home: '#3B82F6',
  need_help: '#F97316',
  low_battery: '#EAB308',
};

const STATUS_EMOJI: Record<LiveStatus, string> = {
  ok: '👍',
  heading_home: '🏠',
  need_help: '⚠️',
  low_battery: '🔋',
};

export default function LiveMap({ sessions, mySession, onCenterGroup }: LiveMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  const isDark = useMemo(() => {
    const hour = new Date().getHours();
    return hour >= 20 || hour < 6;
  }, []);

  const activeSessions = sessions.filter((s) => s.lastLocation);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([48.8566, 2.3522], 13);

    L.tileLayer(
      isDark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution: isDark ? '&copy; CartoDB' : '&copy; OpenStreetMap',
      }
    ).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [isDark]);

  // Update markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const currentIds = new Set<string>();

    activeSessions.forEach((session) => {
      if (!session.lastLocation) return;
      currentIds.add(session.id);

      const lat = session.lastLocation.lat;
      const lng = session.lastLocation.lng;
      const status = session.status || 'ok';
      const color = STATUS_COLORS[status];
      const emoji = STATUS_EMOJI[status];
      const name = session.userName || 'Ami';

      const iconHtml = `
        <div style="
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${color}22, ${color}44);
          border: 3px solid ${color};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          box-shadow: 0 2px 12px ${color}66;
          position: relative;
        ">
          ${emoji}
          ${session.safeReturnMode ? `<div style="
            position: absolute;
            bottom: -4px;
            right: -4px;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #3B82F6;
            border: 2px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
          ">🏠</div>` : ''}
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-marker',
        html: iconHtml,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      if (markersRef.current[session.id]) {
        markersRef.current[session.id].setLatLng([lat, lng]);
        markersRef.current[session.id].setIcon(icon);
      } else {
        const marker = L.marker([lat, lng], { icon }).addTo(map);
        marker.bindPopup(`<b>${name}</b><br/>${getStatusLabel(status)}`);
        markersRef.current[session.id] = marker;
      }
    });

    // Remove stale markers
    Object.keys(markersRef.current).forEach((id) => {
      if (!currentIds.has(id)) {
        map.removeLayer(markersRef.current[id]);
        delete markersRef.current[id];
      }
    });

    // Fit bounds if multiple markers
    const markerPositions = activeSessions
      .filter((s) => s.lastLocation)
      .map((s) => [s.lastLocation!.lat, s.lastLocation!.lng] as L.LatLngExpression);

    if (markerPositions.length > 1) {
      const bounds = L.latLngBounds(markerPositions);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    } else if (markerPositions.length === 1) {
      map.setView(markerPositions[0], 15);
    }
  }, [activeSessions]);

  const handleCenter = () => {
    const map = mapRef.current;
    if (!map) return;

    const positions = activeSessions
      .filter((s) => s.lastLocation)
      .map((s) => [s.lastLocation!.lat, s.lastLocation!.lng] as L.LatLngExpression);

    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
    onCenterGroup?.();
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/10" style={{ height: 320 }}>
      <div ref={containerRef} className="w-full h-full" />

      {/* Overlay controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-2 z-[400]">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleCenter}
          className="w-10 h-10 rounded-xl bg-card/90 backdrop-blur border border-white/20 flex items-center justify-center shadow-lg"
        >
          <Navigation className="w-5 h-5 text-primary" />
        </motion.button>
      </div>

      {/* Member count badge */}
      {activeSessions.length > 0 && (
        <div className="absolute top-3 left-3 z-[400]">
          <div className="px-3 py-1.5 rounded-xl bg-card/90 backdrop-blur border border-white/20 flex items-center gap-2 shadow-lg">
            <MapPin className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium">{activeSessions.length} en ligne</span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {activeSessions.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-[300]">
          <div className="text-center">
            <MapPin className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">Personne ne partage sa position</p>
          </div>
        </div>
      )}
    </div>
  );
}

function getStatusLabel(status: LiveStatus): string {
  switch (status) {
    case 'ok': return 'Tout va bien';
    case 'heading_home': return 'Je rentre';
    case 'need_help': return 'Besoin d\'aide';
    case 'low_battery': return 'Batterie faible';
    default: return '';
  }
}