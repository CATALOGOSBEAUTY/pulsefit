export interface ProductPayload {
  title: string;
  description: string;
  price: number;
  categoryId: string;
  subcategoryId?: string | null;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  isPromo: boolean;
  isNew: boolean;
  stockQuantity?: number;
}

export function mapProduct(row: any) {
  const images = Array.isArray(row.product_images)
    ? row.product_images
      .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((image: any) => image.url)
    : [];

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    price: Number(row.price ?? 0),
    categoryId: row.category_id,
    subcategoryId: row.subcategory_id ?? null,
    categoryName: row.categories?.name ?? row.category?.name ?? null,
    subcategoryName: row.subcategory?.name ?? null,
    images,
    isActive: Boolean(row.is_active),
    isFeatured: Boolean(row.is_featured),
    isPromo: Boolean(row.is_promo),
    isNew: Boolean(row.is_new),
    stockQuantity: Number(row.stock_quantity ?? 0),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
