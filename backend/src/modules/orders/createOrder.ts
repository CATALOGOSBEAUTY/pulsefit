import { applyInventoryAdjustments } from './inventory.js';

type SupabaseLike = {
  from: (table: string) => any;
};

type InventoryApplier = (supabase: SupabaseLike, items: any[]) => Promise<void>;

export async function createOrderWithItemsAndInventory(
  supabase: SupabaseLike,
  orderPayload: Record<string, unknown>,
  normalizedItems: any[],
  applyInventory: InventoryApplier = applyInventoryAdjustments
) {
  const { data: order, error: orderError } = await supabase.from('orders').insert(orderPayload).select('*').single();
  if (orderError) throw orderError;

  try {
    const { data: createdItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(normalizedItems.map((item) => ({ ...item, order_id: order.id })))
      .select('*');

    if (itemsError) throw itemsError;

    await applyInventory(supabase, normalizedItems);
    return { order, createdItems: createdItems ?? [] };
  } catch (error) {
    await supabase.from('orders').delete().eq('id', order.id);
    throw error;
  }
}
