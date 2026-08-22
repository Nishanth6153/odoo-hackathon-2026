import type { LoginCredentials, LoginResponse, User } from '../types/auth.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage = data?.message || data?.error || 'Login failed. Please check your credentials.';
      throw new Error(errorMessage);
    }

    const token = data.token || data.accessToken;
    const user = data.user || data;

    if (!token || !user) {
      throw new Error('Invalid response from server.');
    }

    return { token, user };
  },

  async getCurrentUser(token: string): Promise<User> {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage = data?.message || data?.error || 'Failed to fetch user session.';
      throw new Error(errorMessage);
    }

    const user: User = data.user || data;
    if (!user || !user.id || !user.role) {
      throw new Error('Invalid user profile retrieved.');
    }

    return user;
  },
};
