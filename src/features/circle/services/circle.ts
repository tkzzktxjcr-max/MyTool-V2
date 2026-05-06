import { createDocument, listDocuments, updateDocument, deleteDocument, Query, Permission, Role } from '@/lib/appwrite';
import { COLLECTIONS } from '@/lib/appwrite';
import type { CircleMember, CirclePermissions, CircleRole } from '../types';

interface MemberDoc {
  $id: string;
  userId: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberAvatar?: string;
  role: string;
  permissions: string;
  isActive: boolean;
  $createdAt: string;
}

const mapDocToMember = (doc: MemberDoc): CircleMember => ({
  id: doc.$id,
  userId: doc.userId,
  memberId: doc.memberId,
  memberName: doc.memberName,
  memberEmail: doc.memberEmail,
  memberAvatar: doc.memberAvatar,
  role: doc.role as CircleRole,
  permissions: JSON.parse(doc.permissions || '{}') as CirclePermissions,
  isActive: doc.isActive,
  createdAt: doc.$createdAt,
});

const defaultPermissions = (): CirclePermissions => ({
  realtimeStatus: false,
  consumptionLevel: false,
  locationOnAlert: false,
  autoAlerts: false,
});

export const circleService = {
  async getMembers(userId: string): Promise<CircleMember[]> {
    const response = await listDocuments(COLLECTIONS.CIRCLE_MEMBERS, [
      Query.equal('userId', userId),
      Query.equal('isActive', true),
    ]);
    return (response.documents as MemberDoc[]).map(mapDocToMember);
  },

  async getMemberById(memberId: string): Promise<CircleMember | null> {
    const response = await listDocuments(COLLECTIONS.CIRCLE_MEMBERS, [
      Query.equal('$id', memberId),
      Query.limit(1),
    ]);
    if (response.documents.length === 0) return null;
    return mapDocToMember(response.documents[0] as MemberDoc);
  },

  async addMember(userId: string, data: {
    memberId: string;
    memberName: string;
    memberEmail: string;
    role?: CircleRole;
    permissions?: CirclePermissions;
  }): Promise<CircleMember> {
    // Document-level security: only the circle owner (userId) can update or delete this member
    const docPermissions = [
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ];

    const doc: MemberDoc = await createDocument(
      COLLECTIONS.CIRCLE_MEMBERS,
      {
        userId,
        memberId: data.memberId,
        memberName: data.memberName,
        memberEmail: data.memberEmail,
        role: data.role || 'friend',
        permissions: JSON.stringify(data.permissions || defaultPermissions()),
        isActive: true,
      },
      docPermissions
    ) as MemberDoc;
    return mapDocToMember(doc);
  },

  async updatePermissions(memberId: string, permissions: CirclePermissions): Promise<void> {
    await updateDocument(COLLECTIONS.CIRCLE_MEMBERS, memberId, {
      permissions: JSON.stringify(permissions),
    });
  },

  async revokeMember(memberId: string): Promise<void> {
    await updateDocument(COLLECTIONS.CIRCLE_MEMBERS, memberId, { isActive: false });
  },

  async deleteMember(memberId: string): Promise<void> {
    await deleteDocument(COLLECTIONS.CIRCLE_MEMBERS, memberId);
  },

  async getCirclesWhereMember(memberId: string): Promise<CircleMember[]> {
    const response = await listDocuments(COLLECTIONS.CIRCLE_MEMBERS, [
      Query.equal('memberId', memberId),
      Query.equal('isActive', true),
    ]);
    return (response.documents as MemberDoc[]).map(mapDocToMember);
  },
};