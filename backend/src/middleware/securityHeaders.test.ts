import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { applySecurityHeaders } from './securityHeaders.js';

describe('applySecurityHeaders', () => {
  it('sets strict API security headers', () => {
    const headers = new Map<string, string>();

    applySecurityHeaders((name, value) => headers.set(name, value));

    assert.equal(headers.get('Content-Security-Policy'), "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
    assert.equal(headers.get('X-Permitted-Cross-Domain-Policies'), 'none');
    assert.equal(headers.get('Origin-Agent-Cluster'), '?1');
    assert.equal(headers.get('Strict-Transport-Security'), 'max-age=31536000; includeSubDomains; preload');
  });
});
