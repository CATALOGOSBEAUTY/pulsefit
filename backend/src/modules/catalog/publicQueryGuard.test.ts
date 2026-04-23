import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { assertPublicCatalogQuery } from './publicQueryGuard.js';
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
});
