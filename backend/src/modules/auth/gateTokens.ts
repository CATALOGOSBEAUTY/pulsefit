import crypto from 'crypto';
import { ApiError } from '../../lib/http.js';

const GATE_TOKEN_TTL_MS = 10 * 60_000;
const GATE_TOKEN_KEY_PREFIX = 'admin_gate_token:';

export interface StoredGateToken {
  id?: string;
  expires_at: string;
  consumed_at: string | null;
}

export function createOpaqueGateToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

export function hashGateToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function isStoredGateTokenUsable(token: StoredGateToken | null | undefined, now = new Date()): token is StoredGateToken {
  if (!token || token.consumed_at) return false;
  return new Date(token.expires_at).getTime() > now.getTime();
}

function gateTokenKey(tokenHash: string): string {
  return `${GATE_TOKEN_KEY_PREFIX}${tokenHash}`;
}

function parseStoredGateToken(value: string | null | undefined): StoredGateToken | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as StoredGateToken;
    return typeof parsed.expires_at === 'string' && 'consumed_at' in parsed ? parsed : null;
  } catch {
    return null;
  }
}

export async function createStoredGateToken(supabase: any, now = new Date()): Promise<string> {
  const rawToken = createOpaqueGateToken();
  const expiresAt = new Date(now.getTime() + GATE_TOKEN_TTL_MS).toISOString();
  const tokenHash = hashGateToken(rawToken);

  const { error } = await supabase.from('settings').upsert({
    key: gateTokenKey(tokenHash),
    value: JSON.stringify({ expires_at: expiresAt, consumed_at: null }),
    is_public: false,
  }, { onConflict: 'key' });

  if (error) {
    throw new ApiError(503, 'Nao foi possivel criar token de acesso admin.');
  }

  return rawToken;
}

export async function consumeStoredGateToken(supabase: any, rawToken: string, now = new Date()): Promise<void> {
  const tokenHash = hashGateToken(rawToken);
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', gateTokenKey(tokenHash))
    .eq('is_public', false)
    .maybeSingle();

  const storedToken = parseStoredGateToken(data?.value);

  if (error || !isStoredGateTokenUsable(storedToken, now)) {
    throw new ApiError(401, 'Acesso admin expirado.');
  }

  const { error: updateError } = await supabase
    .from('settings')
    .update({
      value: JSON.stringify({ ...storedToken, consumed_at: now.toISOString() }),
      is_public: false,
    })
    .eq('key', gateTokenKey(tokenHash))
    .eq('value', data.value);

  if (updateError) {
    throw new ApiError(401, 'Acesso admin expirado.');
  }
}
