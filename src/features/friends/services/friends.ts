import { account, createDocument, listDocuments, updateDocument, Permission, Role, Query } from '@/lib/appwrite';
import { COLLECTIONS } from '@/lib/appwrite';
import { circleService } from '@/features/circle/services/circle';
import type { Friend, FriendRequest } from '../types';

// ── Mappers ───────────────────────────────────────────────────────────

interface MemberDoc {
  $id: string;
  userId: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberAvatar?: string;
  isActive: boolean;
  weeklyUnits?: number;
  soberDays?: number;
  streak?: number;
  lastSummaryUpdate?: string;
  $createdAt: string;
}

interface InvitationDoc {
  $id: string;
  inviterId: string;
  inviterName?: string;
  inviteeEmail: string;
  inviteeId?: string;
  token: string;
  status: string;
  expiresAt: string;
  $createdAt: string;
}

const mapDocToFriend = (doc: MemberDoc): Friend => ({
  id: doc.$id,
  userId: doc.userId,
  memberId: doc.memberId,
  memberName: doc.memberName,
  memberEmail: doc.memberEmail,
  memberAvatar: doc.memberAvatar,
  isActive: doc.isActive,
  weeklyUnits: doc.weeklyUnits,
  soberDays: doc.soberDays,
  streak: doc.streak,
  lastSummaryUpdate: doc.lastSummaryUpdate,
  createdAt: doc.$createdAt,
});

const mapDocToRequest = (doc: InvitationDoc): FriendRequest => ({
  id: doc.$id,
  inviterId: doc.inviterId,
  inviterName: doc.inviterName,
  inviteeEmail: doc.inviteeEmail,
  inviteeId: doc.inviteeId,
  status: doc.status as FriendRequest['status'],
  createdAt: doc.$createdAt,
});

// ── Helpers ───────────────────────────────────────────────────────────

const generateToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const getExpirationDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString();
};

// ── Service ───────────────────────────────────────────────────────────

