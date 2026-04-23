import { useState, useCallback } from 'react';
import { useFamily } from '@/features/family/context';
import { useAuth } from '@/features/auth/context';
import { choresService } from './service';
import type { Chore, CreateChoreForm } from './types';

export const useChores = () => {
  const { family } = useFamily();
  const { user } = useAuth();
  const [chores, setChores] = useState<Chore[]>([]);
  const [loading, setLoading] = useState(false);

  const loadChores = useCallback(async () => {
    if (!family?.id) return;
    setLoading(true);
    try { const data = await choresService.getChores(family.id); setChores(data); }
    catch { console.error('Error loading chores:', error); }
    finally { setLoading(false); }
  }, [family?.id]);

  const createChore = async (form: CreateChoreForm): Promise<Chore> => {
    if (!family?.id || !user) throw new Error('No family or user');
    const chore = await choresService.createChore(family.id, user.$id, form);
    setChores(prev => [...prev, chore]);
    return chore;
  };

  const completeChore = async (choreId: string): Promise<void> => { await choresService.completeChore(choreId); setChores(prev => prev.map(c => c.id === choreId ? { ...c, status: 'completed' } : c)); };
  const deleteChore = async (choreId: string): Promise<void> => { await choresService.deleteChore(choreId); setChores(prev => prev.filter(c => c.id !== choreId)); };
  const getTodaysChores = (): Chore[] => { const today = new Date().toISOString().split('T')[0]; return chores.filter(c => { if (!c.dueDate) return c.status === 'pending'; return c.dueDate.split('T')[0] === today && c.status === 'pending'; }); };

  return { chores, loading, loadChores, createChore, completeChore, deleteChore, getTodaysChores };
};