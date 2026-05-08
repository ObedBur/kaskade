"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-context';

/**
 * Redirect already-authenticated users away from auth pages (login, register, verify-otp).
 * Call this at the top of any auth page.
 */
export function useAuthGuard() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === 'ADMIN') {
        router.replace('/admin/dashboard');
      } else if (user.role === 'PROVIDER') {
        router.replace('/dashboard');
      } else {
        router.replace('/');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  return { isLoading };
}
