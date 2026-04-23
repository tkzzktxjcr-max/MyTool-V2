"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { account } from '@/lib/appwrite';
import { authService } from './service';
import type { AuthContextType, UserProfile, AuthUser } from './types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!user?.$id) return;
    let userProfile = await authService.getProfile(user.$id);
    if (!userProfile) userProfile = await authService.createProfile(user.$id, user.email, user.name);
    setProfile(userProfile);
  }, [user?.$id, user?.email, user?.name]);

  const checkUser = useCallback(async () => {
    try {
      const appwriteUser = await account.get();
      setUser({ $id: appwriteUser.$id, email: appwriteUser.email, name: appwriteUser.name });
      await loadProfile();
    } catch { setUser(null); setProfile(null); }
    finally { setLoading(false); }
  }, [loadProfile]);

  useEffect(() => { checkUser(); }, [checkUser]);

  const login = async (email: string, password: string) => { await authService.login(email, password); await checkUser(); };
  const register = async (email: string, password: string, name: string) => { await authService.register(email, password, name); await checkUser(); };
  const logout = async () => { await authService.logout(); setUser(null); setProfile(null); };
  const updateProfile = async (data: Partial<UserProfile>) => { if (!profile?.id) return; await authService.updateProfile(profile.id, data); setProfile(prev => prev ? { ...prev, ...data } : null); };
  const refreshProfile = async () => { await loadProfile(); };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAuthenticated: !!user, login, register, logout, updateProfile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => { const context = useContext(AuthContext); if (!context) throw new Error('useAuth must be within AuthProvider'); return context; };