import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { saveProductImages, saveProductVariants } from './childCollections.js';

function createTable() {
  return {
    calls: [] as Array<{ action: string; payload?: unknown }>,
    selectResult: { data: [{ id: 'old-1' }], error: null },
    insertResult: { data: [], error: null as Error | null },
    deleteResult: { error: null as Error | null },
    select() {
      this.calls.push({ action: 'select' });
      return this;
    },
    insert(payload: unknown) {
      this.calls.push({ action: 'insert', payload });
      return this.insertResult;
    },
    delete() {
      this.calls.push({ action: 'delete' });
      return this;
    },
    eq(_field: string, _value: string) {
      this.calls.push({ action: 'eq' });
      return this.selectResult;
    },
    in(_field: string, _values: string[]) {
      this.calls.push({ action: 'in' });
      return this.deleteResult;
    },
  };
}

describe('product child collection replacement', () => {
  it('keeps existing images when preparing new uploads fails', async () => {
    const table = createTable();
    const supabase = { from: () => table };

    await assert.rejects(
      () => saveProductImages(supabase, 'product-1', ['bad-image'], 'Produto', async () => {
        throw new Error('upload failed');
      }),
      /upload failed/
    );

    assert.equal(table.calls.some((call) => call.action === 'delete'), false);
    assert.equal(table.calls.some((call) => call.action === 'insert'), false);
  });

  it('inserts replacement variants before deleting old variants', async () => {
    const table = createTable();
    const supabase = { from: () => table };

    await saveProductVariants(supabase, 'product-1', [{
      label: 'P',
      sku: '',
      options: [{ name: 'Tamanho', value: 'P' }],
      price: null,
      stockQuantity: 3,
      isActive: true,
    }]);

    assert.deepEqual(table.calls.map((call) => call.action), ['select', 'eq', 'insert', 'delete', 'in']);
  });
});
