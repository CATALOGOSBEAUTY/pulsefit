import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  getInitialSelectedVariantId,
  getTotalAvailableStock,
  getVisibleVariantOptions,
} from '../frontend/src/components/catalog/productOptions.ts';
import {
  createVariantFromPreset,
  getVariationPreset,
  VARIATION_PRESETS,
} from '../frontend/src/modules/products/components/variantPresets.ts';
import type { Product } from '../frontend/src/types/index.ts';

const productWithVariants: Product = {
  id: 'product-1',
  name: 'Top esportivo',
  description: 'Top fitness feminino',
  price: 99.9,
  imageUrl: '',
  category: 'Tops Esportivos',
  stockQuantity: 50,
  variantsEnabled: true,
  variants: [
    {
      id: 'variant-p',
      label: 'Tamanho: P',
      options: [{ name: 'Tamanho', value: 'P' }],
      price: null,
      stockQuantity: 0,
      isActive: true,
    },
    {
      id: 'variant-m',
      label: 'Tamanho: M',
      options: [{ name: 'Tamanho', value: 'M' }],
      price: 109.9,
      stockQuantity: 7,
      isActive: true,
    },
    {
      id: 'variant-g',
      label: 'Tamanho: G',
      options: [{ name: 'Tamanho', value: 'G' }],
      price: null,
      stockQuantity: 3,
      isActive: true,
    },
    {
      id: 'variant-hidden',
      label: 'Tamanho: GG',
      options: [{ name: 'Tamanho', value: 'GG' }],
      price: null,
      stockQuantity: 99,
      isActive: false,
    },
  ],
};

test('sums only active variant stock when product uses variants', () => {
  assert.equal(getTotalAvailableStock(productWithVariants), 10);
});

test('selects the first active variant with stock as the initial option', () => {
  assert.equal(getInitialSelectedVariantId(productWithVariants), 'variant-m');
});

test('builds visible variant options with stock, price and disabled state', () => {
  assert.deepEqual(
    getVisibleVariantOptions(productWithVariants).map((option) => ({
      id: option.id,
      title: option.title,
      price: option.price,
      stockQuantity: option.stockQuantity,
      isAvailable: option.isAvailable,
    })),
    [
      {
        id: 'variant-p',
        title: 'Tamanho: P',
        price: 99.9,
        stockQuantity: 0,
        isAvailable: false,
      },
      {
        id: 'variant-m',
        title: 'Tamanho: M',
        price: 109.9,
        stockQuantity: 7,
        isAvailable: true,
      },
      {
        id: 'variant-g',
        title: 'Tamanho: G',
        price: 99.9,
        stockQuantity: 3,
        isAvailable: true,
      },
    ],
  );
});

test('variation presets include clothing, shoe, pants and free catalog options', () => {
  assert.deepEqual(
    VARIATION_PRESETS.map((preset) => preset.id),
    ['clothing-size', 'shoe-size', 'pants-size', 'color', 'flavor', 'voltage', 'model', 'custom'],
  );
  assert.deepEqual(getVariationPreset('shoe-size').values.slice(0, 3), ['36', '37', '38']);
  assert.deepEqual(getVariationPreset('clothing-size').values, ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XXG']);
});

test('creates an editable admin variant from a preset value', () => {
  assert.deepEqual(createVariantFromPreset('pants-size', '38'), {
    label: 'Tamanho calca: 38',
    sku: '',
    options: [{ name: 'Tamanho calca', value: '38' }],
    price: null,
    stockQuantity: 0,
    isActive: true,
  });
});
