'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface Subscription {
  id: string;
  plan_type: string | null;
  status: string;
  current_period_end: number | null;
  cancel_at_period_end: number;
}

interface AuthContextType {
  user: User | null;
  subscription: Subscription | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  hasActiveSubscription: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, []);

  // Refresh subscription when user changes
  useEffect(() => {
    if (user) {
      loadSubscription();
    } else {
      setSubscription(null);
    }
  }, [user]);

  const loadUser = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await apiClient.getMe() as any;
      setUser(response.user);
    } catch (error) {
      console.error('Failed to load user:', error);
      // Clear invalid token
      apiClient.clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loadSubscription = async () => {
    try {
      const response = await apiClient.getSubscriptionStatus() as any;
      setSubscription(response.subscription);
    } catch (error) {
      console.error('Failed to load subscription:', error);
      setSubscription(null);
    }
  };

  const login = async (token: string) => {
    apiClient.setToken(token);
    await loadUser();
    await loadSubscription();
  };

  const logout = () => {
    apiClient.clearToken();
    setUser(null);
    setSubscription(null);
    router.push('/');
  };

  const refreshUser = async () => {
    await loadUser();
  };

  const refreshSubscription = async () => {
    if (user) {
      await loadSubscription();
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const hasActiveSubscription = subscription?.status === 'active';

  return (
    <AuthContext.Provider
      value={{
        user,
        subscription,
        loading,
        isAuthenticated,
        isAdmin,
        hasActiveSubscription,
        login,
        logout,
        refreshUser,
        refreshSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

