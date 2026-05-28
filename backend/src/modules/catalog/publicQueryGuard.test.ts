import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { assertPublicCatalogQuery, applyPublicCatalogProductVisibility } from './publicQueryGuard.js';
import { ApiError } from '../../lib/http.js';

describe('assertPublicCatalogQuery', () => {
  it('rejects includeInactive on public catalog endpoints', () => {
    assert.throws(
      () => assertPublicCatalogQuery({ includeInactive: 'true' }),
      (error) => error instanceof ApiError && error.status === 401
    );
  });

  it('allows normal public catalog requests', () => {
    assert.doesNotThrow(() => assertPublicCatalogQuery({}));
  });

  it('keeps only active live products in public catalog queries', () => {
    const calls: Array<[string, unknown]> = [];
    const query = {
      eq(field: string, value: unknown) {
        calls.push([field, value]);
        return this;
      },
    };

    assert.equal(applyPublicCatalogProductVisibility(query), query);
    assert.deepEqual(calls, [
      ['is_active', true],
      ['catalog_status', 'live'],
    ]);
  });
});