export const friendsService = {
  // Envoyer une demande d'ami
  async sendRequest(inviterId: string, inviterName: string, _inviterEmail: string, inviteeEmail: string): Promise<FriendRequest> {
    const currentUser = await account.get();
    if (currentUser.$id !== inviterId) throw new Error('Unauthorized');

    const data: Record<string, unknown> = {
      inviterId,
      inviteeEmail: inviteeEmail.toLowerCase().trim(),
      token: generateToken(),
      status: 'pending',
      expiresAt: getExpirationDate(),
    };
    if (inviterName?.trim()) data.inviterName = inviterName.trim();

    const permissions = [
      Permission.read(Role.user(inviterId)),
      Permission.update(Role.user(inviterId)),
      Permission.delete(Role.user(inviterId)),
    ];

    try {
      const doc = await createDocument(COLLECTIONS.CIRCLE_INVITATIONS, data, permissions);
      return mapDocToRequest(doc as unknown as InvitationDoc);
    } catch (err: any) {
      console.error('[friends/sendRequest] createDocument failed', {
        code: err?.code,
        message: err?.message,
        response: err?.response,
        dataSent: data,
      });
      throw err;
    }
  },

  // Mes demandes reçues (filtre celles déjà acceptées via circle_members)
  async getReceivedRequests(inviteeEmail: string): Promise<FriendRequest[]> {
    const currentUser = await account.get();
    if (currentUser.email.toLowerCase() !== inviteeEmail.toLowerCase().trim()) {
      throw new Error('Unauthorized');
    }

    const res = await listDocuments(COLLECTIONS.CIRCLE_INVITATIONS, [
      Query.equal('inviteeEmail', inviteeEmail.toLowerCase().trim()),
      Query.equal('status', 'pending'),
      Query.orderDesc('$createdAt'),
    ]);
    const invitations = (res.documents as unknown as InvitationDoc[]).map(mapDocToRequest);

    // Récupérer les amis déjà acceptés pour filtrer
    const memberRes = await listDocuments(COLLECTIONS.CIRCLE_MEMBERS, [
      Query.equal('userId', currentUser.$id),
      Query.equal('isActive', true),
    ]);
    const acceptedInviterIds = new Set(
      (memberRes.documents as unknown as MemberDoc[]).map(d => d.memberId)
    );

    return invitations.filter(inv => !acceptedInviterIds.has(inv.inviterId));
  },

  // Mes demandes envoyées
  async getSentRequests(inviterId: string): Promise<FriendRequest[]> {
    const currentUser = await account.get();
    if (currentUser.$id !== inviterId) throw new Error('Unauthorized');
    const res = await listDocuments(COLLECTIONS.CIRCLE_INVITATIONS, [
      Query.equal('inviterId', inviterId),
      Query.equal('status', 'pending'),
      Query.orderDesc('$createdAt'),
    ]);
    return (res.documents as unknown as InvitationDoc[]).map(mapDocToRequest);
  },

  // Accepter une demande → crée directement le circle_members (pas d'update sur l'invitation)
  async acceptRequest(requestId: string, inviteeId: string, _inviteeName: string, _inviteeEmail: string): Promise<void> {
    const currentUser = await account.get();
    if (currentUser.$id !== inviteeId) throw new Error('Unauthorized');

    const res = await listDocuments(COLLECTIONS.CIRCLE_INVITATIONS, [
      Query.equal('$id', requestId),
      Query.limit(1),
    ]);
    if (res.documents.length === 0) return;
    const invitation = mapDocToRequest(res.documents[0] as unknown as InvitationDoc);
    if (invitation.inviteeEmail.toLowerCase() !== currentUser.email.toLowerCase()) {
      throw new Error('Unauthorized');
    }

    // Créer le membre directement au lieu de modifier l'invitation
    await circleService.addMember(inviteeId, {
      memberId: invitation.inviterId,
      memberName: invitation.inviterName || 'Ami',
      memberEmail: '',
      role: 'friend',
      permissions: {
        realtimeStatus: false,
        consumptionLevel: false,
        locationOnAlert: false,
        autoAlerts: false,
      },
    });
  },

  // Refuser une demande (l'invité ne peut pas modifier l'invitation, on ignore pour l'instant)
  async declineRequest(_requestId: string): Promise<void> {
    // L'invité n'a pas les droits d'update sur l'invitation.
    // Pour l'instant, on ne fait rien côté invité.
    // L'inviter peut annuler son invitation via deleteInvitation.
    console.log('[friends/declineRequest] ignored — invitee has no update permission');
  },

  // Voir les amis (récupère les docs créés PAR mes amis où je suis le memberId)
  async getFriends(userId: string): Promise<Friend[]> {
    const currentUser = await account.get();
    if (currentUser.$id !== userId) throw new Error('Unauthorized');
    const res = await listDocuments(COLLECTIONS.CIRCLE_MEMBERS, [
      Query.equal('memberId', userId),
      Query.equal('isActive', true),
      Query.orderDesc('$createdAt'),
    ]);
    return (res.documents as unknown as MemberDoc[]).map(mapDocToFriend);
  },

  // Mettre à jour mon résumé partagé (sur tous mes docs)
  async updateMySummary(userId: string, summary: { weeklyUnits: number; soberDays: number; streak: number }): Promise<void> {
    const currentUser = await account.get();
    if (currentUser.$id !== userId) throw new Error('Unauthorized');
    const res = await listDocuments(COLLECTIONS.CIRCLE_MEMBERS, [
      Query.equal('userId', userId),
      Query.equal('isActive', true),
    ]);
    for (const doc of res.documents) {
      await updateDocument(COLLECTIONS.CIRCLE_MEMBERS, doc.$id, {
        weeklyUnits: summary.weeklyUnits,
        soberDays: summary.soberDays,
        streak: summary.streak,
        lastSummaryUpdate: new Date().toISOString(),
      });
    }
  },

  // Supprimer un ami (désactive les deux sens)
  async removeFriend(userId: string, friendId: string): Promise<void> {
    const currentUser = await account.get();
    if (currentUser.$id !== userId) throw new Error('Unauthorized');

    const myDocs = await listDocuments(COLLECTIONS.CIRCLE_MEMBERS, [
      Query.equal('userId', userId),
      Query.equal('memberId', friendId),
    ]);
    for (const doc of myDocs.documents) {
      await updateDocument(COLLECTIONS.CIRCLE_MEMBERS, doc.$id, { isActive: false });
    }

    const hisDocs = await listDocuments(COLLECTIONS.CIRCLE_MEMBERS, [
      Query.equal('userId', friendId),
      Query.equal('memberId', userId),
    ]);
    for (const doc of hisDocs.documents) {
      await updateDocument(COLLECTIONS.CIRCLE_MEMBERS, doc.$id, { isActive: false });
    }
  },

  // Synchroniser : quand mes invitations envoyées sont acceptées, je crée mon doc d'amitié
  async syncAcceptedInvitations(userId: string, _userName: string, _userEmail: string): Promise<void> {
    const currentUser = await account.get();
    if (currentUser.$id !== userId) throw new Error('Unauthorized');

    // 1. Ancienne méthode : invitations marquées "accepted"
    const res = await listDocuments(COLLECTIONS.CIRCLE_INVITATIONS, [
      Query.equal('inviterId', userId),
      Query.equal('status', 'accepted'),
    ]);
    for (const inv of res.documents as unknown as InvitationDoc[]) {
      const existing = await listDocuments(COLLECTIONS.CIRCLE_MEMBERS, [
        Query.equal('userId', userId),
        Query.equal('memberId', inv.inviteeId),
        Query.limit(1),
      ]);
      if (existing.documents.length === 0 && inv.inviteeId) {
        await createDocument(
          COLLECTIONS.CIRCLE_MEMBERS,
          {
            userId,
            memberId: inv.inviteeId,
            memberName: inv.inviterName || 'Ami',
            memberEmail: inv.inviteeEmail,
            isActive: true,
          },
          [
            Permission.read(Role.user(userId)),
            Permission.read(Role.user(inv.inviteeId)),
            Permission.update(Role.user(userId)),
            Permission.delete(Role.user(userId)),
          ]
        );
      }
    }

    // 2. Nouvelle méthode : détecter les circle_members créés par l'invité (memberId = moi)
    const memberRes = await listDocuments(COLLECTIONS.CIRCLE_MEMBERS, [
      Query.equal('memberId', userId),
      Query.equal('isActive', true),
    ]);
    for (const doc of memberRes.documents as unknown as MemberDoc[]) {
      const existing = await listDocuments(COLLECTIONS.CIRCLE_MEMBERS, [
        Query.equal('userId', userId),
        Query.equal('memberId', doc.userId),
        Query.limit(1),
      ]);
      if (existing.documents.length === 0) {
        await createDocument(
          COLLECTIONS.CIRCLE_MEMBERS,
          {
            userId,
            memberId: doc.userId,
            memberName: doc.memberName || 'Ami',
            memberEmail: doc.memberEmail,
            isActive: true,
          },
          [
            Permission.read(Role.user(userId)),
            Permission.read(Role.user(doc.userId)),
            Permission.update(Role.user(userId)),
            Permission.delete(Role.user(userId)),
          ]
        );
      }
    }
  },
};