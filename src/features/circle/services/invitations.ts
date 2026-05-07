import { account, createDocument, listDocuments, updateDocument, deleteDocument, Query, Permission, Role } from '@/lib/appwrite';
import { COLLECTIONS } from '@/lib/appwrite';
import type { CircleInvitation, InvitationStatus } from '../types';

interface InvitationDoc {
  $id: string;
  inviterId: string;
  inviterName?: string;
  inviteeEmail: string;
  inviteeId?: string;
  token: string;
  status: string;
  message?: string;
  expiresAt: string;
  $createdAt: string;
}

const mapDocToInvitation = (doc: InvitationDoc): CircleInvitation => ({
  id: doc.$id,
  inviterId: doc.inviterId,
  inviterName: doc.inviterName,
  inviteeEmail: doc.inviteeEmail,
  inviteeId: doc.inviteeId,
  token: doc.token,
  status: doc.status as InvitationStatus,
  message: doc.message,
  expiresAt: doc.expiresAt,
  createdAt: doc.$createdAt,
});

const generateToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const getExpirationDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString();
};

export const invitationService = {
  async createInvitation(inviterId: string, inviteeEmail: string, inviterName?: string, message?: string): Promise<CircleInvitation> {
    const currentUser = await account.get();
    if (currentUser.$id !== inviterId) throw new Error('Unauthorized');

    const token = generateToken();

    const data: Record<string, unknown> = {
      inviterId,
      inviteeEmail: inviteeEmail.toLowerCase().trim(),
      token,
      status: 'pending',
      expiresAt: getExpirationDate(),
    };

    if (inviterName?.trim()) data.inviterName = inviterName.trim();
    if (message?.trim()) data.message = message.trim();

    const permissions = [
      Permission.read(Role.user(inviterId)),
      Permission.update(Role.user(inviterId)),
      Permission.delete(Role.user(inviterId)),
    ];

    try {
      const doc = await createDocument(COLLECTIONS.CIRCLE_INVITATIONS, data, permissions);
      return mapDocToInvitation(doc as unknown as InvitationDoc);
    } catch (err: any) {
      console.error('[circle_invitations] createDocument failed', {
        code: err?.code,
        type: err?.type,
        message: err?.message,
        response: err?.response,
        dataSent: data,
        permissionsSent: permissions,
      });
      throw err;
    }
  },

  async getSentInvitations(inviterId: string): Promise<CircleInvitation[]> {
    const currentUser = await account.get();
    if (currentUser.$id !== inviterId) throw new Error('Unauthorized');
    const response = await listDocuments(COLLECTIONS.CIRCLE_INVITATIONS, [
      Query.equal('inviterId', inviterId),
      Query.orderDesc('$createdAt'),
    ]);
    return (response.documents as unknown as InvitationDoc[]).map(mapDocToInvitation);
  },

  async getReceivedInvitations(inviteeEmail: string): Promise<CircleInvitation[]> {
    const currentUser = await account.get();
    if (currentUser.email.toLowerCase() !== inviteeEmail.toLowerCase().trim()) {
      throw new Error('Unauthorized');
    }
    const response = await listDocuments(COLLECTIONS.CIRCLE_INVITATIONS, [
      Query.equal('inviteeEmail', inviteeEmail.toLowerCase().trim()),
      Query.equal('status', 'pending'),
      Query.greaterThanEqual('expiresAt', new Date().toISOString()),
    ]);
    return (response.documents as unknown as InvitationDoc[]).map(mapDocToInvitation);
  },

  async acceptInvitation(invitationId: string, inviteeId: string): Promise<void> {
    const currentUser = await account.get();
    if (currentUser.$id !== inviteeId) throw new Error('Unauthorized');
    const response = await listDocuments(COLLECTIONS.CIRCLE_INVITATIONS, [
      Query.equal('$id', invitationId),
      Query.limit(1),
    ]);
    if (response.documents.length === 0) throw new Error('Invitation not found');
    const inv = response.documents[0] as unknown as InvitationDoc;
    if (inv.inviteeEmail.toLowerCase() !== currentUser.email.toLowerCase()) {
      throw new Error('Unauthorized');
    }
    await updateDocument(COLLECTIONS.CIRCLE_INVITATIONS, invitationId, {
      status: 'accepted',
      inviteeId,
    });
  },

  async declineInvitation(invitationId: string): Promise<void> {
    const currentUser = await account.get();
    const response = await listDocuments(COLLECTIONS.CIRCLE_INVITATIONS, [
      Query.equal('$id', invitationId),
      Query.limit(1),
    ]);
    if (response.documents.length === 0) return;
    const inv = response.documents[0] as unknown as InvitationDoc;
    if (inv.inviteeEmail.toLowerCase() !== currentUser.email.toLowerCase() && inv.inviterId !== currentUser.$id) {
      throw new Error('Unauthorized');
    }
    await updateDocument(COLLECTIONS.CIRCLE_INVITATIONS, invitationId, { status: 'declined' });
  },

  async expireOldInvitations(): Promise<void> {
    const response = await listDocuments(COLLECTIONS.CIRCLE_INVITATIONS, [
      Query.equal('status', 'pending'),
      Query.lessThan('expiresAt', new Date().toISOString()),
    ]);
    for (const doc of response.documents) {
      await updateDocument(COLLECTIONS.CIRCLE_INVITATIONS, doc.$id, { status: 'expired' });
    }
  },

  async getInvitationByToken(token: string): Promise<CircleInvitation | null> {
    const currentUser = await account.get();
    const response = await listDocuments(COLLECTIONS.CIRCLE_INVITATIONS, [
      Query.equal('token', token),
      Query.equal('status', 'pending'),
      Query.limit(1),
    ]);
    if (response.documents.length === 0) return null;
    const inv = mapDocToInvitation(response.documents[0] as unknown as InvitationDoc);
    if (inv.inviterId !== currentUser.$id && inv.inviteeEmail.toLowerCase() !== currentUser.email.toLowerCase()) {
      throw new Error('Unauthorized');
    }
    return inv;
  },

  async deleteInvitation(invitationId: string): Promise<void> {
    const currentUser = await account.get();
    const response = await listDocuments(COLLECTIONS.CIRCLE_INVITATIONS, [
      Query.equal('$id', invitationId),
      Query.limit(1),
    ]);
    if (response.documents.length === 0) return;
    const inv = response.documents[0] as unknown as InvitationDoc;
    if (inv.inviterId !== currentUser.$id) throw new Error('Unauthorized');
    await deleteDocument(COLLECTIONS.CIRCLE_INVITATIONS, invitationId);
  },
};