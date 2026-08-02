import { create } from 'zustand';
import type { AuthUser } from '@/types/auth';
import { authService } from '@/services/auth';
import { storage } from '@/utils/storage';

interface AuthStoreState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  setAuth: (user: AuthUser, token: string) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: AuthUser) => void;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  isAuthenticated: Boolean(storage.getAccessToken()),
  isLoading: true,
  user: null,

  setAuth: (user, token) => {
    storage.setAccessToken(token);
    set({ isAuthenticated: true, user, isLoading: false });
  },

  setUser: (user) => set({ user }),

  logout: async () => {
    try {
      if (storage.getAccessToken()) {
        await authService.logout();
      }
    } catch {
      // ignore
    } finally {
      storage.clearTokens();
      set({ isAuthenticated: false, user: null, isLoading: false });
    }
  },

  checkAuth: async () => {
    const token = storage.getAccessToken();
    if (!token) {
      set({ isAuthenticated: false, user: null, isLoading: false });
      return;
    }
    set({ isLoading: true });
    try {
      const user = await authService.getMe();
      set({ isAuthenticated: true, user, isLoading: false });
    } catch {
      storage.clearTokens();
      set({ isAuthenticated: false, user: null, isLoading: false });
    }
  },
}));
