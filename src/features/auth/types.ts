export interface AuthUser {
  $id: string;
  email: string;
  name: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  email: string;
  name: string;
  familyId?: string;
  avatar?: string;
  createdAt?: string;
}

export interface AuthContextType {
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