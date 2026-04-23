export interface Family {
  id: string;
  name: string;
  ownerId: string;
  inviteCode?: string;
  monthlyBudget?: number;
  createdAt: string;
}

export interface FamilyMember {
  id: string;
  familyId: string;
  userId: string;
  role: 'admin' | 'member';
  name: string;
  avatar?: string;
}

export interface CreateFamilyForm {
  name: string;
  monthlyBudget?: number;
}

export interface FamilyContextType {
  family: Family | null;
  members: FamilyMember[];
  loading: boolean;
  createFamily: (name: string, monthlyBudget?: number) => Promise<Family>;
  joinFamily: (inviteCode: string) => Promise<void>;
  leaveFamily: () => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  generateInviteCode: () => Promise<string>;
  refreshFamily: () => Promise<void>;
}