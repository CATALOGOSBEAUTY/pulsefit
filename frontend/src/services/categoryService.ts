import { apiRequest } from './apiClient';
import { Category } from '../modules/categories/store/useCategoryStore';

export async function listCategories(includeInactive = false) {
  return apiRequest<Category[]>(`/api/categories${includeInactive ? '?includeInactive=true' : ''}`);
}

export async function createCategory(name: string, parentId?: string | null) {
  return apiRequest<Category>('/api/categories', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ name, parentId: parentId ?? null }),
  });
}

export async function updateCategory(id: string, name: string, parentId?: string | null) {
  return apiRequest<Category>(`/api/categories/${id}`, {
    method: 'PUT',
    auth: true,
    body: JSON.stringify({ name, parentId: parentId ?? null }),
  });
}

export async function deleteCategory(id: string) {
  return apiRequest<{ ok: true }>(`/api/categories/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}
