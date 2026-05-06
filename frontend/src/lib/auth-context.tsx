"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export type UserRole = 'CLIENT' | 'PROVIDER' | 'ADMIN';
export type UserMode = 'CLIENT' | 'PROVIDER' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isPremium?: boolean;
  phone?: string;
  quartier?: string;
  avatarUrl?: string;
  bio?: string;
  metier?: string;
  experience?: string;
  specialties?: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  userMode: UserMode | null;
  isLoading: boolean;
  login: (tokens: { accessToken: string; refreshToken: string }, user: AuthUser) => void;
  logout: () => void;
  switchMode: (newMode: 'CLIENT' | 'PROVIDER') => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userMode, setUserMode] = useState<UserMode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('kaskade_access_token');
      if (!token) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const userData = await res.json();
        const storedUser = JSON.parse(localStorage.getItem('kaskade_user') || '{}');
        
        if (userData.role !== storedUser.role) {
          const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/auth/refresh`, {
            method: 'POST',
            headers: { 
              'Authorization': `Bearer ${localStorage.getItem('kaskade_refresh_token')}` 
            }
          });

          if (refreshRes.ok) {
            const tokens = await refreshRes.json();
            localStorage.setItem('kaskade_access_token', tokens.accessToken);
            localStorage.setItem('kaskade_refresh_token', tokens.refreshToken);
            setAccessToken(tokens.accessToken);
          }
        }

        localStorage.setItem('kaskade_user', JSON.stringify(userData));
        setUser(userData);
        if (!localStorage.getItem('kaskade_user_mode')) {
          localStorage.setItem('kaskade_user_mode', userData.role);
          setUserMode(userData.role);
        }
      }
    } catch (err) {
      console.error("Erreur profil:", err);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('kaskade_access_token');
        const storedUser = localStorage.getItem('kaskade_user');
        const storedMode = localStorage.getItem('kaskade_user_mode');

        if (storedToken && storedUser) {
          setAccessToken(storedToken);
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setUserMode((storedMode as UserMode) || parsedUser.role);
          refreshUser();
        }
      } catch (e) {
        localStorage.removeItem('kaskade_access_token');
        localStorage.removeItem('kaskade_user');
        localStorage.removeItem('kaskade_user_mode');
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, [refreshUser]);

  const login = useCallback((tokens: { accessToken: string; refreshToken: string }, userData: AuthUser) => {
    localStorage.setItem('kaskade_access_token', tokens.accessToken);
    localStorage.setItem('kaskade_refresh_token', tokens.refreshToken);
    localStorage.setItem('kaskade_user', JSON.stringify(userData));
    localStorage.setItem('kaskade_user_mode', userData.role);
    
    setAccessToken(tokens.accessToken);
    setUser(userData);
    setUserMode(userData.role);
    
    if (userData.role === 'ADMIN') {
      router.push('/admin/dashboard');
    } else if (userData.role === 'PROVIDER') {
      router.push('/dashboard');
    } else {
      router.push('/');
    }
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem('kaskade_access_token');
    localStorage.removeItem('kaskade_refresh_token');
    localStorage.removeItem('kaskade_user');
    localStorage.removeItem('kaskade_user_mode');
    setAccessToken(null);
    setUser(null);
    setUserMode(null);
    router.push('/login');
  }, [router]);

  const switchMode = useCallback((newMode: 'CLIENT' | 'PROVIDER') => {
    if (!user) return;
    
    if (user.role === 'PROVIDER' || user.role === 'ADMIN') {
      setUserMode(newMode);
      localStorage.setItem('kaskade_user_mode', newMode);
      
      if (newMode === 'CLIENT') {
        router.push('/mes-demandes');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, router]);

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      userMode,
      isLoading,
      login,
      logout,
      switchMode,
      refreshUser,
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