"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole, UserMode } from './auth-context';

/**
 * Protect routes by Role and/or Mode
 * 
 * @param allowedRoles e.g. ['ADMIN', 'PROVIDER']. If empty, any authenticated user can pass.
 * @param allowedModes e.g. ['PROVIDER']. If empty, any mode can pass.
 * @param redirectTo where to send the user if they don't meet the criteria.
 */
export function useRequireAuth(
  allowedRoles?: UserRole[],
  allowedModes?: UserMode[],
  redirectTo: string = '/'
) {
  const { isAuthenticated, isLoading, user, userMode } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
        // 1. NON AUTHENTIFIÉ -> redirect /login
      if (!isAuthenticated || !user) {
        router.replace('/login');
        return;
      }

      // 2. RÔLE NON AUTORISÉ (ex: CLIENT qui accède à /admin) -> redirect / (ou redirectTo)
      if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        router.replace(redirectTo);
        return;
      }

      // 3. MODE NON AUTORISÉ (ex: PROVIDER en mode CLIENT qui accède à /dashboard alors qu'il faut être en mode PROVIDER)
      if (allowedModes && allowedModes.length > 0 && userMode && !allowedModes.includes(userMode)) {
        router.replace(redirectTo);
        return;
      }
    }
  }, [isAuthenticated, isLoading, user?.role, userMode, router, allowedRoles, allowedModes, redirectTo]);

  return { isLoading, user, userMode, isAuthenticated };
}
