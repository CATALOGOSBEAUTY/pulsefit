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
  it('decrements stock through the atomic inventory RPC', async () => {
    const calls: Array<Record<string, unknown>> = [];
    const supabase = {
      async rpc(name: string, params: Record<string, unknown>) {
        calls.push({ name, params });
        return { data: [{ previous_stock: 5, next_stock: 3 }], error: null };
      },
    };

    await applyInventoryAdjustments(supabase, [
      { product_id: 'p1', product_variant_id: 'v1', quantity: 2 },
    ]);

    assert.deepEqual(calls, [
      {
        name: 'decrement_inventory_stock',
        params: {
          target_table: 'product_variants',
          target_id: 'v1',
          decrement_by: 2,
        },
      },
    ]);
  });

  it('rolls back previous stock updates when a later update fails', async () => {
    const stocks: Record<string, number> = { v1: 5, v2: 5 };
    const supabase = {
      async rpc(_name: string, params: Record<string, unknown>) {
        const id = String(params.target_id);
        if (id === 'v2') return { data: null, error: new Error('update failed') };
        const previousStock = stocks[id];
        stocks[id] = previousStock - Number(params.decrement_by);
        return { data: [{ previous_stock: previousStock, next_stock: stocks[id] }], error: null };
      },
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
      (error) => error instanceof ApiError && error.status === 400
    );

    assert.equal(stocks.v1, 5);
  });

  it('rejects quantities above managed base product stock', async () => {
    const stocks: Record<string, number> = { p1: 1 };
    const supabase = {
      async rpc() {
        return { data: null, error: { message: 'Estoque insuficiente', code: 'P0001' } };
      },
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
