import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useAuthStore } from '../stores/authStore';

const api = axios.create({
  baseURL: 'http://localhost:8080', // API Gateway
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {

    try {
      const decoded: any = jwtDecode(token);
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        // Token expired – abort request immediately
        const { logout } = useAuthStore.getState();
        logout();
        window.location.href = '/login';
        return Promise.reject(new Error('Token expired'));
      }
    } catch {
      // Token invalid
      const { logout } = useAuthStore.getState();
      logout();
      window.location.href = '/login';
      return Promise.reject(new Error('Invalid token'));
    }



    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;