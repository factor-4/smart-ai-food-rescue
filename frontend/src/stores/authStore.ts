import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
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
  hydrate: () => void;
}

let logoutTimer: ReturnType<typeof setTimeout> | null = null;

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('accessToken'),

  login: async (username, password) => {
    try {
      const response = await api.post('/api/auth/login', { username, password });
      const { accessToken, id, username: uname, role } = response.data;

      localStorage.setItem('accessToken', accessToken);
      set({ user: { id, username: uname, role }, token: accessToken });

      // Decode token to get expiry time
      const decoded: any = jwtDecode(accessToken);
      if (decoded.exp) {
        const expiresInMs = decoded.exp * 1000 - Date.now();
        if (expiresInMs > 0) {
          // Clear any existing timer
          if (logoutTimer) clearTimeout(logoutTimer);
          // Set a new timer that logs out automatically when the token expires
          logoutTimer = setTimeout(() => {
            localStorage.removeItem('accessToken');
            set({ user: null, token: null });
            window.location.href = '/login';
          }, expiresInMs);
        }
      }
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
    // Clear timer on manual logout
    if (logoutTimer) {
      clearTimeout(logoutTimer);
      logoutTimer = null;
    }
    localStorage.removeItem('accessToken');
    set({ user: null, token: null });
  },

  hydrate: () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ token: null, user: null });
      return;
    }
    try {
      const decoded: any = jwtDecode(token);
      // If token expired, clear everything
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('accessToken');
        set({ token: null, user: null });
        return;
      }
      const user: User = {
        id: decoded.userId,
        username: decoded.sub,
        role: decoded.roles?.[0] || 'ROLE_USER',
      };
      set({ token, user });
    } catch {
      localStorage.removeItem('accessToken');
      set({ token: null, user: null });
    }
  },
}));

// Hydrate immediately on module load
useAuthStore.getState().hydrate();