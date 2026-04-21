import crypto from 'crypto';
import { env } from '../../config/env.js';
import { ApiError } from '../../lib/http.js';
import { getSupabaseAdmin } from '../../lib/supabase.js';

const dataUrlPattern = /^data:(?<mime>[-\w/+.;=]+);base64,(?<data>.+)$/;

export async function uploadDataUrl(dataUrl: string, bucket: string, name: string): Promise<{ url: string; path: string; mimeType: string; size: number }> {
  const match = dataUrl.match(dataUrlPattern);
  if (!match?.groups?.mime || !match.groups.data) {
    return { url: dataUrl, path: '', mimeType: 'external/url', size: 0 };
  }

  const mimeType = match.groups.mime;
  if (!mimeType.startsWith('image/')) {
    throw new ApiError(400, 'Apenas imagens sao permitidas.');
  }

  const buffer = Buffer.from(match.groups.data, 'base64');
  const extension = mimeType.split('/')[1]?.split(';')[0] || 'jpg';
  const safeName = name.replace(/[^\w.-]+/g, '-').slice(0, 80) || 'image';
  const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${safeName}.${extension}`;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: mimeType,
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, path, mimeType, size: buffer.byteLength };
}

export async function uploadMediaDataUrl(dataUrl: string, name: string) {
  return uploadDataUrl(dataUrl, env.mediaBucket, name);
}

export async function uploadProductImageDataUrl(dataUrl: string, name: string) {
  return uploadDataUrl(dataUrl, env.productBucket, name);
}

