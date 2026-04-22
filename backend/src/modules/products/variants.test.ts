import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildVariantLabel, normalizeVariantOptions } from './variants.js';

describe('product variants', () => {
  it('normalizes option names and values without empty entries', () => {
    const options = normalizeVariantOptions([
      { name: ' Tamanho ', value: ' M ' },
      { name: 'Cor', value: ' ' },
      { name: '', value: 'Preto' },
      { name: 'Cor', value: 'Preto' },
    ]);

    assert.deepEqual(options, [
      { name: 'Tamanho', value: 'M' },
      { name: 'Cor', value: 'Preto' },
    ]);
  });

  it('builds a stable customer-facing variant label', () => {
    const label = buildVariantLabel([
      { name: 'Tamanho', value: 'M' },
      { name: 'Cor', value: 'Preto' },
    ]);

    assert.equal(label, 'Tamanho: M / Cor: Preto');
  });
});
