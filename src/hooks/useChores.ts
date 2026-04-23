"use client";

import { useState, useCallback } from 'react';
import { 
  createDocument, 
  listDocuments, 
  updateDocument, 
  deleteDocument,
  COLLECTIONS,
  databases,
  APPWRITE_CONFIG,
  Query,
} from '@/lib/appwrite';
import { useFamily } from '@/contexts/FamilyContext';
import type { Chore, CreateChoreForm, ChoreStatus } from '@/types';

export const useChores = () => {
  const { family } = useFamily();
  const [chores, setChores] = useState<Chore[]>([]);
  const [loading, setLoading] = useState(false);

  const loadChores = useCallback(async () => {
    if (!family?.id) return;

    setLoading(true);
    try {
      // Use proper server-side query filtering
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        COLLECTIONS.CHORES,
        [Query.equal('familyId', family.id)]
      );
      
      const familyChores = response.documents.map((doc: any) => ({
        id: doc.$id,
        familyId: doc.familyId,
        title: doc.title,
        description: doc.description,
        frequency: doc.frequency,
        points: doc.points,
        assignedTo: doc.assignedTo,
        dueDate: doc.dueDate,
        status: doc.status as ChoreStatus,
        createdBy: doc.createdBy,
      }));
      
      setChores(familyChores);
    } catch (error) {
      console.error('Error loading chores:', error);
    } finally {
      setLoading(false);
    }
  }, [family?.id]);

  const createChore = async (form: CreateChoreForm): Promise<Chore> => {
    if (!family?.id) throw new Error('No family selected');

    const doc: any = await createDocument(COLLECTIONS.CHORES, {
      familyId: family.id,
      title: form.title,
      description: form.description,
      frequency: form.frequency,
      points: form.points || 10,
      assignedTo: form.assignedTo,
      dueDate: form.dueDate?.toISOString(),
      status: 'pending',
      createdBy: family.ownerId,
    });

    const chore: Chore = {
      id: doc.$id,
      familyId: doc.familyId,
      title: doc.title,
      description: doc.description,
      frequency: doc.frequency,
      points: doc.points,
      assignedTo: doc.assignedTo,
      dueDate: doc.dueDate,
      status: doc.status as ChoreStatus,
      createdBy: doc.createdBy,
    };

    setChores(prev => [...prev, chore]);
    return chore;
  };

  const completeChore = async (choreId: string): Promise<void> => {
    await updateDocument(COLLECTIONS.CHORES, choreId, { status: 'completed' });
    setChores(prev =>
      prev.map(c =>
        c.id === choreId ? { ...c, status: 'completed' } : c
      )
    );
  };

  const deleteChore = async (choreId: string): Promise<void> => {
    await deleteDocument(COLLECTIONS.CHORES, choreId);
    setChores(prev => prev.filter(c => c.id !== choreId));
  };

  const getTodaysChores = (): Chore[] => {
    const today = new Date().toISOString().split('T')[0];
    return chores.filter(c => {
      if (!c.dueDate) return c.status === 'pending';
      return c.dueDate.split('T')[0] === today && c.status === 'pending';
    });
  };

  return {
    chores,
    loading,
    loadChores,
    createChore,
    completeChore,
    deleteChore,
    getTodaysChores,
  };
};