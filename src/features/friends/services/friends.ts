import { account, createDocument, listDocuments, updateDocument, Permission, Role, Query } from '@/lib/appwrite';
import { COLLECTIONS } from '@/lib/appwrite';
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
  status: string;
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

// ── Service ───────────────────────────────────────────────────────────

export const friendsService = {
  // Envoyer une demande d'ami
  async sendRequest(inviterId: string, inviterName: string, inviterEmail: string, inviteeEmail: string): Promise<FriendRequest> {
    const currentUser = await account.get();
    if (currentUser.$id !== inviterId) throw new Error('Unauthorized');

    const data: Record<string, unknown> = {
      inviterId,
      inviteeEmail: inviteeEmail.toLowerCase().trim(),
      status: 'pending',
    };
    if (inviterName?.trim()) data.inviterName = inviterName.trim();

    const permissions = [
      Permission.read(Role.user(inviterId)),
      Permission.update(Role.user(inviterId)),
      Permission.delete(Role.user(inviterId)),
    ];

    let doc;
    try {
      doc = await createDocument(COLLECTIONS.CIRCLE_INVITATIONS, data, permissions);
    } catch (err: any) {
      if (err?.code === 400) {
        console.warn('[circle_invitations] createDocument with permissions failed (400). Retrying without permissions.', {
          data,
          originalError: err?.message,
        });
        try {
          doc = await createDocument(COLLECTIONS.CIRCLE_INVITATIONS, data);
        } catch (err2: any) {
          console.error('[circle_invitations] createDocument without permissions also failed', {
            data,
            error: err2?.message,
            code: err2?.code,
          });
          throw err2;
        }
      } else {
        throw err;
      }
    }

    return mapDocToRequest(doc as unknown as InvitationDoc);
  },

  // Mes demandes reçues
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
    return (res.documents as unknown as InvitationDoc[]).map(mapDocToRequest);
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

  // Accepter une demande → crée la relation d'amitié
  async acceptRequest(requestId: string, inviteeId: string, inviteeName: string, inviteeEmail: string): Promise<void> {
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

    await updateDocument(COLLECTIONS.CIRCLE_INVITATIONS, requestId, {
      status: 'accepted',
      inviteeId,
    });

    await createDocument(
      COLLECTIONS.CIRCLE_MEMBERS,
      {
        userId: inviteeId,
        memberId: invitation.inviterId,
        memberName: invitation.inviterName || 'Ami',
        memberEmail: invitation.inviteeEmail,
        isActive: true,
      },
      [
        Permission.read(Role.user(inviteeId)),
        Permission.read(Role.user(invitation.inviterId)),
        Permission.update(Role.user(inviteeId)),
        Permission.delete(Role.user(inviteeId)),
      ]
    );
  },

  // Refuser une demande
  async declineRequest(requestId: string): Promise<void> {
    const currentUser = await account.get();
    const res = await listDocuments(COLLECTIONS.CIRCLE_INVITATIONS, [
      Query.equal('$id', requestId),
      Query.limit(1),
    ]);
    if (res.documents.length === 0) return;
    const invitation = mapDocToRequest(res.documents[0] as unknown as InvitationDoc);
    if (invitation.inviteeEmail.toLowerCase() !== currentUser.email.toLowerCase() && invitation.inviterId !== currentUser.$id) {
      throw new Error('Unauthorized');
    }
    await updateDocument(COLLECTIONS.CIRCLE_INVITATIONS, requestId, { status: 'declined' });
  },

  // Voir les amis (récupère les docs créés PAR mes amis où je suis le memberId)
  // → donc je vois LEURS stats
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
  async syncAcceptedInvitations(userId: string, userName: string, userEmail: string): Promise<void> {
    const currentUser = await account.get();
    if (currentUser.$id !== userId) throw new Error('Unauthorized');
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
  },
};