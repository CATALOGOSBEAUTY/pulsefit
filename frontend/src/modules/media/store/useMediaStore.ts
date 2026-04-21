import { create } from 'zustand';
import * as mediaService from '../../../services/mediaService';

export interface MediaItem {
  id: string;
  url: string;
  name: string;
  path?: string;
  mime_type?: string;
  size_bytes?: number;
  created_at: string;
}

interface MediaState {
  items: MediaItem[];
  isLoading: boolean;
  error: string;
  fetchMedia: () => Promise<void>;
  addMedia: (url: string, name: string) => Promise<void>;
  removeMedia: (id: string) => Promise<void>;
}

export const useMediaStore = create<MediaState>((set) => ({
  items: [],
  isLoading: false,
  error: '',
  fetchMedia: async () => {
    set({ isLoading: true, error: '' });
    try {
      const items = await mediaService.listMedia();
      set({ items, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
  addMedia: async (url, name) => {
    const created = await mediaService.uploadMedia(url, name);
    set((state) => ({ items: [created, ...state.items] }));
  },
  removeMedia: async (id) => {
    await mediaService.deleteMedia(id);
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },
}));
