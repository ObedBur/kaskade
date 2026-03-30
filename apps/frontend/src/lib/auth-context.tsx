"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (tokens: { accessToken: string; refreshToken: string }, user: AuthUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('kaskade_access_token');
      const storedUser = localStorage.getItem('kaskade_user');

      if (storedToken && storedUser) {
        setAccessToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      // Corrupt data — clear it
      localStorage.removeItem('kaskade_access_token');
      localStorage.removeItem('kaskade_user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((tokens: { accessToken: string; refreshToken: string }, userData: AuthUser) => {
    localStorage.setItem('kaskade_access_token', tokens.accessToken);
    localStorage.setItem('kaskade_refresh_token', tokens.refreshToken);
    localStorage.setItem('kaskade_user', JSON.stringify(userData));
    setAccessToken(tokens.accessToken);
    setUser(userData);
    router.push('/');
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem('kaskade_access_token');
    localStorage.removeItem('kaskade_refresh_token');
    localStorage.removeItem('kaskade_user');
    setAccessToken(null);
    setUser(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      isLoading,
      login,
      logout,
      isAuthenticated: !!accessToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}