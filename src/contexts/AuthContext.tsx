"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  account, 
  databases, 
  APPWRITE_CONFIG, 
  COLLECTIONS, 
  ID,
  Query,
} from '@/lib/appwrite';
import type { UserProfile, AuthUser } from '@/types';

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    console.log('[DEBUG] refreshProfile called, user:', user?.$id);
    
    if (!user?.$id) {
      console.log('[DEBUG] No user ID, skipping profile refresh');
      return;
    }
    
    try {
      console.log('[DEBUG] Querying for profile with userId:', user.$id);
      
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        COLLECTIONS.USERS_PROFILE,
        [Query.equal('userId', user.$id)]
      );
      
      console.log('[DEBUG] Query response:', response.documents.length, 'documents');
      
      if (response.documents.length > 0) {
        const doc = response.documents[0];
        console.log('[DEBUG] Profile found:', doc.$id);
        setProfile({
          id: doc.$id,
          userId: doc.userId,
          email: doc.email,
          name: doc.name,
          familyId: doc.familyId,
          avatar: doc.avatar,
          createdAt: doc.$createdAt,
        });
      } else {
        console.log('[DEBUG] No profile found, creating one...');
        try {
          const newProfile = await databases.createDocument(
            APPWRITE_CONFIG.databaseId,
            COLLECTIONS.USERS_PROFILE,
            ID.unique(),
            {
              userId: user.$id,
              email: user.email,
              name: user.name,
              createdAt: new Date().toISOString(),
            }
          );
          console.log('[DEBUG] Profile created successfully:', newProfile.$id);
          setProfile({
            id: newProfile.$id,
            userId: newProfile.userId,
            email: newProfile.email,
            name: newProfile.name,
            createdAt: newProfile.$createdAt,
          });
        } catch (createError: any) {
          console.error('[DEBUG] Error creating profile:', createError?.message || createError);
        }
      }
    } catch (error) {
      console.error('[DEBUG] Error in refreshProfile:', error);
    }
  }, [user?.$id, user?.email, user?.name]);

  const checkUser = useCallback(async () => {
    console.log('[DEBUG] checkUser called');
    try {
      const appwriteUser = await account.get();
      console.log('[DEBUG] Got user:', appwriteUser.$id, appwriteUser.email);
      
      setUser({
        $id: appwriteUser.$id,
        email: appwriteUser.email,
        name: appwriteUser.name,
      });
      
      await refreshProfile();
    } catch (error) {
      console.log('[DEBUG] No user logged in');
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [refreshProfile]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const login = async (email: string, password: string) => {
    console.log('[DEBUG] Login called with:', email);
    try {
      console.log('[DEBUG] Creating session...');
      await account.createEmailPasswordSession(email, password);
      console.log('[DEBUG] Session created, checking user...');
      await checkUser();
      console.log('[DEBUG] Login complete, user:', user?.$id, 'profile:', profile?.id);
    } catch (error: any) {
      console.error('[DEBUG] Login error:', error?.message || error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    console.log('[DEBUG] Register called');
    try {
      console.log('[DEBUG] Creating account...');
      await account.create(ID.unique(), email, password, name);
      console.log('[DEBUG] Account created, creating session...');
      await account.createEmailPasswordSession(email, password);
      
      const appwriteUser = await account.get();
      console.log('[DEBUG] Got user after register:', appwriteUser.$id);
      
      console.log('[DEBUG] Creating profile...');
      const newProfile = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        COLLECTIONS.USERS_PROFILE,
        ID.unique(),
        {
          userId: appwriteUser.$id,
          email: email,
          name: name,
          createdAt: new Date().toISOString(),
        }
      );
      console.log('[DEBUG] Profile created:', newProfile.$id);
      
      setUser({
        $id: appwriteUser.$id,
        email: appwriteUser.email,
        name: appwriteUser.name,
      });
      
      setProfile({
        id: newProfile.$id,
        userId: newProfile.userId,
        email: newProfile.email,
        name: newProfile.name,
        createdAt: newProfile.$createdAt,
      });
    } catch (error: any) {
      console.error('[DEBUG] Register error:', error?.message || error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!profile?.id) return;
    
    try {
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        COLLECTIONS.USERS_PROFILE,
        profile.id,
        data
      );
      
      setProfile(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        profile, 
        loading, 
        isAuthenticated: !!user,
        login, 
        register, 
        logout, 
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};