import { apiRequest } from './apiClient';

export interface PublicCatalogCategory {
  id: string;
  name: string;
  parent_id?: string | null;
  parentId?: string | null;
}

export interface PublicCatalogProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  categoryId?: string;
  subcategoryId?: string | null;
  categoryName?: string | null;
  subcategoryName?: string | null;
  images: string[];
}

export interface PublicCatalogBootstrapResponse {
  categories: PublicCatalogCategory[];
  products: PublicCatalogProduct[];
}

export async function getPublicCatalogBootstrap() {
  return apiRequest<PublicCatalogBootstrapResponse>('/api/catalog/bootstrap');
}
