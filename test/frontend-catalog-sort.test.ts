import assert from 'node:assert/strict';
import { test } from 'node:test';

import { sortCatalogProducts } from '../frontend/src/components/catalog/catalogSort.ts';
import type { Product } from '../frontend/src/types/index.ts';

const products: Product[] = [
  {
    id: 'p1',
    name: 'Top',
    description: 'Top esportivo',
    price: 119.9,
    imageUrl: '',
    category: 'Feminina',
    relevanceScore: 4200,
    isFeatured: false,
    isNew: false,
    createdAt: '2026-04-01T00:00:00.000Z',
  },
  {
    id: 'p2',
    name: 'Regata',
    description: 'Regata esportiva',
    price: 79.9,
    imageUrl: '',
    category: 'Feminina',
    relevanceScore: 900,
    isFeatured: true,
    isNew: false,
    createdAt: '2026-04-20T00:00:00.000Z',
  },
  {
    id: 'p3',
    name: 'Cropped',
    description: 'Cropped feminino',
    price: 99.9,
    imageUrl: '',
    category: 'Feminina',
    relevanceScore: 2100,
    isFeatured: false,
    isNew: true,
    createdAt: '2026-04-18T00:00:00.000Z',
  },
];

test('sorts by lower price first', () => {
  assert.deepEqual(sortCatalogProducts(products, 'price-asc').map((product) => product.id), ['p2', 'p3', 'p1']);
});

test('sorts by higher price first', () => {
  assert.deepEqual(sortCatalogProducts(products, 'price-desc').map((product) => product.id), ['p1', 'p3', 'p2']);
});

test('sorts by relevance score first', () => {
  assert.deepEqual(sortCatalogProducts(products, 'relevance').map((product) => product.id), ['p1', 'p3', 'p2']);
});
