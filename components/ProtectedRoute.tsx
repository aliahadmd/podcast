'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireSubscription?: boolean;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  requireAdmin = false,
  requireSubscription = false,
  redirectTo,
}: ProtectedRouteProps) {
  const { user, subscription, loading, isAuthenticated, isAdmin, hasActiveSubscription } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Check authentication
    if (requireAuth && !isAuthenticated) {
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      router.push(redirectTo || `/login?redirect=${returnUrl}`);
      return;
    }

    // Check admin role
    if (requireAdmin && !isAdmin) {
      router.push(redirectTo || '/');
      return;
    }

    // Check subscription
    if (requireSubscription && !hasActiveSubscription) {
      router.push(redirectTo || '/profile?subscribe=true');
      return;
    }
  }, [
    loading,
    isAuthenticated,
    isAdmin,
    hasActiveSubscription,
    requireAuth,
    requireAdmin,
    requireSubscription,
    router,
    redirectTo,
  ]);

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

  // Check if user meets requirements
  if (requireAuth && !isAuthenticated) {
    return null; // Will redirect
  }

  if (requireAdmin && !isAdmin) {
    return null; // Will redirect
  }

  if (requireSubscription && !hasActiveSubscription) {
    return null; // Will redirect
  }

  return <>{children}</>;
}

