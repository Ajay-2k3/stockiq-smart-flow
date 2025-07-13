import { useState, useEffect } from 'react';
import axios, { AxiosRequestConfig } from 'axios';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

export const useApi = () => {
  const { user } = useAuth();

  // Set auth header when user changes
  useEffect(() => {
    if (user) {
      api.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('stockiq_token')}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [user]);

  return {
    get: (url: string) => api.get(url).then(res => res.data),
    post: (url: string, data?: any) => api.post(url, data).then(res => res.data),
    put: (url: string, data?: any) => api.put(url, data).then(res => res.data),
    del: (url: string) => api.delete(url).then(res => res.data),
    patch: (url: string, data?: any) => api.patch(url, data).then(res => res.data)
  };
};

export default api;