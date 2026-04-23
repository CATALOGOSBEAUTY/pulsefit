import { uploadProductImageDataUrl } from '../storage/upload.js';
import type { ProductVariantPayload } from './variants.js';

type SupabaseLike = {
  from: (table: string) => any;
};

type UploadedImage = {
  url: string;
  path: string;
};

type ProductImageUploader = (image: string, name: string) => Promise<UploadedImage>;

export async function saveProductImages(
  supabase: SupabaseLike,
  productId: string,
  images: string[],
  title: string,
  uploadImage: ProductImageUploader = uploadProductImageDataUrl
) {
  if (images.length === 0) {
    const { error } = await supabase.from('product_images').delete().eq('product_id', productId);
    if (error) throw error;
    return;
  }

  const uploaded = await Promise.all(images.map((image, index) => uploadImage(image, `${title}-${index + 1}`)));
  const { data: existingImages, error: existingError } = await supabase
    .from('product_images')
    .select('id')
    .eq('product_id', productId);
  if (existingError) throw existingError;

  const rows = uploaded.map((image, index) => ({
    product_id: productId,
    url: image.url,
    path: image.path,
    name: `${title} ${index + 1}`,
    sort_order: index,
  }));

  const { error: insertError } = await supabase.from('product_images').insert(rows);
  if (insertError) throw insertError;

  const oldIds = (existingImages ?? []).map((image: { id: string }) => image.id).filter(Boolean);
  if (oldIds.length === 0) return;

  const { error: deleteError } = await supabase.from('product_images').delete().in('id', oldIds);
  if (deleteError) throw deleteError;
}

export async function saveProductVariants(
  supabase: SupabaseLike,
  productId: string,
  variants: ProductVariantPayload[]
) {
  if (variants.length === 0) {
    const { error } = await supabase.from('product_variants').delete().eq('product_id', productId);
    if (error) throw error;
    return;
  }

  const { data: existingVariants, error: existingError } = await supabase
    .from('product_variants')
    .select('id')
    .eq('product_id', productId);
  if (existingError) throw existingError;

  const rows = variants.map((variant) => ({
    product_id: productId,
    label: variant.label || variant.options.map((option) => `${option.name}: ${option.value}`).join(' / '),
    sku: variant.sku || null,
    options: variant.options,
    price: variant.price ?? null,
    stock_quantity: variant.stockQuantity,
    is_active: variant.isActive,
  }));

  const { error: insertError } = await supabase.from('product_variants').insert(rows);
  if (insertError) throw insertError;

  const oldIds = (existingVariants ?? []).map((variant: { id: string }) => variant.id).filter(Boolean);
  if (oldIds.length === 0) return;

  const { error: deleteError } = await supabase.from('product_variants').delete().in('id', oldIds);
  if (deleteError) throw deleteError;
}
