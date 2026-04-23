import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { normalizePublicSettingsPayload } from './publicSettings.js';

describe('normalizePublicSettingsPayload', () => {
  it('keeps only approved public setting keys', () => {
    assert.deepEqual(normalizePublicSettingsPayload({
      whatsapp_phone: ' 5511999999999 ',
      jwt_secret: 'must-not-be-public',
      SUPABASE_SERVICE_ROLE_KEY: 'must-not-be-public',
    }), [
      {
        key: 'whatsapp_phone',
        value: '5511999999999',
        is_public: true,
      },
    ]);
  });
});
