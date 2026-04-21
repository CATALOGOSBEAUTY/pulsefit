import { createClient } from '@supabase/supabase-js';
import { env, assertSupabaseConfigured } from '../config/env.js';

export function getSupabaseAdmin() {
  assertSupabaseConfigured();

  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

