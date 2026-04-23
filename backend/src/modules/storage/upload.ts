import crypto from 'crypto';
import { env } from '../../config/env.js';
import { ApiError } from '../../lib/http.js';
import { getSupabaseAdmin } from '../../lib/supabase.js';

const dataUrlPattern = /^data:(?<mime>[-\w/+.;=]+);base64,(?<data>.+)$/;
const allowedImageMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const maxUploadBytes = 8 * 1024 * 1024;

type ValidUploadInput =
  | { kind: 'external'; url: string; mimeType: 'external/url'; size: 0 }
  | { kind: 'data'; buffer: Buffer; mimeType: string; size: number; extension: string };

export function validateUploadInput(input: string): ValidUploadInput {
  const match = input.match(dataUrlPattern);
  if (!match?.groups?.mime || !match.groups.data) {
    let url: URL;
    try {
      url = new URL(input);
    } catch {
      throw new ApiError(400, 'URL de imagem invalida.');
    }

    if (url.protocol !== 'https:') {
      throw new ApiError(400, 'URLs externas de imagem devem usar HTTPS.');
    }

    return { kind: 'external', url: url.toString(), mimeType: 'external/url', size: 0 };
  }

  const mimeType = match.groups.mime.toLowerCase();
  if (!allowedImageMimeTypes.has(mimeType)) {
    throw new ApiError(400, 'Tipo de imagem nao permitido.');
  }

  const buffer = Buffer.from(match.groups.data, 'base64');
  if (buffer.byteLength > maxUploadBytes) {
    throw new ApiError(413, 'Imagem excede o limite de 8 MB.');
  }

  const extension = mimeType.split('/')[1] || 'jpg';
  return { kind: 'data', buffer, mimeType, size: buffer.byteLength, extension };
}

export async function uploadDataUrl(dataUrl: string, bucket: string, name: string): Promise<{ url: string; path: string; mimeType: string; size: number }> {
  const validated = validateUploadInput(dataUrl);
  if (validated.kind === 'external') {
    return { url: validated.url, path: '', mimeType: validated.mimeType, size: validated.size };
  }

  const safeName = name.replace(/[^\w.-]+/g, '-').slice(0, 80) || 'image';
  const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${safeName}.${validated.extension}`;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(bucket).upload(path, validated.buffer, {
    contentType: validated.mimeType,
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, path, mimeType: validated.mimeType, size: validated.size };
}

export async function uploadMediaDataUrl(dataUrl: string, name: string) {
  return uploadDataUrl(dataUrl, env.mediaBucket, name);
}

export async function uploadProductImageDataUrl(dataUrl: string, name: string) {
  return uploadDataUrl(dataUrl, env.productBucket, name);
}
