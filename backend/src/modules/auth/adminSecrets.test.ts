import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { validateTotpSetting } from './adminSecrets.js';
import { encryptSecret } from './secretEncryption.js';
import { generateTotpCode } from './totp.js';
import { ApiError } from '../../lib/http.js';

describe('validateTotpSetting', () => {
  it('accepts valid Google Authenticator codes from encrypted Supabase settings', () => {
    const secret = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
    const jwtSecret = 'jwt-secret-for-tests';
    const now = new Date(59_000);
    const code = generateTotpCode(secret, now);

    assert.doesNotThrow(() => validateTotpSetting(code, encryptSecret(secret, jwtSecret), jwtSecret, now));
  });

  it('rejects invalid Google Authenticator codes', () => {
    const secret = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
    const jwtSecret = 'jwt-secret-for-tests';

    assert.throws(
      () => validateTotpSetting('000000', encryptSecret(secret, jwtSecret), jwtSecret, new Date(59_000)),
      (error) => error instanceof ApiError && error.status === 403
    );
  });
});
