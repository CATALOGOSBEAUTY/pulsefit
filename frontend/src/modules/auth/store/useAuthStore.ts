import { create } from 'zustand';
import { AdminUser, getCurrentUser, logout as clearSession } from '../../../services/authService';

interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: AdminUser | null) => void;
  setLoading: (loading: boolean) => void;
  hydrateSession: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  hydrateSession: async () => {
    set({ isLoading: true });
    const user = await getCurrentUser();
    set({ user, isAuthenticated: !!user, isLoading: false });
  },
  logout: async () => {
    await clearSession();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
}));
