import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { assertSafeJsonPayload } from './jsonGuard.js';
import { ApiError } from '../lib/http.js';

describe('assertSafeJsonPayload', () => {
  it('rejects prototype pollution keys anywhere in the payload', () => {
    assert.throws(
      () => assertSafeJsonPayload({
        title: 'Produto',
        variants: [{ options: [{ name: 'Tamanho', values: ['M'] }] }],
        nested: { constructor: { prototype: { polluted: true } } },
      }),
      (error) => error instanceof ApiError && error.status === 400
    );
  });

  it('allows ordinary JSON objects and arrays', () => {
    assert.doesNotThrow(() => assertSafeJsonPayload({
      title: 'Produto',
      variants: [{ options: [{ name: 'Tamanho', values: ['M'] }] }],
    }));
  });
});
