"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { 
  databases, 
  APPWRITE_CONFIG, 
  COLLECTIONS, 
  createDocument,
  listDocuments,
  updateDocument,
  deleteDocument,
  ID,
} from '@/lib/appwrite';
import { useAuth } from './AuthContext';
import type { Family, FamilyMember } from '@/types';

interface FamilyContextType {
  family: Family | null;
  members: FamilyMember[];
  loading: boolean;
  createFamily: (name: string, monthlyBudget?: number) => Promise<Family>;
  joinFamily: (inviteCode: string) => Promise<void>;
  leaveFamily: () => Promise<void>;
  addMember: (name: string, role: 'admin' | 'member') => Promise<FamilyMember>;
  removeMember: (memberId: string) => Promise<void>;
  generateInviteCode: () => Promise<string>;
  refreshFamily: () => Promise<void>;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export const FamilyProvider = ({ children }: { children: ReactNode }) => {
  const { profile, refreshProfile } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFamily = useCallback(async () => {
    if (!profile?.familyId) {
      setFamily(null);
      setMembers([]);
      return;
    }

    setLoading(true);
    try {
      // Charger la famille
      const familyDoc = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        COLLECTIONS.FAMILIES,
        profile.familyId
      );
      
      setFamily({
        id: familyDoc.$id,
        name: familyDoc.name,
        ownerId: familyDoc.ownerId,
        inviteCode: familyDoc.inviteCode,
        monthlyBudget: familyDoc.monthlyBudget,
        createdAt: familyDoc.$createdAt,
      });

      // Charger les membres - filtrer côté client
      const membersResponse = await listDocuments(COLLECTIONS.FAMILY_MEMBERS);
      const familyMembers = membersResponse.documents
        .filter((doc: any) => doc.familyId === profile.familyId)
        .map((doc: any) => ({
          id: doc.$id,
          familyId: doc.familyId,
          userId: doc.userId,
          role: doc.role,
          name: doc.name,
          avatar: doc.avatar,
        }));
      
      setMembers(familyMembers);
    } catch (error) {
      console.error('Error loading family:', error);
      setFamily(null);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [profile?.familyId]);

  useEffect(() => {
    loadFamily();
  }, [loadFamily]);

  const createFamily = async (name: string, monthlyBudget?: number): Promise<Family> => {
    if (!profile) throw new Error('Not authenticated');

    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const familyDoc = await createDocument(COLLECTIONS.FAMILIES, {
      name,
      ownerId: profile.userId,
      inviteCode,
      monthlyBudget: monthlyBudget || 0,
      createdAt: new Date().toISOString(),
    });

    // Ajouter le créateur comme premier membre admin
    await createDocument(COLLECTIONS.FAMILY_MEMBERS, {
      familyId: familyDoc.$id,
      userId: profile.userId,
      role: 'admin',
      name: profile.name,
      avatar: profile.avatar,
    });

    // Mettre à jour le profil utilisateur
    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      COLLECTIONS.USERS_PROFILE,
      profile.id,
      { familyId: familyDoc.$id }
    );

    await refreshProfile();
    await loadFamily();

    return {
      id: familyDoc.$id,
      name: familyDoc.name,
      ownerId: familyDoc.ownerId,
      inviteCode: familyDoc.inviteCode,
      monthlyBudget: familyDoc.monthlyBudget,
      createdAt: familyDoc.$createdAt,
    };
  };

  const joinFamily = async (inviteCode: string): Promise<void> => {
    if (!profile) throw new Error('Not authenticated');

    // Trouver la famille avec ce code - filtrer côté client
    const familiesResponse = await listDocuments(COLLECTIONS.FAMILIES);
    const familyDoc = familiesResponse.documents.find(
      (doc: any) => doc.inviteCode === inviteCode
    );

    if (!familyDoc) {
      throw new Error('Code invitation invalide');
    }

    // Ajouter le membre
    await createDocument(COLLECTIONS.FAMILY_MEMBERS, {
      familyId: familyDoc.$id,
      userId: profile.userId,
      role: 'member',
      name: profile.name,
      avatar: profile.avatar,
    });

    // Mettre à jour le profil
    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      COLLECTIONS.USERS_PROFILE,
      profile.id,
      { familyId: familyDoc.$id }
    );

    await refreshProfile();
    await loadFamily();
  };

  const leaveFamily = async (): Promise<void> => {
    if (!profile || !profile.familyId) return;

    // Trouver le membership - filtrer côté client
    const membershipsResponse = await listDocuments(COLLECTIONS.FAMILY_MEMBERS);
    const membership = membershipsResponse.documents.find(
      (doc: any) => doc.familyId === profile.familyId && doc.userId === profile.userId
    );

    if (membership) {
      await deleteDocument(COLLECTIONS.FAMILY_MEMBERS, membership.$id);
    }

    // Retirer la famille du profil
    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      COLLECTIONS.USERS_PROFILE,
      profile.id,
      { familyId: null }
    );

    await refreshProfile();
    setFamily(null);
    setMembers([]);
  };

  const addMember = async (name: string, role: 'admin' | 'member'): Promise<FamilyMember> => {
    if (!family) throw new Error('No family selected');

    const memberDoc = await createDocument(COLLECTIONS.FAMILY_MEMBERS, {
      familyId: family.id,
      userId: '',
      role,
      name,
      avatar: null,
    });

    await loadFamily();

    return {
      id: memberDoc.$id,
      familyId: memberDoc.familyId,
      userId: memberDoc.userId,
      role: memberDoc.role,
      name: memberDoc.name,
      avatar: memberDoc.avatar,
    };
  };

  const removeMember = async (memberId: string): Promise<void> => {
    await deleteDocument(COLLECTIONS.FAMILY_MEMBERS, memberId);
    await loadFamily();
  };

  const generateInviteCode = async (): Promise<string> => {
    if (!family) throw new Error('No family selected');

    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    await updateDocument(COLLECTIONS.FAMILIES, family.id, {
      inviteCode: newCode,
    });

    await loadFamily();
    return newCode;
  };

  const refreshFamily = async (): Promise<void> => {
    await loadFamily();
  };

  return (
    <FamilyContext.Provider 
      value={{ 
        family, 
        members, 
        loading, 
        createFamily, 
        joinFamily, 
        leaveFamily,
        addMember,
        removeMember,
        generateInviteCode,
        refreshFamily,
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
};

export const useFamily = () => {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
};