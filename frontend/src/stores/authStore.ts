import { create } from 'zustand';
import api from '../lib/api';

interface User {
  id: number;
  username: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('accessToken'),

  login: async (username, password) => {
    try {
      const response = await api.post('/api/auth/login', { username, password });
      const { accessToken, id, username: uname, role } = response.data;
      localStorage.setItem('accessToken', accessToken);
      set({ user: { id, username: uname, role }, token: accessToken });
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Login failed';
      throw new Error(message);
    }
  },

  register: async (username, email, password, role) => {
    try {
      await api.post('/api/auth/register', { username, email, password, role });
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Registration failed';
      throw new Error(message);
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    set({ user: null, token: null });
  },
}));