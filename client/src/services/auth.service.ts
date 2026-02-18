import { apiClient } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from '../models/types';

export const authService = {
  async login(
    credentials: LoginRequest & { twoFactorCode?: string },
  ): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.LOGIN,
      credentials,
    );

    if (response.access_token) {
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  },

  async generate2FA(): Promise<{
    secret: string;
    qrCode: string;
    message: string;
  }> {
    return apiClient.post(API_ENDPOINTS.TWO_FA_GENERATE);
  },

  async enable2FA(token: string): Promise<{ message: string }> {
    return apiClient.post(API_ENDPOINTS.TWO_FA_ENABLE, { token });
  },

  async disable2FA(password: string): Promise<{ message: string }> {
    return apiClient.post(API_ENDPOINTS.TWO_FA_DISABLE, { password });
  },

  updateStoredUser(updates: Partial<User>): void {
    const stored = this.getStoredUser();
    if (stored) {
      const updated = { ...stored, ...updates };
      localStorage.setItem('user', JSON.stringify(updated));
    }
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.REGISTER,
      data,
    );

    if (response.access_token) {
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  },

  async getProfile(): Promise<User> {
    return apiClient.get<User>(API_ENDPOINTS.PROFILE);
  },

  async logout(): Promise<void> {
    try {
      // Call backend to blacklist token
      await apiClient.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      // Even if backend call fails, clear local storage
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  },

  getStoredUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
