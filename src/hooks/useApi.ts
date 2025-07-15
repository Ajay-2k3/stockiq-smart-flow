import { useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ✅ Create Axios instance with custom status handling
const api = axios.create({
  baseURL: API_BASE_URL,
  validateStatus: (status) => status < 400 || status === 409 // ⬅️ Don't throw for 409
});

// ✅ Hook: wraps Axios with optional auth
export const useApi = () => {
  const { user } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('stockiq_token');
    if (user && token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [user]);

  // ✅ Utility to extract .data safely
  const handleResponse = <T>(promise: Promise<any>): Promise<T> =>
    promise.then(res => res.data);

  return {
    get: <T = any>(url: string) => handleResponse<T>(api.get(url)),
    post: <T = any>(url: string, data?: any) => handleResponse<T>(api.post(url, data)),
    put: <T = any>(url: string, data?: any) => handleResponse<T>(api.put(url, data)),
    del: <T = any>(url: string) => handleResponse<T>(api.delete(url)),
    patch: <T = any>(url: string, data?: any) => handleResponse<T>(api.patch(url, data))
  };
};

export default api;
