"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import api from "./api";
import {
  AUTH_STORAGE_KEYS,
  clearAuthStorage,
  getStoredAuthItem,
  saveAuthSession,
  setStoredAuthItem,
} from "./auth-storage";

export type UserRole = "CLIENT" | "PROVIDER" | "ADMIN";
export type UserMode = "CLIENT" | "PROVIDER" | "ADMIN";

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
  login: (
    tokens: { accessToken: string; refreshToken: string },
    user: AuthUser,
    rememberMe?: boolean,
  ) => void;
  logout: () => void;
  switchMode: (newMode: "CLIENT" | "PROVIDER") => void;
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
      const token = getStoredAuthItem(AUTH_STORAGE_KEYS.accessToken);
      if (!token) return;

      const { data: userData } = await api.get("/auth/me");
      const storedUser = JSON.parse(
        getStoredAuthItem(AUTH_STORAGE_KEYS.user) || "{}",
      );

      setStoredAuthItem(AUTH_STORAGE_KEYS.user, JSON.stringify(userData));
      setAccessToken(getStoredAuthItem(AUTH_STORAGE_KEYS.accessToken));
      setUser(userData);
      if (
        userData.role !== storedUser.role ||
        !getStoredAuthItem(AUTH_STORAGE_KEYS.userMode)
      ) {
        setStoredAuthItem(AUTH_STORAGE_KEYS.userMode, userData.role);
        setUserMode(userData.role);
      }
    } catch (err) {
      console.error("Erreur profil:", err);
      clearAuthStorage();
      setAccessToken(null);
      setUser(null);
      setUserMode(null);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = getStoredAuthItem(AUTH_STORAGE_KEYS.accessToken);
        const storedUser = getStoredAuthItem(AUTH_STORAGE_KEYS.user);
        const storedMode = getStoredAuthItem(AUTH_STORAGE_KEYS.userMode);

        if (storedToken && storedUser) {
          setAccessToken(storedToken);
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setUserMode((storedMode as UserMode) || parsedUser.role);
          refreshUser();
        }
      } catch (e) {
        clearAuthStorage();
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, [refreshUser]);

  const login = useCallback(
    (
      tokens: { accessToken: string; refreshToken: string },
      userData: AuthUser,
      rememberMe = false,
    ) => {
      saveAuthSession(tokens, userData, userData.role, rememberMe);

      setAccessToken(tokens.accessToken);
      setUser(userData);
      setUserMode(userData.role);

      if (userData.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else if (userData.role === "PROVIDER") {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
    },
    [router],
  );

  const logout = useCallback(() => {
    const refreshToken = getStoredAuthItem(AUTH_STORAGE_KEYS.refreshToken);

    if (refreshToken) {
      void api
        .post(
          "/auth/logout",
          {},
          {
            headers: { Authorization: `Bearer ${refreshToken}` },
          },
        )
        .catch(() => undefined);
    }

    clearAuthStorage();
    setAccessToken(null);
    setUser(null);
    setUserMode(null);
    router.push("/login");
  }, [router]);

  const switchMode = useCallback(
    (newMode: "CLIENT" | "PROVIDER") => {
      if (!user) return;

      if (user.role === "PROVIDER" || user.role === "ADMIN") {
        setUserMode(newMode);
        setStoredAuthItem(AUTH_STORAGE_KEYS.userMode, newMode);

        if (newMode === "CLIENT") {
          router.push("/mes-demandes");
        } else {
          router.push("/dashboard");
        }
      }
    },
    [user, router],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        userMode,
        isLoading,
        login,
        logout,
        switchMode,
        refreshUser,
        isAuthenticated: !!accessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
