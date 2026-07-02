'use client';

import { create } from 'zustand';
import type { AuthUser } from '@gh/backend/types';
import { api } from '@/lib/api-client';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  fetchUser: async () => {
    try {
      const res = await api.get<AuthUser>('/api/auth/me');
      set({ user: res.data ?? null, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },
  logout: async () => {
    try {
      await api.post('/api/auth/logout');
    } finally {
      set({ user: null });
    }
  },
}));
