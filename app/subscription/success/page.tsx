'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SubscriptionSuccessContent() {
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (sessionId) {
      verifySession(sessionId);
    } else {
      setVerifying(false);
    }
  }, [searchParams]);

  const verifySession = async (sessionId: string) => {
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Not authenticated. Please log in again.');
      }

      const response = await fetch('/api/subscription/verify-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to verify session' })) as any;
        throw new Error(errorData.error || 'Failed to verify session');
      }

      setVerifying(false);
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message);
      setVerifying(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-md p-8 bg-gray-900 rounded-lg shadow-lg text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Activating your subscription...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const isAuthError = error.includes('authenticated') || error.includes('Unauthorized');
    
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-md p-8 bg-gray-900 rounded-lg shadow-lg text-center">
          <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold mb-4">Verification Error</h1>
          <p className="text-gray-400 mb-8">{error}</p>
          
          <div className="space-y-3">
            {isAuthError ? (
              <Link
                href="/login"
                className="block w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
              >
                Log In
              </Link>
            ) : (
              <Link
                href="/profile"
                className="block w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
              >
                Go to Profile
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-gray-900 rounded-lg shadow-lg text-center">
        <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Welcome to Premium! 🎉</h1>
        <p className="text-gray-400 mb-8">
          Your subscription is now active. Enjoy unlimited access to all premium podcasts!
        </p>
        
        <div className="space-y-3">
          <Link
            href="/podcasts"
            className="block w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
          >
            Browse Podcasts
          </Link>
          <Link
            href="/profile"
            className="block w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition"
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-20 h-20 mb-6">
            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-lg text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <SubscriptionSuccessContent />
    </Suspense>
  );
}

