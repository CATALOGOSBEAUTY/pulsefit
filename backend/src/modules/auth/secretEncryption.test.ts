import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { decryptSecret, encryptSecret } from './secretEncryption.js';

describe('secret encryption', () => {
  it('encrypts reversible secrets without storing plaintext', () => {
    const encrypted = encryptSecret('JBSWY3DPEHPK3PXP', 'jwt-secret-for-tests');

    assert.equal(encrypted.includes('JBSWY3DPEHPK3PXP'), false);
    assert.equal(decryptSecret(encrypted, 'jwt-secret-for-tests'), 'JBSWY3DPEHPK3PXP');
  });

  it('rejects tampered encrypted payloads', () => {
    const encrypted = encryptSecret('JBSWY3DPEHPK3PXP', 'jwt-secret-for-tests');

    assert.throws(() => decryptSecret(`${encrypted.slice(0, -2)}xx`, 'jwt-secret-for-tests'));
  });
});
