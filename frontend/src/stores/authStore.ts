import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode'; // already used elsewhere in your project
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
  hydrate: () => void; // NEW – rebuild user from token
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('accessToken'), // reads existing token on load

  
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

  //
  hydrate: () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ token: null, user: null });
      return;
    }
    try {
      const decoded: any = jwtDecode(token);
      // Map  JWT payload (from user-service) to the User interface
      const user: User = {
        id: decoded.userId,                //  JWT claims: userId
        username: decoded.sub,             // sub = username
        role: decoded.roles?.[0] || 'ROLE_USER', // roles is an array, take first
      };
      set({ token, user });
    } catch {
      // Token is invalid/corrupted – clear everything
      localStorage.removeItem('accessToken');
      set({ token: null, user: null });
    }
  },
}));

// HYDRATE IMMEDIATELY – runs once when this module is first imported
useAuthStore.getState().hydrate();