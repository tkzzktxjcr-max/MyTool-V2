import { databases, APPWRITE_CONFIG, COLLECTIONS, createDocument, updateDocument, deleteDocument, Query } from '@/lib/appwrite';
import type { Family, FamilyMember } from './types';

const generateSecureInviteCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const randomValues = new Uint8Array(6);
  crypto.getRandomValues(randomValues);
  return Array.from(randomValues, (v) => chars[v % chars.length]).join('');
};

export const familyService = {
  async getFamily(familyId: string): Promise<Family | null> {
    try {
      const doc = await databases.getDocument(APPWRITE_CONFIG.databaseId, COLLECTIONS.FAMILIES, familyId);
      return { id: doc.$id, name: doc.name, ownerId: doc.ownerId, inviteCode: doc.inviteCode, monthlyBudget: doc.monthlyBudget, createdAt: doc.$createdAt };
    } catch { return null; }
  },

  async getMembers(familyId: string): Promise<FamilyMember[]> {
    const response = await databases.listDocuments(APPWRITE_CONFIG.databaseId, COLLECTIONS.FAMILY_MEMBERS, [Query.equal('familyId', familyId)]);
    return response.documents.map((doc: any) => ({ id: doc.$id, familyId: doc.familyId, userId: doc.userId, role: doc.role, name: doc.name, avatar: doc.avatar }));
  },

  async createFamily(ownerId: string, name: string, monthlyBudget?: number): Promise<Family> {
    const inviteCode = generateSecureInviteCode();
    const doc = await createDocument(COLLECTIONS.FAMILIES, { name, ownerId, inviteCode, monthlyBudget: monthlyBudget || 0, createdAt: new Date().toISOString() });
    await createDocument(COLLECTIONS.FAMILY_MEMBERS, { familyId: doc.$id, userId: ownerId, role: 'admin', name: '', avatar: null });
    return { id: doc.$id, name: doc.name, ownerId: doc.ownerId, inviteCode: doc.inviteCode, monthlyBudget: doc.monthlyBudget, createdAt: doc.$createdAt };
  },

  async joinFamily(userId: string, inviteCode: string): Promise<Family> {
    const response = await databases.listDocuments(APPWRITE_CONFIG.databaseId, COLLECTIONS.FAMILIES, [Query.equal('inviteCode', inviteCode.toUpperCase())]);
    if (response.documents.length === 0) throw new Error('Code invalide');
    const familyDoc = response.documents[0];
    await createDocument(COLLECTIONS.FAMILY_MEMBERS, { familyId: familyDoc.$id, userId, role: 'member', name: '', avatar: null });
    return { id: familyDoc.$id, name: familyDoc.name, ownerId: familyDoc.ownerId, inviteCode: familyDoc.inviteCode, monthlyBudget: familyDoc.monthlyBudget, createdAt: familyDoc.$createdAt };
  },

  async removeMember(memberId: string): Promise<void> { await deleteDocument(COLLECTIONS.FAMILY_MEMBERS, memberId); },
  async generateNewCode(familyId: string): Promise<string> { const newCode = generateSecureInviteCode(); await updateDocument(COLLECTIONS.FAMILIES, familyId, { inviteCode: newCode }); return newCode; },
};