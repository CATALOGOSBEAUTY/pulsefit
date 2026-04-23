import crypto from 'crypto';
import { env } from '../../config/env.js';
import { ApiError } from '../../lib/http.js';
import { getSupabaseAdmin } from '../../lib/supabase.js';
import { verifySecretHash } from './secretHash.js';

type SecretPurpose = 'admin_access_code';
const ADMIN_ACCESS_CODE_HASH_KEY = 'admin_access_code_hash';

export async function validateAdminAccessCodeFromSupabase(accessCode: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', ADMIN_ACCESS_CODE_HASH_KEY)
    .eq('is_public', false)
    .maybeSingle();

  if (error) {
    throw new ApiError(503, 'Segredo admin nao configurado no Supabase.');
  }

  if (!data?.value) {
    throw new ApiError(503, 'Segredo admin nao configurado no Supabase.');
  }

  if (!verifySecretHash(accessCode, data.value)) {
    throw new ApiError(403, 'Codigo de acesso invalido.');
  }
}

export async function validateAdminAccessCode(accessCode: string, purpose: SecretPurpose = 'admin_access_code'): Promise<void> {
  if (purpose !== 'admin_access_code') {
    throw new ApiError(400, 'Finalidade de segredo admin invalida.');
  }

  try {
    await validateAdminAccessCodeFromSupabase(accessCode);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 503) throw error;
    if (!env.adminAccessCode) throw error;

    const provided = Buffer.from(accessCode);
    const expected = Buffer.from(env.adminAccessCode);
    const matches = provided.length === expected.length && cryptoSafeEqual(provided, expected);
    if (!matches) throw error;
  }
}

function cryptoSafeEqual(provided: Buffer, expected: Buffer): boolean {
  return provided.length === expected.length && crypto.timingSafeEqual(provided, expected);
}
