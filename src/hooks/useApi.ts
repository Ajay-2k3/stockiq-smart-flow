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

  return api;
};

// Generic hook for API requests
export const useApiRequest = <T>(
  url: string,
  options?: AxiosRequestConfig,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const api = useApi();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api(url, options);
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
};

// Inventory hooks
export const useInventory = () => {
  const api = useApi();
  
  return {
    getAll: (params?: any) => api.get('/inventory', { params }),
    getById: (id: string) => api.get(`/inventory/${id}`),
    create: (data: any) => api.post('/inventory', data),
    update: (id: string, data: any) => api.put(`/inventory/${id}`, data),
    delete: (id: string) => api.delete(`/inventory/${id}`)
  };
};

// Supplier hooks
export const useSuppliers = () => {
  const api = useApi();
  
  return {
    getAll: (params?: any) => api.get('/suppliers', { params }),
    getById: (id: string) => api.get(`/suppliers/${id}`),
    create: (data: any) => api.post('/suppliers', data),
    update: (id: string, data: any) => api.put(`/suppliers/${id}`, data),
    delete: (id: string) => api.delete(`/suppliers/${id}`)
  };
};

// User hooks
export const useUsers = () => {
  const api = useApi();
  
  return {
    getAll: (params?: any) => api.get('/users', { params }),
    getById: (id: string) => api.get(`/users/${id}`),
    create: (data: any) => api.post('/auth/register', data),
    update: (id: string, data: any) => api.put(`/users/${id}`, data),
    deactivate: (id: string) => api.patch(`/users/${id}/deactivate`),
    activate: (id: string) => api.patch(`/users/${id}/activate`)
  };
};

// Alert hooks
export const useAlerts = () => {
  const api = useApi();
  
  return {
    getAll: (params?: any) => api.get('/alerts', { params }),
    getStats: () => api.get('/alerts/stats'),
    create: (data: any) => api.post('/alerts', data),
    markRead: (id: string) => api.patch(`/alerts/${id}/read`),
    resolve: (id: string) => api.patch(`/alerts/${id}/resolve`),
    delete: (id: string) => api.delete(`/alerts/${id}`)
  };
};

export default api;