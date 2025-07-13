import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'admin' | 'manager' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on app load
    const storedUser = localStorage.getItem('stockiq_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      
      });

      const data = await response.json();
      console.log('Login response:', data);
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      const { token, user } = data;
      
      setUser(user);
      localStorage.setItem('stockiq_user', JSON.stringify(user));
      localStorage.setItem('stockiq_token', token);
    } catch (error) {
      // Fallback to mock for development
      let mockUser: User;
      if (email === 'admin@stockiq.com') {
        mockUser = { id: '1', name: 'Super Admin', email, role: 'admin' };
      } else if (email === 'manager@stockiq.com') {
        mockUser = { id: '2', name: 'Inventory Manager', email, role: 'manager' };
      } else {
        mockUser = { id: '3', name: 'Staff Member', email, role: 'staff' };
      }
      
      setUser(mockUser);
      localStorage.setItem('stockiq_user', JSON.stringify(mockUser));
      console.warn('Using mock authentication. Backend not available.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('stockiq_user');
    localStorage.removeItem('stockiq_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}