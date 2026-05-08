export type CircleRole = 'friend' | 'family' | 'sponsor';
export type AlertSeverity = 'info' | 'warning' | 'urgent';
export type AlertType = 'threshold_exceeded' | 'risk_detected' | 'emergency_mode' | 'encouragement';
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';
export type UserStatus = 'sober' | 'drinking' | 'at_risk';

export type LiveAccuracy = 'precise' | 'approximate';
export type LiveStatus = 'ok' | 'heading_home' | 'need_help' | 'low_battery';
export type TransportMode = 'walk' | 'bike' | 'car' | 'transit';
export type SafetyEventType = 'stopped_abnormally' | 'low_battery' | 'isolated' | 'manual_check_in' | 'arrived_home';
export type SafetySeverity = 'info' | 'soft_warning';

export interface CirclePermissions {
  realtimeStatus: boolean;
  consumptionLevel: boolean;
  locationOnAlert: boolean;
  autoAlerts: boolean;
}

export interface CircleMember {
  id: string;
  userId: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberAvatar?: string;
  role: CircleRole;
  permissions: CirclePermissions;
  isActive: boolean;
  liveSessionId?: string;
  createdAt: string;
}

export interface CircleInvitation {
  id: string;
  inviterId: string;
  inviterName?: string;
  inviteeEmail: string;
  inviteeId?: string;
  token: string;
  status: InvitationStatus;
  message?: string;
  expiresAt: string;
  createdAt: string;
}

export interface CircleAlert {
  id: string;
  userId: string;
  userName: string;
  alertType: AlertType;
  severity: AlertSeverity;
  message: string;
  locationData?: { lat: number; lng: number; timestamp: string };
  isRead: boolean;
  createdAt: string;
}

export interface EmergencySession {
  id: string;
  userId: string;
  isActive: boolean;
  duration: number;
  startedAt: string;
  expiresAt: string;
  memberIds: string[];
}

export interface SharedStatus {
  userId: string;
  userName: string;
  status: UserStatus;
  currentBAC?: number;
  weeklyUnits: number;
  weeklyLimit: number;
  streak: number;
  lastUpdated: string;
}

// Live Circle types
export interface LiveLocation {
  lat: number;
  lng: number;
  timestamp: string;
}

export interface LiveSession {
  id: string;
  userId: string;
  circleId: string;
  isActive: boolean;
  accuracy: LiveAccuracy;
  durationMinutes: number;
  startedAt: string;
  expiresAt: string;
  status: LiveStatus;
  lastLocation?: LiveLocation;
  batteryLevel?: number;
  eta?: string;
  safeReturnMode: boolean;
  safeReturnDestination?: LiveLocation & { address?: string };
  safeReturnTransportMode?: TransportMode;
  userName?: string;
}

export interface SafetyEvent {
  id: string;
  sessionId: string;
  userId: string;
  type: SafetyEventType;
  severity: SafetySeverity;
  message: string;
  location?: LiveLocation;
  isResolved: boolean;
  createdAt: string;
}

export interface EmergencyAlert {
  id: string;
  userId: string;
  circleId: string;
  location?: LiveLocation;
  isActive: boolean;
  resolvedAt?: string;
  createdAt: string;
}