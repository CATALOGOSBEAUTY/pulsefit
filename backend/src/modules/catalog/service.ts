import { getSupabaseAdmin } from '../../lib/supabase.js';
import { mapCategory } from '../categories/mapper.js';
import { mapProduct } from '../products/mapper.js';
import { productSelect } from '../products/select.js';
import { buildProductRelevanceMap } from './relevance.js';
import type { OrderRelevanceSource, ProductRelevanceSource } from './relevance.js';

const PUBLIC_CATALOG_CACHE_TTL_MS = 60_000;

type PublicCatalogSnapshot = {
  categories: ReturnType<typeof mapCategory>[];
  products: ReturnType<typeof mapProduct>[];
};

let publicCatalogCache:
  | {
      expiresAt: number;
      snapshot: PublicCatalogSnapshot;
    }
  | null = null;

export async function loadPublicCatalogSnapshot(forceRefresh = false): Promise<PublicCatalogSnapshot> {
  if (!forceRefresh && publicCatalogCache && publicCatalogCache.expiresAt > Date.now()) {
    return publicCatalogCache.snapshot;
  }

  const supabase = getSupabaseAdmin();
  const [categoriesResult, productsResult, ordersResult] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('parent_id', { ascending: true, nullsFirst: true })
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true }),
    supabase
      .from('products')
      .select(productSelect())
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('orders')
      .select('status, created_at, order_items(product_id, quantity)')
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false }),
  ]);

  const failed = [categoriesResult, productsResult, ordersResult].find((result) => result.error);
  if (failed?.error) {
    throw failed.error;
  }

  const productRows = ((productsResult.data ?? []) as unknown) as ProductRelevanceSource[];
  const orderRows = ((ordersResult.data ?? []) as unknown) as OrderRelevanceSource[];

  const relevanceByProductId = buildProductRelevanceMap(productRows, orderRows);

  const snapshot = {
    categories: (categoriesResult.data ?? []).map(mapCategory),
    products: productRows.map((row) => {
      const mappedProduct = mapProduct(row);
      const relevance = relevanceByProductId[mappedProduct.id] ?? {
        score: 0,
        unitsSold: 0,
        orderCount: 0,
      };

      return {
        ...mappedProduct,
        relevanceScore: relevance.score,
        relevanceUnitsSold: relevance.unitsSold,
        relevanceOrderCount: relevance.orderCount,
      };
    }),
  };

  publicCatalogCache = {
    expiresAt: Date.now() + PUBLIC_CATALOG_CACHE_TTL_MS,
    snapshot,
  };

  return snapshot;
}

export function invalidatePublicCatalogCache() {
  publicCatalogCache = null;
}
