"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export type UserRole = 'CLIENT' | 'PROVIDER' | 'ADMIN';
export type UserMode = 'CLIENT' | 'PROVIDER' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  quartier?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  userMode: UserMode | null;
  isLoading: boolean;
  login: (tokens: { accessToken: string; refreshToken: string }, user: AuthUser) => void;
  logout: () => void;
  switchMode: (newMode: 'CLIENT' | 'PROVIDER') => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userMode, setUserMode] = useState<UserMode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('kaskade_access_token');
      const storedUser = localStorage.getItem('kaskade_user');
      const storedMode = localStorage.getItem('kaskade_user_mode');

      if (storedToken && storedUser) {
        setAccessToken(storedToken);
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setUserMode((storedMode as UserMode) || parsedUser.role);
      }
    } catch (e) {
      // Corrupt data — clear it
      localStorage.removeItem('kaskade_access_token');
      localStorage.removeItem('kaskade_user');
      localStorage.removeItem('kaskade_user_mode');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((tokens: { accessToken: string; refreshToken: string }, userData: AuthUser) => {
    localStorage.setItem('kaskade_access_token', tokens.accessToken);
    localStorage.setItem('kaskade_refresh_token', tokens.refreshToken);
    localStorage.setItem('kaskade_user', JSON.stringify(userData));
    localStorage.setItem('kaskade_user_mode', userData.role); // Default mode = role
    
    setAccessToken(tokens.accessToken);
    setUser(userData);
    setUserMode(userData.role);
    
    // Redirection intelligente en fonction du rôle
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
    
    // Seul un PROVIDER a le droit de switcher de mode. Et un ADMIN dans le futur si besoin.
    if (user.role === 'PROVIDER') {
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