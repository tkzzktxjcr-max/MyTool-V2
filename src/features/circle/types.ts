export type CircleRole = 'friend' | 'family' | 'sponsor';
export type AlertSeverity = 'info' | 'warning' | 'urgent';
export type AlertType = 'threshold_exceeded' | 'risk_detected' | 'emergency_mode' | 'encouragement';
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';
export type UserStatus = 'sober' | 'drinking' | 'at_risk';

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