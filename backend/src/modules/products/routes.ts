import { Router } from 'express';
import { getSupabaseAdmin } from '../../lib/supabase.js';
import { ApiError, handleError, ok, optionalString, requireNumber, requireString } from '../../lib/http.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { invalidatePublicCatalogCache, loadPublicCatalogSnapshot } from '../catalog/service.js';
import { assertPublicCatalogQuery } from '../catalog/publicQueryGuard.js';
import { uploadProductImageDataUrl } from '../storage/upload.js';
import { mapProduct, type ProductPayload } from './mapper.js';
import { productSelect } from './select.js';
import { parseProductVariants, type ProductVariantPayload } from './variants.js';

export const productRouter = Router();

function parseProductPayload(body: any): ProductPayload {
  const rawSubcategoryId = body.subcategoryId ?? body.subcategory_id;
  const rawAudience = body.audience;
  const audience = rawAudience === 'feminino' || rawAudience === 'masculino' || rawAudience === 'suplemento'
    ? rawAudience
    : null;
  const rawCatalogStatus = body.catalogStatus ?? body.catalog_status;
  const catalogStatus = rawCatalogStatus === 'draft' || rawCatalogStatus === 'ready' || rawCatalogStatus === 'live'
    ? rawCatalogStatus
    : 'draft';

  return {
    slug: typeof body.slug === 'string' && body.slug.trim() ? body.slug.trim() : undefined,
    title: requireString(body.title, 'title'),
    description: optionalString(body.description),
    price: requireNumber(body.price, 'price'),
    categoryId: requireString(body.categoryId ?? body.category_id, 'categoryId'),
    subcategoryId: typeof rawSubcategoryId === 'string' && rawSubcategoryId.trim() ? rawSubcategoryId : null,
    audience,
    productType: optionalString(body.productType ?? body.product_type),
    variation: optionalString(body.variation) || null,
    features: Array.isArray(body.features) ? body.features.filter((item: unknown) => typeof item === 'string').map((item: string) => item.trim()).filter(Boolean) : [],
    imagePrompt: optionalString(body.imagePrompt ?? body.image_prompt),
    catalogStatus,
    images: Array.isArray(body.images) ? body.images.filter((item: unknown) => typeof item === 'string') : [],
    isActive: body.isActive ?? body.is_active ?? true,
    isFeatured: body.isFeatured ?? body.is_featured ?? false,
    isPromo: body.isPromo ?? body.is_promo ?? false,
    isNew: body.isNew ?? body.is_new ?? false,
    stockQuantity: Number(body.stockQuantity ?? body.stock_quantity ?? 0),
    variantsEnabled: Boolean(body.variantsEnabled ?? body.variants_enabled ?? false),
    variants: parseProductVariants(body.variants),
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

async function saveVariants(productId: string, variants: ProductVariantPayload[]) {
  const supabase = getSupabaseAdmin();
  await supabase.from('product_variants').delete().eq('product_id', productId);

  if (variants.length === 0) return;

  const rows = variants.map((variant) => ({
    product_id: productId,
    label: variant.label || variant.options.map((option) => `${option.name}: ${option.value}`).join(' / '),
    sku: variant.sku || null,
    options: variant.options,
    price: variant.price ?? null,
    stock_quantity: variant.stockQuantity,
    is_active: variant.isActive,
  }));

  const { error } = await supabase.from('product_variants').insert(rows);
  if (error) throw error;
}

productRouter.get('/', async (req, res) => {
  try {
    assertPublicCatalogQuery(req.query);
    res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
    const snapshot = await loadPublicCatalogSnapshot();
    return ok(res, snapshot.products);
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
        slug: payload.slug ?? null,
        title: payload.title,
        description: payload.description,
        price: payload.price,
        category_id: payload.categoryId,
        subcategory_id: payload.subcategoryId,
        audience: payload.audience,
        product_type: payload.productType,
        variation: payload.variation,
        features: payload.features ?? [],
        image_prompt: payload.imagePrompt ?? '',
        catalog_status: payload.catalogStatus ?? 'draft',
        is_active: payload.isActive,
        is_featured: payload.isFeatured,
        is_promo: payload.isPromo,
        is_new: payload.isNew,
        stock_quantity: payload.stockQuantity ?? 0,
        variants_enabled: payload.variantsEnabled ?? false,
      })
      .select('*')
      .single();

    if (error) throw error;
    await saveImages(data.id, payload.images, payload.title);
    await saveVariants(data.id, payload.variants ?? []);

    const { data: created, error: fetchError } = await getSupabaseAdmin().from('products').select(productSelect()).eq('id', data.id).single();
    if (fetchError) throw fetchError;

    invalidatePublicCatalogCache();
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
        slug: payload.slug ?? null,
        title: payload.title,
        description: payload.description,
        price: payload.price,
        category_id: payload.categoryId,
        subcategory_id: payload.subcategoryId,
        audience: payload.audience,
        product_type: payload.productType,
        variation: payload.variation,
        features: payload.features ?? [],
        image_prompt: payload.imagePrompt ?? '',
        catalog_status: payload.catalogStatus ?? 'draft',
        is_active: payload.isActive,
        is_featured: payload.isFeatured,
        is_promo: payload.isPromo,
        is_new: payload.isNew,
        stock_quantity: payload.stockQuantity ?? 0,
        variants_enabled: payload.variantsEnabled ?? false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select('*')
      .single();

    if (error) throw error;
    if (!data) throw new ApiError(404, 'Produto nao encontrado.');

    await saveImages(data.id, payload.images, payload.title);
    await saveVariants(data.id, payload.variants ?? []);

    const { data: updated, error: fetchError } = await getSupabaseAdmin().from('products').select(productSelect()).eq('id', data.id).single();
    if (fetchError) throw fetchError;

    invalidatePublicCatalogCache();
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
    invalidatePublicCatalogCache();
    return ok(res, mapProduct(data));
  } catch (error) {
    return handleError(res, error);
  }
});

productRouter.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { error } = await getSupabaseAdmin().from('products').delete().eq('id', req.params.id);
    if (error) throw error;
    invalidatePublicCatalogCache();
    return ok(res, { ok: true });
  } catch (error) {
    return handleError(res, error);
  }
});
