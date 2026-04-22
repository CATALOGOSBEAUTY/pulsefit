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

let cachedCatalog: {
  expiresAt: number;
  data: PublicCatalogBootstrapResponse;
} | null = null;
let pendingCatalogRequest: Promise<PublicCatalogBootstrapResponse> | null = null;
const CATALOG_CACHE_TTL_MS = 5 * 60 * 1000;

export async function getPublicCatalogBootstrap() {
  if (cachedCatalog && cachedCatalog.expiresAt > Date.now()) {
    return cachedCatalog.data;
  }

  if (!pendingCatalogRequest) {
    pendingCatalogRequest = apiRequest<PublicCatalogBootstrapResponse>('/api/catalog/bootstrap')
      .then((data) => {
        cachedCatalog = {
          data,
          expiresAt: Date.now() + CATALOG_CACHE_TTL_MS,
        };
        return data;
      })
      .finally(() => {
        pendingCatalogRequest = null;
      });
  }

  return pendingCatalogRequest;
}
