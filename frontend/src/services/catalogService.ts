import { apiRequest } from './apiClient';

export interface PublicCatalogCategory {
  id: string;
  name: string;
  parent_id?: string | null;
  parentId?: string | null;
}

export interface PublicCatalogProduct {
  id: string;
  slug?: string | null;
  title: string;
  description: string;
  price: number;
  categoryId?: string;
  subcategoryId?: string | null;
  categoryName?: string | null;
  subcategoryName?: string | null;
  images: string[];
  features?: string[];
  stockQuantity?: number;
  variantsEnabled?: boolean;
  variants?: Array<{
    id: string;
    label: string;
    sku?: string;
    options: Array<{ name: string; value: string }>;
    price?: number | null;
    stockQuantity: number;
    isActive: boolean;
  }>;
}

export interface PublicCatalogBootstrapResponse {
  categories: PublicCatalogCategory[];
  products: PublicCatalogProduct[];
}

export async function getPublicCatalogBootstrap() {
  return apiRequest<PublicCatalogBootstrapResponse>('/api/catalog/bootstrap');
}
