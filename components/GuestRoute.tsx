'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface GuestRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * GuestRoute - For pages that should only be accessible to non-authenticated users
 * (e.g., login, register pages)
 * Redirects to home or specified page if user is already logged in
 */
export default function GuestRoute({ children, redirectTo = '/' }: GuestRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, loading, router, redirectTo]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-lg text-gray-400">Loading...</p>
      </div>
    );
  }

  // If already authenticated, don't show the page (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

