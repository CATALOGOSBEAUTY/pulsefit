import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildProductRelevanceMap } from './relevance.js';

describe('catalog relevance', () => {
  it('prioritizes products with more purchased units and more distinct orders', () => {
    const relevance = buildProductRelevanceMap(
      [
        { id: 'p1', is_featured: false, is_new: false, created_at: '2026-04-01T00:00:00.000Z' },
        { id: 'p2', is_featured: true, is_new: false, created_at: '2026-04-10T00:00:00.000Z' },
        { id: 'p3', is_featured: false, is_new: true, created_at: '2026-04-20T00:00:00.000Z' },
      ],
      [
        {
          status: 'paid',
          created_at: '2026-04-21T12:00:00.000Z',
          order_items: [
            { product_id: 'p1', quantity: 3 },
            { product_id: 'p2', quantity: 1 },
          ],
        },
        {
          status: 'confirmed',
          created_at: '2026-04-22T12:00:00.000Z',
          order_items: [
            { product_id: 'p1', quantity: 1 },
            { product_id: 'p2', quantity: 1 },
          ],
        },
        {
          status: 'cancelled',
          created_at: '2026-04-22T15:00:00.000Z',
          order_items: [
            { product_id: 'p3', quantity: 99 },
          ],
        },
      ],
      new Date('2026-04-22T18:00:00.000Z'),
    );

    assert.equal(relevance.p1.unitsSold, 4);
    assert.equal(relevance.p1.orderCount, 2);
    assert.equal(relevance.p2.unitsSold, 2);
    assert.equal(relevance.p2.orderCount, 2);
    assert.equal(relevance.p3.unitsSold, 0);
    assert.equal(relevance.p3.orderCount, 0);
    assert.ok(relevance.p1.score > relevance.p2.score);
  });

  it('uses featured, new and recency as fallback when products have no purchases', () => {
    const relevance = buildProductRelevanceMap(
      [
        { id: 'featured', is_featured: true, is_new: false, created_at: '2026-04-01T00:00:00.000Z' },
        { id: 'new', is_featured: false, is_new: true, created_at: '2026-04-20T00:00:00.000Z' },
        { id: 'plain', is_featured: false, is_new: false, created_at: '2026-01-01T00:00:00.000Z' },
      ],
      [],
      new Date('2026-04-22T18:00:00.000Z'),
    );

    assert.ok(relevance.featured.score > relevance.plain.score);
    assert.ok(relevance.new.score > relevance.plain.score);
  });
});
