import axios, { InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ??
    'https://api.modahaus.co.za/api', // ← CHANGE to your real backend URL
  timeout: 10000,
  withCredentials: true,
});

/**
 * Attach JWT token safely (Axios v1+ compatible)
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Handle auth expiration safely
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const auth = useAuthStore.getState();
      if (auth.user) {
        auth.logout();
      }
    }
    return Promise.reject(error);
  }
);

export default api;