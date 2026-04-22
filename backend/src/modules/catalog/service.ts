import { getSupabaseAdmin } from '../../lib/supabase.js';
import { mapCategory } from '../categories/mapper.js';
import { mapProduct } from '../products/mapper.js';
import { productSelect } from '../products/select.js';

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
  const [categoriesResult, productsResult] = await Promise.all([
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
  ]);

  const failed = [categoriesResult, productsResult].find((result) => result.error);
  if (failed?.error) {
    throw failed.error;
  }

  const snapshot = {
    categories: (categoriesResult.data ?? []).map(mapCategory),
    products: (productsResult.data ?? []).map(mapProduct),
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
