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
       const userRole = user?.role?.toUpperCase();
       if (!isAuthenticated) {
         router.replace('/login');
       } else if (userRole !== 'ADMIN') {
         router.replace('/');
       }
    }
  }, [isAuthenticated, isLoading, user, router]);

  return { isLoading, user, isAuthenticated };
}
