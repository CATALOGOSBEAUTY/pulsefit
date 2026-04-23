import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createSecretHash, verifySecretHash } from './secretHash.js';

describe('admin secret hashing', () => {
  it('stores a verifiable hash without exposing the original secret', () => {
    const stored = createSecretHash('SENHADEACESSO', {
      salt: 'fixed-test-salt',
      iterations: 1000,
    });

    assert.equal(stored.includes('SENHADEACESSO'), false);
    assert.equal(verifySecretHash('SENHADEACESSO', stored), true);
    assert.equal(verifySecretHash('senha-incorreta', stored), false);
  });

  it('rejects malformed hash configs', () => {
    assert.equal(verifySecretHash('SENHADEACESSO', 'plain-text-secret'), false);
  });
});
