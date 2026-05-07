export interface Friend {
  id: string;
  userId: string;        // celui qui partage ses stats (le créateur du doc)
  memberId: string;      // l'ami qui peut voir ces stats
  memberName: string;
  memberEmail: string;
  memberAvatar?: string;
  isActive: boolean;
  // Résumé hebdomadaire partagé
  weeklyUnits?: number;
  soberDays?: number;
  streak?: number;
  lastSummaryUpdate?: string;
  createdAt: string;
}

export interface FriendRequest {
  id: string;
  inviterId: string;
  inviterName?: string;
  inviteeEmail: string;
  inviteeId?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface FriendSummary {
  userId: string;
  userName: string;
  weeklyUnits: number;
  soberDays: number;
  streak: number;
  lastUpdated: string;
}