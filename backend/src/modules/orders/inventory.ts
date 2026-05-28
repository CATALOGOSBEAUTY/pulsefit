import { ApiError } from '../../lib/http.js';

interface InventoryItem {
  product_id: string;
  product_variant_id?: string | null;
  quantity: number;
}

interface AppliedStockAdjustment {
  table: 'products' | 'product_variants';
  id: string;
  previousStock: number;
}

interface AtomicStockResult {
  previous_stock: number | string;
  next_stock: number | string;
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
  const applied: AppliedStockAdjustment[] = [];

  try {
    for (const adjustment of adjustments.productVariants) {
      const previousStock = await decrementStock(supabase, 'product_variants', adjustment.id, adjustment.quantity);
      applied.push({ table: 'product_variants', id: adjustment.id, previousStock });
    }

    for (const adjustment of adjustments.products) {
      const previousStock = await decrementStock(supabase, 'products', adjustment.id, adjustment.quantity);
      applied.push({ table: 'products', id: adjustment.id, previousStock });
    }
  } catch (error) {
    for (const adjustment of applied.reverse()) {
      await supabase
        .from(adjustment.table)
        .update({ stock_quantity: adjustment.previousStock, updated_at: new Date().toISOString() })
        .eq('id', adjustment.id);
    }
    throw error;
  }
}

async function decrementStock(
  supabase: any,
  table: 'products' | 'product_variants',
  id: string,
  quantity: number
): Promise<number> {
  const { data, error } = await supabase.rpc('decrement_inventory_stock', {
    target_table: table,
    target_id: id,
    decrement_by: quantity,
  });

  if (error) {
    throw new ApiError(400, table === 'product_variants'
      ? 'Estoque insuficiente para a variacao selecionada.'
      : 'Estoque insuficiente para o produto selecionado.');
  }

  const result = Array.isArray(data) ? data[0] as AtomicStockResult | undefined : data as AtomicStockResult | undefined;
  const previousStock = Number(result?.previous_stock);
  if (!Number.isFinite(previousStock)) {
    throw new ApiError(400, table === 'product_variants'
      ? 'Estoque insuficiente para a variacao selecionada.'
      : 'Estoque insuficiente para o produto selecionado.');
  }

  return previousStock;
}
