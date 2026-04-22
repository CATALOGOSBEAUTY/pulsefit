interface InventoryItem {
  product_id: string;
  product_variant_id?: string | null;
  quantity: number;
}

export function buildInventoryAdjustments(items: InventoryItem[]) {
  return items.reduce(
    (acc, item) => {
      if (item.product_variant_id) {
        acc.productVariants.push({ id: item.product_variant_id, quantity: item.quantity });
      } else {
        acc.products.push({ id: item.product_id, quantity: item.quantity });
      }
      return acc;
    },
    {
      productVariants: [] as Array<{ id: string; quantity: number }>,
      products: [] as Array<{ id: string; quantity: number }>,
    }
  );
}

export async function applyInventoryAdjustments(supabase: any, items: InventoryItem[]) {
  const adjustments = buildInventoryAdjustments(items);

  for (const adjustment of adjustments.productVariants) {
    const { data: variant, error: readError } = await supabase
      .from('product_variants')
      .select('stock_quantity')
      .eq('id', adjustment.id)
      .single();
    if (readError) throw readError;

    const nextStock = Math.max(0, Number(variant.stock_quantity ?? 0) - adjustment.quantity);
    const { error: updateError } = await supabase
      .from('product_variants')
      .update({ stock_quantity: nextStock, updated_at: new Date().toISOString() })
      .eq('id', adjustment.id);
    if (updateError) throw updateError;
  }

  for (const adjustment of adjustments.products) {
    const { data: product, error: readError } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', adjustment.id)
      .single();
    if (readError) throw readError;

    const currentStock = Number(product.stock_quantity ?? 0);
    if (currentStock <= 0) continue;

    const nextStock = Math.max(0, currentStock - adjustment.quantity);
    const { error: updateError } = await supabase
      .from('products')
      .update({ stock_quantity: nextStock, updated_at: new Date().toISOString() })
      .eq('id', adjustment.id);
    if (updateError) throw updateError;
  }
}
