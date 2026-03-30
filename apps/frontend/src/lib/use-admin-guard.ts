"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-context';

/**
 * Protect admin routes.
 * Redirect unauthenticated or non-admin users to login.
 */
export function useAdminGuard() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
       if (!isAuthenticated) {
         router.replace('/login');
       } else if (user?.role !== 'ADMIN') {
         // Optionally redirect non-admins
         router.replace('/');
       }
    }
  }, [isAuthenticated, isLoading, user, router]);

  return { isLoading, user, isAuthenticated };
}
