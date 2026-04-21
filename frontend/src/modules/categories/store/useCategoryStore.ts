import { create } from 'zustand';
import * as categoryService from '../../../services/categoryService';

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
  parentId?: string | null;
  sort_order?: number;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
}

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string;
  fetchCategories: (includeInactive?: boolean) => Promise<void>;
  addCategory: (name: string, parentId?: string | null) => Promise<void>;
  updateCategory: (id: string, name: string, parentId?: string | null) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  isLoading: false,
  error: '',
  fetchCategories: async (includeInactive = true) => {
    set({ isLoading: true, error: '' });
    try {
      const categories = await categoryService.listCategories(includeInactive);
      set({ categories, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
  addCategory: async (name, parentId = null) => {
    const created = await categoryService.createCategory(name, parentId);
    set((state) => ({ categories: [...state.categories, created] }));
  },
  updateCategory: async (id, name, parentId = null) => {
    const updated = await categoryService.updateCategory(id, name, parentId);
    set((state) => ({
      categories: state.categories.map((category) => category.id === id ? updated : category),
    }));
  },
  deleteCategory: async (id) => {
    await categoryService.deleteCategory(id);
    set((state) => ({
      categories: state.categories.filter((category) => category.id !== id),
    }));
  },
}));
