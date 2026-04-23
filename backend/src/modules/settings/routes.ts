import { Router } from 'express';
import { getSupabaseAdmin } from '../../lib/supabase.js';
import { handleError, ok } from '../../lib/http.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { normalizePublicSettingsPayload } from './publicSettings.js';

export const settingsRouter = Router();

function toObject(rows: any[] = []) {
  return rows.reduce<Record<string, string>>((acc, row) => {
    acc[row.key] = row.value ?? '';
    return acc;
  }, {});
}

settingsRouter.get('/', async (_req, res) => {
  try {
    const { data, error } = await getSupabaseAdmin().from('settings').select('key,value').eq('is_public', true);
    if (error) throw error;
    return ok(res, toObject(data ?? []));
  } catch (error) {
    return handleError(res, error);
  }
});

settingsRouter.put('/', requireAuth, async (req, res) => {
  try {
    const now = new Date().toISOString();
    const entries = normalizePublicSettingsPayload(req.body ?? {}).map((entry) => ({
      ...entry,
      updated_at: now,
    }));

    if (entries.length === 0) return ok(res, {});

    const { data, error } = await getSupabaseAdmin()
      .from('settings')
      .upsert(entries, { onConflict: 'key' })
      .select('key,value,is_public');

    if (error) throw error;
    return ok(res, toObject(data ?? []));
  } catch (error) {
    return handleError(res, error);
  }
});
