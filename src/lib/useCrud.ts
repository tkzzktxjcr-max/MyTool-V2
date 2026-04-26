/**
 * Generic CRUD Hook
 * Abstract reusable pattern for all feature hooks
 */

import { useState, useCallback, useEffect } from 'react';

export interface CrudConfig<T, CreateData, UpdateData = Partial<CreateData>> {
  /** Fetch all items for a given parent (e.g., familyId) */
  fetchAll: (parentId: string) => Promise<T[]>;
  /** Create a new item */
  create: (parentId: string, ownerId: string, data: CreateData) => Promise<T>;
  /** Update an existing item */
  update?: (itemId: string, data: UpdateData) => Promise<void>;
  /** Delete an item */
  delete: (itemId: string) => Promise<void>;
  /** Parent ID dependency key (default: 'id') */
  parentKey?: string;
}

export function useCrud<T, CreateData, UpdateData = Partial<CreateData>>({
  fetchAll,
  create,
  update,
  delete: deleteFn,
}: CrudConfig<T, CreateData, UpdateData>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (parentId: string) => {
    setLoading(true);
    try {
      const data = await fetchAll(parentId);
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, [fetchAll]);

  const add = useCallback(async (parentId: string, ownerId: string, data: CreateData): Promise<T> => {
    const newItem = await create(parentId, ownerId, data);
    setItems(prev => [...prev, newItem]);
    return newItem;
  }, [create]);

  const edit = useCallback(async (itemId: string, data: UpdateData): Promise<void> => {
    if (update) {
      await update(itemId, data);
      setItems(prev => prev.map(item => (item as any).id === itemId ? { ...item, ...data } : item));
    }
  }, [update]);

  const remove = useCallback(async (itemId: string): Promise<void> => {
    await deleteFn(itemId);
    setItems(prev => prev.filter(item => (item as any).id !== itemId));
  }, [deleteFn]);

  return { items, loading, load, add, edit, remove };
}

/**
 * Factory to create a feature-specific hook with auto-loading
 */
export function createCrudHook<T, CreateData, UpdateData = Partial<CreateData>>(
  config: CrudConfig<T, CreateData, UpdateData>
) {
  return (parentId: string | undefined) => {
    const { items, loading, load, add, edit, remove } = useCrud(config);
    
    useEffect(() => {
      if (parentId) load(parentId);
    }, [parentId, load]);

    return { items, loading, load, add, edit, remove };
  };
}
