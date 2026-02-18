import { create } from 'zustand';
import { User } from '../models/types';
import { authService } from '../services/auth.service';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  // 2FA login flow
  requires2FA: boolean;
  pending2FACredentials: { email: string; password: string } | null;
  // 2FA setup
  twoFAQrCode: string | null;
  twoFASecret: string | null;
  twoFALoading: boolean;
  twoFAMessage: string | null;

  login: (email: string, password: string) => Promise<void>;
  loginWith2FA: (code: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => void;
  clearError: () => void;
  // 2FA management
  generate2FA: () => Promise<void>;
  enable2FA: (token: string) => Promise<void>;
  disable2FA: (password: string) => Promise<void>;
  clearTwoFASetup: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: authService.getStoredUser(),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,
  requires2FA: false,
  pending2FACredentials: null,
  twoFAQrCode: null,
  twoFASecret: null,
  twoFALoading: false,
  twoFAMessage: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null, requires2FA: false });
    try {
      const response = await authService.login({ email, password });
      if ((response as any).requires2FA) {
        set({
          requires2FA: true,
          pending2FACredentials: { email, password },
          isLoading: false,
        });
        return;
      }
      set({ user: response.user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  loginWith2FA: async (code) => {
    const creds = get().pending2FACredentials;
    if (!creds) return;
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login({
        email: creds.email,
        password: creds.password,
        twoFactorCode: code,
      });
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        requires2FA: false,
        pending2FACredentials: null,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Invalid authentication code',
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register({ name, email, password });
      set({ user: response.user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Registration failed',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: () => {
    const user = authService.getStoredUser();
    const isAuthenticated = authService.isAuthenticated();
    set({ user, isAuthenticated });
  },

  clearError: () => set({ error: null }),

  generate2FA: async () => {
    set({ twoFALoading: true, twoFAMessage: null, error: null });
    try {
      const res = await authService.generate2FA();
      set({
        twoFAQrCode: res.qrCode,
        twoFASecret: res.secret,
        twoFALoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to generate 2FA secret',
        twoFALoading: false,
      });
    }
  },

  enable2FA: async (token) => {
    set({ twoFALoading: true, twoFAMessage: null, error: null });
    try {
      const res = await authService.enable2FA(token);
      authService.updateStoredUser({ two_factor_enabled: true });
      set({
        twoFALoading: false,
        twoFAMessage: res.message,
        twoFAQrCode: null,
        twoFASecret: null,
        user: { ...get().user!, two_factor_enabled: true },
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to enable 2FA',
        twoFALoading: false,
      });
    }
  },

  disable2FA: async (password) => {
    set({ twoFALoading: true, twoFAMessage: null, error: null });
    try {
      const res = await authService.disable2FA(password);
      authService.updateStoredUser({ two_factor_enabled: false });
      set({
        twoFALoading: false,
        twoFAMessage: res.message,
        user: { ...get().user!, two_factor_enabled: false },
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to disable 2FA',
        twoFALoading: false,
      });
    }
  },

  clearTwoFASetup: () =>
    set({
      twoFAQrCode: null,
      twoFASecret: null,
      twoFAMessage: null,
      error: null,
    }),
}));
