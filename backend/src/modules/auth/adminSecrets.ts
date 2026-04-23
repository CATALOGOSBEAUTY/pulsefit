import { ApiError } from '../../lib/http.js';
import { getSupabaseAdmin } from '../../lib/supabase.js';
import { env } from '../../config/env.js';
import { decryptSecret } from './secretEncryption.js';
import { verifyTotpCode } from './totp.js';

type SecretPurpose = 'admin_totp';
const ADMIN_TOTP_SECRET_KEY = 'admin_totp_secret_encrypted';

export function validateTotpSetting(code: string, encryptedSecret: string, jwtSecret: string, now = new Date()): void {
  const secret = decryptSecret(encryptedSecret, jwtSecret);
  if (!verifyTotpCode(code, secret, now)) {
    throw new ApiError(403, 'Codigo autenticador invalido.');
  }
}

export async function validateAdminTotpFromSupabase(code: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', ADMIN_TOTP_SECRET_KEY)
    .eq('is_public', false)
    .maybeSingle();

  if (error) {
    throw new ApiError(503, 'Autenticador admin nao configurado no Supabase.');
  }

  if (!data?.value) {
    throw new ApiError(503, 'Autenticador admin nao configurado no Supabase.');
  }

  validateTotpSetting(code, data.value, env.jwtSecret);
}

export async function validateAdminAccessCode(accessCode: string, purpose: SecretPurpose = 'admin_totp'): Promise<void> {
  if (purpose !== 'admin_totp') {
    throw new ApiError(400, 'Finalidade de segredo admin invalida.');
  }

  await validateAdminTotpFromSupabase(accessCode);
}
