import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { applyInventoryAdjustments, buildInventoryAdjustments } from './inventory.js';
import { ApiError } from '../../lib/http.js';

describe('buildInventoryAdjustments', () => {
  it('reduces selected variant stock after an order is accepted', () => {
    const adjustments = buildInventoryAdjustments([
      { product_id: 'p1', product_variant_id: 'v1', quantity: 2 },
      { product_id: 'p1', product_variant_id: 'v2', quantity: 1 },
    ]);

    assert.deepEqual(adjustments, {
      productVariants: [
        { id: 'v1', quantity: 2 },
        { id: 'v2', quantity: 1 },
      ],
      products: [],
    });
  });

  it('reduces base product stock only when no variant was selected', () => {
    const adjustments = buildInventoryAdjustments([
      { product_id: 'p1', product_variant_id: null, quantity: 3 },
    ]);

    assert.deepEqual(adjustments, {
      productVariants: [],
      products: [{ id: 'p1', quantity: 3 }],
    });
  });
});

describe('applyInventoryAdjustments', () => {
  it('rolls back previous stock updates when a later update fails', async () => {
    const stocks: Record<string, number> = { v1: 5, v2: 5 };
    const supabase = {
      from(table: string) {
        let selectedId = '';
        return {
          select() {
            return this;
          },
          eq(_field: string, id: string) {
            selectedId = id;
            return this;
          },
          async single() {
            return { data: { stock_quantity: stocks[selectedId] }, error: null };
          },
          update(payload: { stock_quantity: number }) {
            return {
              eq: async (_field: string, id: string) => {
                if (table === 'product_variants' && id === 'v2') {
                  return { error: new Error('update failed') };
                }
                stocks[id] = payload.stock_quantity;
                return { error: null };
              },
            };
          },
        };
      },
    };

    await assert.rejects(
      () => applyInventoryAdjustments(supabase, [
        { product_id: 'p1', product_variant_id: 'v1', quantity: 2 },
        { product_id: 'p1', product_variant_id: 'v2', quantity: 1 },
      ]),
      /update failed/
    );

    assert.equal(stocks.v1, 5);
  });

  it('rejects quantities above managed base product stock', async () => {
    const stocks: Record<string, number> = { p1: 1 };
    const supabase = {
      from() {
        let selectedId = '';
        return {
          select() {
            return this;
          },
          eq(_field: string, id: string) {
            selectedId = id;
            return this;
          },
          async single() {
            return { data: { stock_quantity: stocks[selectedId] }, error: null };
          },
          update(payload: { stock_quantity: number }) {
            return {
              eq: async (_field: string, id: string) => {
                stocks[id] = payload.stock_quantity;
                return { error: null };
              },
            };
          },
        };
      },
    };

    await assert.rejects(
      () => applyInventoryAdjustments(supabase, [
        { product_id: 'p1', product_variant_id: null, quantity: 2 },
      ]),
      (error) => error instanceof ApiError && error.status === 400
    );

    assert.equal(stocks.p1, 1);
  });
});
