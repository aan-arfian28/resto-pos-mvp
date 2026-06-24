"use client";

import { create } from "zustand";
import type { User, UserRole } from "@/types";
import { authService } from "@/services/authService";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  checkAuth: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login({ username, password });
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Login gagal. Silakan coba lagi.";
      set({
        isLoading: false,
        error: message,
        isAuthenticated: false,
      });
      throw err;
    }
  },

  logout: () => {
    authService.logout();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  setUser: (user: User) => {
    set({ user });
  },

  checkAuth: () => {
    set({ isLoading: true });
    const token = authService.getStoredToken();
    const user = authService.getStoredUser();
    if (token && user) {
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  hasRole: (...roles: UserRole[]) => {
    const { user } = get();
    if (!user) return false;
    return roles.includes(user.role);
  },

  clearError: () => set({ error: null }),
}));
