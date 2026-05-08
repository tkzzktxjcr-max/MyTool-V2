import L from 'leaflet';
import type { LiveSession, LiveStatus } from '../types';

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

export function createMemberIcon(session: LiveSession): L.DivIcon {
  const status = session.status || 'ok';
  const color = STATUS_COLORS[status];
  const emoji = STATUS_EMOJI[status];
  const name = session.userName || 'Ami';

  const html = `
    <div style="
      position: relative;
      width: 48px;
      height: 48px;
    ">
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
        position: absolute;
        top: 0;
        left: 0;
      ">
        ${emoji}
      </div>
      ${session.safeReturnMode ? `
        <div style="
          position: absolute;
          bottom: 0;
          right: 0;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #3B82F6;
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
        ">🏠</div>
      ` : ''}
      <div style="
        position: absolute;
        bottom: -20px;
        left: 50%;
        transform: translateX(-50%);
        white-space: nowrap;
        background: rgba(0,0,0,0.7);
        color: white;
        padding: 2px 8px;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 500;
      ">${name}</div>
    </div>
  `;

  return L.divIcon({
    className: 'member-marker',
    html,
    iconSize: [48, 68],
    iconAnchor: [24, 44],
    popupAnchor: [0, -44],
  });
}