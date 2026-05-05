import { createDocument, listDocuments, updateDocument, deleteDocument, Query } from '@/lib/appwrite';
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

const getExpirationDate = (days: number = 7): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

export const invitationService = {
  async createInvitation(inviterId: string, inviteeEmail: string, inviterName?: string, message?: string): Promise<CircleInvitation> {
    const token = generateToken();
    const doc: InvitationDoc = await createDocument(COLLECTIONS.CIRCLE_INVITATIONS, {
      inviterId,
      inviterName: inviterName || null,
      inviteeEmail: inviteeEmail.toLowerCase().trim(),
      token,
      status: 'pending',
      message: message || null,
      expiresAt: getExpirationDate(),
    }) as InvitationDoc;
    return mapDocToInvitation(doc);
  },

  async getSentInvitations(inviterId: string): Promise<CircleInvitation[]> {
    const response = await listDocuments(COLLECTIONS.CIRCLE_INVITATIONS, [
      Query.equal('inviterId', inviterId),
      Query.orderDesc('$createdAt'),
    ]);
    return (response.documents as InvitationDoc[]).map(mapDocToInvitation);
  },

  async getReceivedInvitations(inviteeEmail: string): Promise<CircleInvitation[]> {
    const response = await listDocuments(COLLECTIONS.CIRCLE_INVITATIONS, [
      Query.equal('inviteeEmail', inviteeEmail.toLowerCase().trim()),
      Query.equal('status', 'pending'),
      Query.greaterThanEqual('expiresAt', new Date().toISOString()),
    ]);
    return (response.documents as InvitationDoc[]).map(mapDocToInvitation);
  },

  async acceptInvitation(invitationId: string, inviteeId: string): Promise<void> {
    await updateDocument(COLLECTIONS.CIRCLE_INVITATIONS, invitationId, {
      status: 'accepted',
      inviteeId,
    });
  },

  async declineInvitation(invitationId: string): Promise<void> {
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
    const response = await listDocuments(COLLECTIONS.CIRCLE_INVITATIONS, [
      Query.equal('token', token),
      Query.equal('status', 'pending'),
      Query.limit(1),
    ]);
    if (response.documents.length === 0) return null;
    return mapDocToInvitation(response.documents[0] as InvitationDoc);
  },

  async deleteInvitation(invitationId: string): Promise<void> {
    await deleteDocument(COLLECTIONS.CIRCLE_INVITATIONS, invitationId);
  },
};