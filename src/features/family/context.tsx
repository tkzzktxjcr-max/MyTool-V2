"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { databases, APPWRITE_CONFIG, COLLECTIONS } from '@/lib/appwrite';
import { useAuth } from '@/features/auth/context';
import { familyService } from './service';
import type { FamilyContextType, Family, FamilyMember } from './types';

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export const FamilyProvider = ({ children }: { children: ReactNode }) => {
  const { profile, refreshProfile } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFamily = useCallback(async () => {
    if (!profile?.familyId) { setFamily(null); setMembers([]); return; }
    setLoading(true);
    try {
      const familyData = await familyService.getFamily(profile.familyId);
      const membersData = await familyService.getMembers(profile.familyId);
      setFamily(familyData);
      setMembers(membersData);
    } catch { setFamily(null); setMembers([]); }
    finally { setLoading(false); }
  }, [profile?.familyId]);

  useEffect(() => { loadFamily(); }, [loadFamily]);

  const createFamily = async (name: string, monthlyBudget?: number): Promise<Family> => {
    if (!profile) throw new Error('Not authenticated');
    const newFamily = await familyService.createFamily(profile.userId, name, monthlyBudget);
    await databases.updateDocument(APPWRITE_CONFIG.databaseId, COLLECTIONS.USERS_PROFILE, profile.id, { familyId: newFamily.id });
    await refreshProfile();
    await loadFamily();
    return newFamily;
  };

  const joinFamily = async (inviteCode: string): Promise<void> => {
    if (!profile) throw new Error('Not authenticated');
    const newFamily = await familyService.joinFamily(profile.userId, inviteCode);
    await databases.updateDocument(APPWRITE_CONFIG.databaseId, COLLECTIONS.USERS_PROFILE, profile.id, { familyId: newFamily.id });
    await refreshProfile();
    await loadFamily();
  };

  const leaveFamily = async (): Promise<void> => {
    if (!profile || !profile.familyId) return;
    await databases.updateDocument(APPWRITE_CONFIG.databaseId, COLLECTIONS.USERS_PROFILE, profile.id, { familyId: null });
    await refreshProfile();
    setFamily(null);
    setMembers([]);
  };

  const removeMember = async (memberId: string): Promise<void> => { await familyService.removeMember(memberId); await loadFamily(); };
  const generateInviteCode = async (): Promise<string> => { if (!family) throw new Error('No family'); const newCode = await familyService.generateNewCode(family.id); await loadFamily(); return newCode; };
  const refreshFamily = async (): Promise<void> => { await loadFamily(); };

  return (
    <FamilyContext.Provider value={{ family, members, loading, createFamily, joinFamily, leaveFamily, removeMember, generateInviteCode, refreshFamily }}>
      {children}
    </FamilyContext.Provider>
  );
};

export const useFamily = () => { const context = useContext(FamilyContext); if (!context) throw new Error('useFamily must be within FamilyProvider'); return context; };