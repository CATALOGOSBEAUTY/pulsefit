import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ApiError } from '../../lib/http.js';
import { decryptSecret } from './secretEncryption.js';
import {
  ADMIN_TOTP_PENDING_SETUP_KEY,
  ADMIN_TOTP_SECRET_KEY,
  confirmAdminTotpSetup,
  getAdminTotpSetupStatus,
  hashTotpSetupToken,
  startAdminTotpSetup,
} from './totpSetup.js';
import { generateTotpCode } from './totp.js';

class SettingsTable {
  private filters: Record<string, unknown> = {};
  private selected = '';
  private readonly store: Map<string, { key: string; value: string; is_public: boolean }>;

  constructor(store: Map<string, { key: string; value: string; is_public: boolean }>) {
    this.store = store;
  }

  select(fields: string) {
    this.selected = fields;
    return this;
  }

  eq(field: string, value: unknown) {
    this.filters[field] = value;
    return this;
  }

  async maybeSingle() {
    const key = String(this.filters.key ?? '');
    const row = this.store.get(key);
    if (!row || ('is_public' in this.filters && row.is_public !== this.filters.is_public)) {
      return { data: null, error: null };
    }

    if (this.selected === 'value') {
      return { data: { value: row.value }, error: null };
    }

    return { data: row, error: null };
  }

  async upsert(row: { key: string; value: string; is_public: boolean }) {
    this.store.set(row.key, row);
    return { error: null };
  }

  delete() {
    return {
      eq: async (_field: string, value: unknown) => {
        this.store.delete(String(value));
        return { error: null };
      },
    };
  }
}

function createSupabase(settings = new Map<string, { key: string; value: string; is_public: boolean }>()) {
  return {
    settings,
    from(table: string) {
      assert.equal(table, 'settings');
      return new SettingsTable(settings);
    },
  };
}

describe('production TOTP setup', () => {
  it('reports whether an admin authenticator is configured', async () => {
    const supabase = createSupabase();

    assert.deepEqual(await getAdminTotpSetupStatus(supabase), { configured: false });

    supabase.settings.set(ADMIN_TOTP_SECRET_KEY, {
      key: ADMIN_TOTP_SECRET_KEY,
      value: 'encrypted-secret',
      is_public: false,
    });

    assert.deepEqual(await getAdminTotpSetupStatus(supabase), { configured: true });
  });

  it('blocks unauthenticated setup reset when an authenticator already exists', async () => {
    const supabase = createSupabase(new Map([
      [ADMIN_TOTP_SECRET_KEY, {
        key: ADMIN_TOTP_SECRET_KEY,
        value: 'encrypted-secret',
        is_public: false,
      }],
    ]));

    await assert.rejects(
      () => startAdminTotpSetup(supabase, { jwtSecret: 'jwt-secret-for-tests', allowReset: false }),
      (error) => error instanceof ApiError && error.status === 409
    );
  });

  it('stores pending setup with encrypted secret and hashed setup token only', async () => {
    const supabase = createSupabase();
    const setup = await startAdminTotpSetup(supabase, {
      jwtSecret: 'jwt-secret-for-tests',
      allowReset: false,
      now: new Date('2026-04-23T12:00:00.000Z'),
    });

    const pending = supabase.settings.get(ADMIN_TOTP_PENDING_SETUP_KEY);
    assert.ok(pending);
    assert.equal(pending.is_public, false);
    assert.equal(pending.value.includes(setup.setupKey), false);
    assert.equal(pending.value.includes(setup.setupToken), false);
    assert.equal(setup.otpauthUri.startsWith('otpauth://totp/'), true);
    assert.equal(setup.expiresAt, '2026-04-23T12:10:00.000Z');

    const stored = JSON.parse(pending.value);
    assert.equal(stored.setup_token_hash, hashTotpSetupToken(setup.setupToken));
    assert.equal(decryptSecret(stored.encrypted_secret, 'jwt-secret-for-tests'), setup.setupKey);
  });

  it('confirms a valid setup code and activates the encrypted authenticator secret', async () => {
    const supabase = createSupabase();
    const now = new Date('2026-04-23T12:00:00.000Z');
    const setup = await startAdminTotpSetup(supabase, {
      jwtSecret: 'jwt-secret-for-tests',
      allowReset: false,
      now,
    });
    const code = generateTotpCode(setup.setupKey, now);

    await confirmAdminTotpSetup(supabase, {
      jwtSecret: 'jwt-secret-for-tests',
      setupToken: setup.setupToken,
      code,
      now,
    });

    const active = supabase.settings.get(ADMIN_TOTP_SECRET_KEY);
    assert.ok(active);
    assert.equal(active.is_public, false);
    assert.equal(decryptSecret(active.value, 'jwt-secret-for-tests'), setup.setupKey);
    assert.equal(supabase.settings.has(ADMIN_TOTP_PENDING_SETUP_KEY), false);
  });

  it('rejects expired or mismatched setup confirmation attempts', async () => {
    const supabase = createSupabase();
    const setup = await startAdminTotpSetup(supabase, {
      jwtSecret: 'jwt-secret-for-tests',
      allowReset: false,
      now: new Date('2026-04-23T12:00:00.000Z'),
    });

    await assert.rejects(
      () => confirmAdminTotpSetup(supabase, {
        jwtSecret: 'jwt-secret-for-tests',
        setupToken: 'wrong-token',
        code: generateTotpCode(setup.setupKey, new Date('2026-04-23T12:01:00.000Z')),
        now: new Date('2026-04-23T12:01:00.000Z'),
      }),
      (error) => error instanceof ApiError && error.status === 401
    );

    await assert.rejects(
      () => confirmAdminTotpSetup(supabase, {
        jwtSecret: 'jwt-secret-for-tests',
        setupToken: setup.setupToken,
        code: generateTotpCode(setup.setupKey, new Date('2026-04-23T12:11:00.000Z')),
        now: new Date('2026-04-23T12:11:00.000Z'),
      }),
      (error) => error instanceof ApiError && error.status === 410
    );
  });
});
