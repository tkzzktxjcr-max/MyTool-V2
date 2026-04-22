"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  account, 
  databases, 
  APPWRITE_CONFIG, 
  COLLECTIONS, 
  ID 
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

  const checkUser = useCallback(async () => {
    try {
      const appwriteUser = await account.get();
      setUser({
        $id: appwriteUser.$id,
        email: appwriteUser.email,
        name: appwriteUser.name,
      });
      
      // Récupérer le profil depuis la collection
      await refreshProfile();
    } catch (error) {
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user?.$id) return;
    
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        COLLECTIONS.USERS_PROFILE,
        [`userId=${user.$id}`]
      );
      
      if (response.documents.length > 0) {
        const doc = response.documents[0];
        setProfile({
          id: doc.$id,
          userId: doc.userId,
          email: doc.email,
          name: doc.name,
          familyId: doc.familyId,
          avatar: doc.avatar,
          createdAt: doc.$createdAt,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, [user?.$id]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const login = async (email: string, password: string) => {
    try {
      await account.createEmailPasswordSession(email, password);
      await checkUser();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      // Créer l'utilisateur dans Appwrite Auth
      await account.create(ID.unique(), email, password, name);
      
      // Créer une session
      await account.createEmailPasswordSession(email, password);
      
      // Récupérer l'utilisateur créé
      const appwriteUser = await account.get();
      
      // Créer le profil utilisateur dans la collection
      await databases.createDocument(
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
      
      await checkUser();
    } catch (error) {
      console.error('Register error:', error);
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