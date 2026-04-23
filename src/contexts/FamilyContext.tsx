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
  Query,
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

// Secure invite code generation using crypto
const generateSecureInviteCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  const randomValues = new Uint8Array(6);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < 6; i++) {
    code += chars[randomValues[i] % chars.length];
  }
  return code;
};

export const FamilyProvider = ({ children }: { children: ReactNode }) => {
  const { profile, refreshProfile } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(false);

  // Debug: log profile changes
  useEffect(() => {
    console.log('[DEBUG] Profile updated:', profile);
  }, [profile]);

  const loadFamily = useCallback(async () => {
    if (!profile?.familyId) {
      setFamily(null);
      setMembers([]);
      return;
    }

    setLoading(true);
    try {
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

      const membersResponse = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        COLLECTIONS.FAMILY_MEMBERS,
        [Query.equal('familyId', profile.familyId)]
      );
      
      const familyMembers = membersResponse.documents.map((doc: any) => ({
        id: doc.$id,
        familyId: doc.familyId,
        userId: doc.userId,
        role: doc.role,
        name: doc.name,
        avatar: doc.avatar,
      }));
      
      setMembers(familyMembers);
    } catch (error: any) {
      console.error('Error loading family:', error?.message || error);
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
    console.log('[DEBUG] createFamily called, profile:', profile);
    
    if (!profile) {
      console.error('[DEBUG] No profile, throwing error');
      throw new Error('Not authenticated');
    }

    const inviteCode = generateSecureInviteCode();
    console.log('[DEBUG] Generated code:', inviteCode);

    try {
      console.log('[DEBUG] Calling createDocument for families');
      console.log('[DEBUG] Collection:', COLLECTIONS.FAMILIES);
      console.log('[DEBUG] Database:', APPWRITE_CONFIG.databaseId);
      
      const familyDoc = await createDocument(COLLECTIONS.FAMILIES, {
        name,
        ownerId: profile.userId,
        inviteCode,
        monthlyBudget: monthlyBudget || 0,
        createdAt: new Date().toISOString(),
      });

      console.log('[DEBUG] Family created successfully:', familyDoc.$id);

      // Ajouter le créateur comme premier membre admin
      console.log('[DEBUG] Adding member to family');
      await createDocument(COLLECTIONS.FAMILY_MEMBERS, {
        familyId: familyDoc.$id,
        userId: profile.userId,
        role: 'admin',
        name: profile.name,
        avatar: profile.avatar,
      });

      // Mettre à jour le profil utilisateur
      console.log('[DEBUG] Updating user profile');
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
    } catch (error: any) {
      console.error('[DEBUG] Error creating family:', error?.message || error, error?.response);
      throw new Error(error?.message || 'Erreur lors de la création de la famille');
    }
  };

  const joinFamily = async (inviteCode: string): Promise<void> => {
    if (!profile) throw new Error('Not authenticated');

    const familiesResponse = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      COLLECTIONS.FAMILIES,
      [Query.equal('inviteCode', inviteCode.toUpperCase())]
    );

    if (familiesResponse.documents.length === 0) {
      throw new Error('Code invitation invalide');
    }

    const familyDoc = familiesResponse.documents[0];

    const existingMembership = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      COLLECTIONS.FAMILY_MEMBERS,
      [
        Query.equal('familyId', familyDoc.$id),
        Query.equal('userId', profile.userId)
      ]
    );

    if (existingMembership.documents.length > 0) {
      throw new Error('Vous êtes déjà membre de cette famille');
    }

    await createDocument(COLLECTIONS.FAMILY_MEMBERS, {
      familyId: familyDoc.$id,
      userId: profile.userId,
      role: 'member',
      name: profile.name,
      avatar: profile.avatar,
    });

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

    const membershipsResponse = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      COLLECTIONS.FAMILY_MEMBERS,
      [
        Query.equal('familyId', profile.familyId),
        Query.equal('userId', profile.userId)
      ]
    );

    if (membershipsResponse.documents.length > 0) {
      await deleteDocument(COLLECTIONS.FAMILY_MEMBERS, membershipsResponse.documents[0].$id);
    }

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
    const memberToRemove = members.find(m => m.id === memberId);
    const currentUserMember = members.find(m => m.userId === profile?.userId);
    
    if (!currentUserMember || currentUserMember.role !== 'admin') {
      throw new Error('Seuls les administrateurs peuvent retirer des membres');
    }
    
    if (memberToRemove?.role === 'admin' && members.filter(m => m.role === 'admin').length <= 1) {
      throw new Error('Impossible de retirer le dernier administrateur');
    }

    await deleteDocument(COLLECTIONS.FAMILY_MEMBERS, memberId);
    await loadFamily();
  };

  const generateInviteCode = async (): Promise<string> => {
    if (!family) throw new Error('No family selected');

    const newCode = generateSecureInviteCode();

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