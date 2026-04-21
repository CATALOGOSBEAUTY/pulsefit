import { apiRequest } from './apiClient';
import { MediaItem } from '../modules/media/store/useMediaStore';

export async function listMedia() {
  return apiRequest<MediaItem[]>('/api/media', { auth: true });
}

export async function uploadMedia(dataUrl: string, name: string) {
  return apiRequest<MediaItem>('/api/media/upload', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ dataUrl, name }),
  });
}

export async function deleteMedia(id: string) {
  return apiRequest<{ ok: true }>(`/api/media/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}

