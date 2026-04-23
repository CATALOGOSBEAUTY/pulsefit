import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { hashGateToken, isStoredGateTokenUsable } from './gateTokens.js';

describe('admin gate tokens', () => {
  it('hashes opaque gate tokens before persistence', () => {
    const hash = hashGateToken('raw-gate-token');

    assert.equal(hash.includes('raw-gate-token'), false);
    assert.equal(hash, hashGateToken('raw-gate-token'));
    assert.notEqual(hash, hashGateToken('other-token'));
  });

  it('accepts only unconsumed non-expired stored tokens', () => {
    const future = new Date('2026-04-23T12:05:00.000Z').toISOString();
    const past = new Date('2026-04-23T11:55:00.000Z').toISOString();
    const now = new Date('2026-04-23T12:00:00.000Z');

    assert.equal(isStoredGateTokenUsable({ expires_at: future, consumed_at: null }, now), true);
    assert.equal(isStoredGateTokenUsable({ expires_at: past, consumed_at: null }, now), false);
    assert.equal(isStoredGateTokenUsable({ expires_at: future, consumed_at: now.toISOString() }, now), false);
  });
});
