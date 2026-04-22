import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env, assertSupabaseConfigured } from '../config/env.js';

let supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin() {
  assertSupabaseConfigured();

  if (!supabaseAdmin) {
    supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseAdmin;
}
