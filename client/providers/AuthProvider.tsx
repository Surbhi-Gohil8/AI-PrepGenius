'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { setToken, clearToken, getToken } from '@/lib/auth';
import { User } from '@/types';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/errors';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadUser = async () => {
    await Promise.resolve();
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
    }
  };

  useEffect(() => {
    void loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      setToken(token);
      setUser(userData);
      toast.success('Logged in successfully!');
      router.push('/dashboard');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Login failed. Please check your credentials.'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { token, user: userData } = response.data;
      setToken(token);
      setUser(userData);
      toast.success('Registration successful! Welcome.');
      router.push('/dashboard');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Registration failed.'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearToken();
    setUser(null);
    toast.success('Logged out successfully.');
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
