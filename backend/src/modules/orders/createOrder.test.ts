import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createOrderWithItemsAndInventory } from './createOrder.js';

describe('createOrderWithItemsAndInventory', () => {
  it('deletes the created order when item creation fails', async () => {
    const calls: string[] = [];
    const supabase = {
      from(table: string) {
        if (table === 'orders') {
          return {
            insert() {
              calls.push('insert-order');
              return {
                select() {
                  return {
                    single: async () => ({ data: { id: 'order-1' }, error: null }),
                  };
                },
              };
            },
            delete() {
              calls.push('delete-order');
              return {
                eq: async () => ({ error: null }),
              };
            },
          };
        }

        return {
          insert() {
            calls.push('insert-items');
            return {
              select: async () => ({ data: null, error: new Error('items failed') }),
            };
          },
        };
      },
    };

    await assert.rejects(
      () => createOrderWithItemsAndInventory(
        supabase,
        { order_code: 'PULSE-TEST', total_amount: 10 },
        [{ product_id: 'product-1', product_name: 'Produto', unit_price: 10, quantity: 1, subtotal: 10 }],
        async () => undefined
      ),
      /items failed/
    );

    assert.deepEqual(calls, ['insert-order', 'insert-items', 'delete-order']);
  });
});
