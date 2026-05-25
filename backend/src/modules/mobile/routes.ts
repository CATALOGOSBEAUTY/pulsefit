import { Router } from 'express';
import { getSupabaseAdmin } from '../../lib/supabase.js';
import { ApiError, handleError, ok } from '../../lib/http.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { loadPublicCatalogSnapshot } from '../catalog/service.js';
import { buildStoreUsage, mapMobileProduct, normalizeStoreSlug, resolveMobilePlan } from './contract.js';

export const mobileRouter = Router();

async function loadPublicSettings() {
  const { data, error } = await getSupabaseAdmin()
    .from('settings')
    .select('key,value')
    .eq('is_public', true);

  if (error) throw error;
  return (data ?? []).reduce<Record<string, string>>((acc, row) => {
    acc[row.key] = row.value ?? '';
    return acc;
  }, {});
}

async function countOrdersThisMonth() {
  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);

  const { count, error } = await getSupabaseAdmin()
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', start.toISOString());

  if (error) throw error;
  return count ?? 0;
}

async function loadMobileStore(slugInput: string) {
  const slug = normalizeStoreSlug(slugInput);
  const [settings, catalog, ordersThisMonth] = await Promise.all([
    loadPublicSettings(),
    loadPublicCatalogSnapshot(),
    countOrdersThisMonth(),
  ]);

  const configuredSlug = normalizeStoreSlug(settings.store_slug || 'pulsefit');
  if (slug !== configuredSlug) {
    throw new ApiError(404, 'Loja nao encontrada.');
  }

  const products = catalog.products.map(mapMobileProduct);
  const plan = resolveMobilePlan(settings.store_plan);
  const usage = buildStoreUsage({
    products,
    ordersThisMonthCount: ordersThisMonth,
  });

  return {
    store: {
      id: 'store-default',
      name: settings.store_name || 'PulseFit Suplementos',
      slug: configuredSlug,
      whatsapp: settings.whatsapp_phone || '',
      primaryColor: settings.store_primary_color || '#15b86a',
      banner: settings.store_banner || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80',
      logo: settings.store_logo || 'PF',
      plan: plan.code,
      planUsage: usage,
    },
    plan,
    products,
  };
}

mobileRouter.get('/store/:slug', async (req, res) => {
  try {
    res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
    return ok(res, await loadMobileStore(req.params.slug));
  } catch (error) {
    return handleError(res, error);
  }
});

mobileRouter.get('/admin/store/:slug', requireAuth, async (req, res) => {
  try {
    return ok(res, await loadMobileStore(req.params.slug));
  } catch (error) {
    return handleError(res, error);
  }
});
