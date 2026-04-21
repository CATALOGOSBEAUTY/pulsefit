import { Router } from 'express';
import { getSupabaseAdmin } from '../../lib/supabase.js';
import { ApiError, handleError, ok, optionalString, requireNumber, requireString } from '../../lib/http.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { uploadProductImageDataUrl } from '../storage/upload.js';
import { mapProduct, type ProductPayload } from './mapper.js';

export const productRouter = Router();

function productSelect() {
  return '*, category:categories!products_category_id_fkey(id,name,slug,parent_id), subcategory:categories!products_subcategory_id_fkey(id,name,slug,parent_id), product_images(id,url,name,sort_order)';
}

function parseProductPayload(body: any): ProductPayload {
  const rawSubcategoryId = body.subcategoryId ?? body.subcategory_id;
  return {
    title: requireString(body.title, 'title'),
    description: optionalString(body.description),
    price: requireNumber(body.price, 'price'),
    categoryId: requireString(body.categoryId ?? body.category_id, 'categoryId'),
    subcategoryId: typeof rawSubcategoryId === 'string' && rawSubcategoryId.trim() ? rawSubcategoryId : null,
    images: Array.isArray(body.images) ? body.images.filter((item: unknown) => typeof item === 'string') : [],
    isActive: body.isActive ?? body.is_active ?? true,
    isFeatured: body.isFeatured ?? body.is_featured ?? false,
    isPromo: body.isPromo ?? body.is_promo ?? false,
    isNew: body.isNew ?? body.is_new ?? false,
    stockQuantity: Number(body.stockQuantity ?? body.stock_quantity ?? 0),
  };
}

async function validateCategoryTree(categoryId: string, subcategoryId?: string | null) {
  const supabase = getSupabaseAdmin();
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('id,parent_id,is_active')
    .eq('id', categoryId)
    .single();

  if (categoryError || !category) throw new ApiError(400, 'Categoria principal invalida.');
  if (category.parent_id) throw new ApiError(400, 'Selecione uma categoria principal valida.');

  if (!subcategoryId) return;

  const { data: subcategory, error: subcategoryError } = await supabase
    .from('categories')
    .select('id,parent_id,is_active')
    .eq('id', subcategoryId)
    .single();

  if (subcategoryError || !subcategory) throw new ApiError(400, 'Subcategoria invalida.');
  if (subcategory.parent_id !== categoryId) throw new ApiError(400, 'Subcategoria nao pertence a categoria principal selecionada.');
}

async function saveImages(productId: string, images: string[], title: string) {
  const supabase = getSupabaseAdmin();
  await supabase.from('product_images').delete().eq('product_id', productId);

  if (images.length === 0) return;

  const uploaded = await Promise.all(images.map((image, index) => uploadProductImageDataUrl(image, `${title}-${index + 1}`)));
  const rows = uploaded.map((image, index) => ({
    product_id: productId,
    url: image.url,
    path: image.path,
    name: `${title} ${index + 1}`,
    sort_order: index,
  }));

  const { error } = await supabase.from('product_images').insert(rows);
  if (error) throw error;
}

productRouter.get('/', async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    let query = getSupabaseAdmin()
      .from('products')
      .select(productSelect())
      .order('created_at', { ascending: false });

    if (!includeInactive) query = query.eq('is_active', true);

    const { data, error } = await query;
    if (error) throw error;
    return ok(res, (data ?? []).map(mapProduct));
  } catch (error) {
    return handleError(res, error);
  }
});

productRouter.get('/admin', requireAuth, async (_req, res) => {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('products')
      .select(productSelect())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return ok(res, (data ?? []).map(mapProduct));
  } catch (error) {
    return handleError(res, error);
  }
});

productRouter.post('/', requireAuth, async (req, res) => {
  try {
    const payload = parseProductPayload(req.body);
    await validateCategoryTree(payload.categoryId, payload.subcategoryId);
    const { data, error } = await getSupabaseAdmin()
      .from('products')
      .insert({
        title: payload.title,
        description: payload.description,
        price: payload.price,
        category_id: payload.categoryId,
        subcategory_id: payload.subcategoryId,
        is_active: payload.isActive,
        is_featured: payload.isFeatured,
        is_promo: payload.isPromo,
        is_new: payload.isNew,
        stock_quantity: payload.stockQuantity ?? 0,
      })
      .select('*')
      .single();

    if (error) throw error;
    await saveImages(data.id, payload.images, payload.title);

    const { data: created, error: fetchError } = await getSupabaseAdmin().from('products').select(productSelect()).eq('id', data.id).single();
    if (fetchError) throw fetchError;

    return ok(res, mapProduct(created), 201);
  } catch (error) {
    return handleError(res, error);
  }
});

productRouter.put('/:id', requireAuth, async (req, res) => {
  try {
    const payload = parseProductPayload(req.body);
    await validateCategoryTree(payload.categoryId, payload.subcategoryId);
    const { data, error } = await getSupabaseAdmin()
      .from('products')
      .update({
        title: payload.title,
        description: payload.description,
        price: payload.price,
        category_id: payload.categoryId,
        subcategory_id: payload.subcategoryId,
        is_active: payload.isActive,
        is_featured: payload.isFeatured,
        is_promo: payload.isPromo,
        is_new: payload.isNew,
        stock_quantity: payload.stockQuantity ?? 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select('*')
      .single();

    if (error) throw error;
    if (!data) throw new ApiError(404, 'Produto nao encontrado.');

    await saveImages(data.id, payload.images, payload.title);

    const { data: updated, error: fetchError } = await getSupabaseAdmin().from('products').select(productSelect()).eq('id', data.id).single();
    if (fetchError) throw fetchError;

    return ok(res, mapProduct(updated));
  } catch (error) {
    return handleError(res, error);
  }
});

productRouter.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const fieldMap: Record<string, string> = {
      isActive: 'is_active',
      isFeatured: 'is_featured',
      isPromo: 'is_promo',
      isNew: 'is_new',
    };
    const field = fieldMap[String(req.body.field)];
    if (!field) throw new ApiError(400, 'Campo de status invalido.');

    const { data: current, error: currentError } = await getSupabaseAdmin().from('products').select(field).eq('id', req.params.id).single<Record<string, boolean>>();
    if (currentError) throw currentError;

    const { data, error } = await getSupabaseAdmin()
      .from('products')
      .update({ [field]: !Boolean(current?.[field]), updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select(productSelect())
      .single();

    if (error) throw error;
    return ok(res, mapProduct(data));
  } catch (error) {
    return handleError(res, error);
  }
});

productRouter.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { error } = await getSupabaseAdmin().from('products').delete().eq('id', req.params.id);
    if (error) throw error;
    return ok(res, { ok: true });
  } catch (error) {
    return handleError(res, error);
  }
});
