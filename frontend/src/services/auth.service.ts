import apiClient from '../api/client';
import type { LoginCredentials, LoginResponse, User } from '../types/auth.types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const email = credentials.email || credentials.loginId || '';
    const password = credentials.password;

    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const data = res.data?.data || res.data;

      const token = data?.token;
      const rawUser = data?.user;

      if (!token || !rawUser) {
        throw new Error('Invalid response received from server.');
      }

      const user: User = {
        id: rawUser.id,
        email: rawUser.email,
        loginId: rawUser.email,
        name: rawUser.email.split('@')[0],
        role: rawUser.role,
        isEmailVerified: rawUser.isEmailVerified,
      };

      return { token, user };
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Login failed. Please check your credentials.';
      throw new Error(message);
    }
  },

  async getCurrentUser(token?: string): Promise<User> {
    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await apiClient.get('/auth/me', config);
      const data = res.data?.data || res.data;
      const rawUser = data?.user || data;

      if (!rawUser || !rawUser.id || !rawUser.role) {
        throw new Error('Invalid session data received.');
      }

      const user: User = {
        id: rawUser.id,
        email: rawUser.email,
        loginId: rawUser.email,
        name: rawUser.email.split('@')[0],
        role: rawUser.role,
        isEmailVerified: rawUser.isEmailVerified,
      };

      return user;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Session expired. Please log in again.';
      throw new Error(message);
    }
  },
};
