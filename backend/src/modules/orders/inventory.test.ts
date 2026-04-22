import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildInventoryAdjustments } from './inventory.js';

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
