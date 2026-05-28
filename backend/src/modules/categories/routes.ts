import { Router } from 'express';
import { getSupabaseAdmin } from '../../lib/supabase.js';
import { ApiError, handleError, ok, requireString } from '../../lib/http.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { invalidatePublicCatalogCache, loadPublicCatalogSnapshot } from '../catalog/service.js';
import { assertPublicCatalogQuery } from '../catalog/publicQueryGuard.js';
import { assertCatalogResourceLimit } from '../catalogConfig/service.js';
import { mapCategory } from './mapper.js';

export const categoryRouter = Router();

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
}

async function buildSlug(name: string, parentId?: string | null) {
  const baseSlug = slugify(name);
  if (!parentId) return baseSlug;

  const { data: parent, error } = await getSupabaseAdmin()
    .from('categories')
    .select('slug')
    .eq('id', parentId)
    .is('parent_id', null)
    .single();

  if (error || !parent) throw new ApiError(400, 'Categoria principal invalida.');
  return `${parent.slug}-${baseSlug}`;
}

async function ensureNoCategoryUsage(categoryId: string) {
  const supabase = getSupabaseAdmin();
  const [children, mainProducts, subProducts] = await Promise.all([
    supabase.from('categories').select('id', { count: 'exact', head: true }).eq('parent_id', categoryId),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('category_id', categoryId),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('subcategory_id', categoryId),
  ]);

  const failed = [children, mainProducts, subProducts].find((result) => result.error);
  if (failed?.error) throw failed.error;

  if ((children.count ?? 0) > 0) {
    throw new ApiError(409, 'Remova as subcategorias antes de excluir esta categoria principal.');
  }

  if ((mainProducts.count ?? 0) > 0 || (subProducts.count ?? 0) > 0) {
    throw new ApiError(409, 'Existem produtos vinculados a esta categoria.');
  }
}

categoryRouter.get('/', async (req, res) => {
  try {
    assertPublicCatalogQuery(req.query);
    res.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=1800');
    const snapshot = await loadPublicCatalogSnapshot();
    return ok(res, snapshot.categories);
  } catch (error) {
    return handleError(res, error);
  }
});

categoryRouter.get('/admin', requireAuth, async (_req, res) => {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('categories')
      .select('*')
      .order('parent_id', { ascending: true, nullsFirst: true })
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;
    return ok(res, (data ?? []).map(mapCategory));
  } catch (error) {
    return handleError(res, error);
  }
});

categoryRouter.post('/', requireAuth, async (req, res) => {
  try {
    const name = requireString(req.body.name, 'name');
    const parentId = req.body.parentId ?? req.body.parent_id ?? null;
    const slug = await buildSlug(name, parentId);
    const sortOrder = Number(req.body.sort_order ?? 0);
    const supabase = getSupabaseAdmin();
    await assertCatalogResourceLimit(supabase, parentId ? 'subcategories' : 'categories');

    const { data, error } = await supabase
      .from('categories')
      .insert({ name, slug, parent_id: parentId, sort_order: sortOrder, is_active: req.body.is_active ?? true })
      .select('*')
      .single();

    if (error) throw error;
    invalidatePublicCatalogCache();
    return ok(res, mapCategory(data), 201);
  } catch (error) {
    return handleError(res, error);
  }
});

categoryRouter.put('/:id', requireAuth, async (req, res) => {
  try {
    const name = requireString(req.body.name, 'name');
    const parentId = req.body.parentId ?? req.body.parent_id ?? null;
    if (parentId === req.params.id) throw new ApiError(400, 'Uma categoria nao pode ser filha dela mesma.');

    const slug = await buildSlug(name, parentId);
    const { data, error } = await getSupabaseAdmin()
      .from('categories')
      .update({ name, slug, parent_id: parentId, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select('*')
      .single();

    if (error) throw error;
    if (!data) throw new ApiError(404, 'Categoria nao encontrada.');

    invalidatePublicCatalogCache();
    return ok(res, mapCategory(data));
  } catch (error) {
    return handleError(res, error);
  }
});

categoryRouter.delete('/:id', requireAuth, async (req, res) => {
  try {
    await ensureNoCategoryUsage(req.params.id);
    const { error } = await getSupabaseAdmin().from('categories').delete().eq('id', req.params.id);
    if (error) throw error;
    invalidatePublicCatalogCache();
    return ok(res, { ok: true });
  } catch (error) {
    return handleError(res, error);
  }
});
