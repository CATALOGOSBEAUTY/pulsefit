import { createClient } from '@supabase/supabase-js';
import { env, assertSupabaseConfigured } from '../config/env.js';
import { createSecretHash } from '../modules/auth/secretHash.js';

async function main() {
  assertSupabaseConfigured();

  if (!env.adminAccessCode) {
    throw new Error('ADMIN_ACCESS_CODE nao configurado para gerar o hash inicial.');
  }

  const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error: insertError } = await supabase.from('settings').upsert({
    key: 'admin_access_code_hash',
    value: createSecretHash(env.adminAccessCode),
    is_public: false,
  }, { onConflict: 'key' });

  if (insertError) {
    throw insertError;
  }

  console.log('Hash do codigo de acesso admin gravado no Supabase settings.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
