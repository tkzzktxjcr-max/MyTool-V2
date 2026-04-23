export type ChoreFrequency = 'daily' | 'weekly' | 'monthly';
export type ChoreStatus = 'pending' | 'completed';

export interface Chore {
  id: string;
  familyId: string;
  title: string;
  description?: string;
  frequency?: ChoreFrequency;
  points?: number;
  assignedTo?: string;
  dueDate?: string;
  status: ChoreStatus;
  createdBy: string;
}

export interface CreateChoreForm {
  title: string;
  description?: string;
  frequency?: ChoreFrequency;
  points?: number;
  assignedTo?: string;
  dueDate?: Date;
}