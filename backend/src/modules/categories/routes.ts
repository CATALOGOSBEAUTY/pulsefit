import { Router } from 'express';
import { getSupabaseAdmin } from '../../lib/supabase.js';
import { ApiError, handleError, ok, requireString } from '../../lib/http.js';
import { requireAuth } from '../../middleware/requireAuth.js';

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

function mapCategory(row: any) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    parent_id: row.parent_id ?? null,
    parentId: row.parent_id ?? null,
    sort_order: row.sort_order ?? 0,
    is_active: row.is_active ?? true,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
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
    const includeInactive = req.query.includeInactive === 'true';
    let query = getSupabaseAdmin()
      .from('categories')
      .select('*')
      .order('parent_id', { ascending: true, nullsFirst: true })
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (!includeInactive) query = query.eq('is_active', true);

    const { data, error } = await query;
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

    const { data, error } = await getSupabaseAdmin()
      .from('categories')
      .insert({ name, slug, parent_id: parentId, sort_order: sortOrder, is_active: req.body.is_active ?? true })
      .select('*')
      .single();

    if (error) throw error;
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
    return ok(res, { ok: true });
  } catch (error) {
    return handleError(res, error);
  }
});
