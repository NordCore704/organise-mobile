import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useAuth } from './AuthContext';
import { useFamily } from './FamilyContext';
import * as vaultService from '../services/vault';
import type {
  VaultCategory,
  VaultItem,
  CreateVaultCategoryInput,
  CreateVaultItemInput,
} from '../types';

type VaultContextValue = {
  categories: VaultCategory[];
  categoriesLoading: boolean;
  refreshCategories: () => Promise<void>;
  createCategory: (input: CreateVaultCategoryInput) => Promise<VaultCategory>;
  removeCategory: (categoryId: string) => Promise<void>;

  categoryItems: VaultItem[];
  categoryItemsLoading: boolean;
  loadCategoryItems: (categoryId: string) => Promise<void>;
  clearCategoryItems: () => void;

  addItem: (input: CreateVaultItemInput) => Promise<VaultItem>;
  removeItem: (itemId: string) => Promise<void>;

  error: string | null;
  clearError: () => void;
};

const VaultContext = createContext<VaultContextValue | undefined>(undefined);

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { currentFamily } = useFamily();

  const [categories, setCategories] = useState<VaultCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [categoryItems, setCategoryItems] = useState<VaultItem[]>([]);
  const [categoryItemsLoading, setCategoryItemsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const clearError = useCallback(() => setError(null), []);

  const refreshCategories = useCallback(async () => {
    if (!currentFamily?.id) {
      setCategories([]);
      return;
    }
    setCategoriesLoading(true);
    try {
      const list = await vaultService.getCategoriesForFamily(currentFamily.id);
      setCategories(list);
    } catch (e: any) {
      console.warn('refreshCategories failed', e);
      setError(e?.message ?? 'Could not load vault');
    } finally {
      setCategoriesLoading(false);
    }
  }, [currentFamily?.id]);

  useEffect(() => {
    refreshCategories();
  }, [refreshCategories]);

  const createCategory = useCallback(
    async (input: CreateVaultCategoryInput) => {
      if (!user?.uid || !currentFamily?.id) {
        throw new Error('You must be signed in and have a family');
      }
      const cat = await vaultService.createCategory(
        user.uid,
        currentFamily.id,
        input
      );
      setCategories((prev) => [cat, ...prev]);
      return cat;
    },
    [user?.uid, currentFamily?.id]
  );

  const removeCategory = useCallback(async (categoryId: string) => {
    await vaultService.deleteCategory(categoryId);
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    setCategoryItems([]);
  }, []);

  const loadCategoryItems = useCallback(async (categoryId: string) => {
    setCategoryItemsLoading(true);
    try {
      const list = await vaultService.getItemsForCategory(categoryId);
      setCategoryItems(list);
    } catch (e: any) {
      console.warn('loadCategoryItems failed', e);
      setError(e?.message ?? 'Could not load items');
      setCategoryItems([]);
    } finally {
      setCategoryItemsLoading(false);
    }
  }, []);

  const clearCategoryItems = useCallback(() => {
    setCategoryItems([]);
  }, []);

  const addItem = useCallback(
    async (input: CreateVaultItemInput) => {
      if (!user?.uid || !currentFamily?.id) {
        throw new Error('You must be signed in and have a family');
      }
      const item = await vaultService.createItem(
        user.uid,
        currentFamily.id,
        input
      );
      setCategoryItems((prev) => [item, ...prev]);
      return item;
    },
    [user?.uid, currentFamily?.id]
  );

  const removeItem = useCallback(async (itemId: string) => {
    await vaultService.deleteItem(itemId);
    setCategoryItems((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  return (
    <VaultContext.Provider
      value={{
        categories,
        categoriesLoading,
        refreshCategories,
        createCategory,
        removeCategory,
        categoryItems,
        categoryItemsLoading,
        loadCategoryItems,
        clearCategoryItems,
        addItem,
        removeItem,
        error,
        clearError,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error('useVault must be used within VaultProvider');
  return ctx;
}