import { Router } from 'express';
import { getSupabaseAdmin } from '../../lib/supabase.js';
import { ApiError, handleError, ok, requireString } from '../../lib/http.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { uploadMediaDataUrl } from '../storage/upload.js';

export const mediaRouter = Router();

function mapMedia(row: any) {
  return {
    id: row.id,
    url: row.url,
    name: row.name,
    path: row.path,
    mime_type: row.mime_type,
    size_bytes: row.size_bytes ?? 0,
    created_at: row.created_at,
  };
}

mediaRouter.get('/', requireAuth, async (_req, res) => {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('media_files')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return ok(res, (data ?? []).map(mapMedia));
  } catch (error) {
    return handleError(res, error);
  }
});

mediaRouter.post('/upload', requireAuth, async (req, res) => {
  try {
    const dataUrl = requireString(req.body.dataUrl ?? req.body.url, 'dataUrl');
    const name = requireString(req.body.name, 'name');
    const uploaded = await uploadMediaDataUrl(dataUrl, name);

    const { data, error } = await getSupabaseAdmin()
      .from('media_files')
      .insert({
        url: uploaded.url,
        path: uploaded.path,
        name,
        mime_type: uploaded.mimeType,
        size_bytes: uploaded.size,
      })
      .select('*')
      .single();

    if (error) throw error;
    return ok(res, mapMedia(data), 201);
  } catch (error) {
    return handleError(res, error);
  }
});

mediaRouter.delete('/:id', requireAuth, async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { data: media, error: fetchError } = await supabase.from('media_files').select('*').eq('id', req.params.id).single();
    if (fetchError) throw fetchError;
    if (!media) throw new ApiError(404, 'Midia nao encontrada.');

    const { error } = await supabase.from('media_files').delete().eq('id', req.params.id);
    if (error) throw error;

    return ok(res, { ok: true });
  } catch (error) {
    return handleError(res, error);
  }
});

