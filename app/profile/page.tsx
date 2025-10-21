'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiClient } from '@/lib/api-client';

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, subscription, refreshSubscription } = useAuth();
  const [error, setError] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    if (subscribing) {
      console.log('Already processing subscription, ignoring click');
      return; // Prevent double-click
    }
    
    try {
      console.log(`[Profile] Starting subscription for plan: ${plan}`);
      setSubscribing(true);
      setError('');
      const response = await apiClient.createCheckoutSession(plan) as any;
      console.log(`[Profile] Got checkout URL, redirecting...`);
      window.location.href = response.url;
    } catch (err: any) {
      console.error(`[Profile] Subscription error:`, err);
      setError(err.message || 'Failed to create checkout session');
      setSubscribing(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setError('');
      const response = await apiClient.createPortalSession() as any;
      window.location.href = response.url;
    } catch (err: any) {
      setError(err.message || 'Failed to open subscription portal');
    }
  };

  // Auto-open subscribe modal if query param present
  const showSubscribeParam = searchParams.get('subscribe');

  if (!user || !subscription) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-400">Loading profile...</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-600 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* User Info */}
      <div className="bg-gray-900 rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-bold mb-4">Profile Information</h2>
        <div className="space-y-3">
          <div>
            <span className="text-gray-400">Name:</span>{' '}
            <span className="font-semibold">{user.name}</span>
          </div>
          <div>
            <span className="text-gray-400">Email:</span>{' '}
            <span className="font-semibold">{user.email}</span>
          </div>
          <div>
            <span className="text-gray-400">Role:</span>{' '}
            <span className="px-2 py-1 bg-blue-600 rounded text-sm font-semibold">
              {user.role}
            </span>
          </div>
        </div>
      </div>

      {/* Subscription Info */}
      <div className="bg-gray-900 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">Subscription</h2>

        {subscription.status === 'active' ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-900/20 border border-green-600 rounded-lg">
              <p className="text-green-400 font-semibold mb-2">✓ Active Subscription</p>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-400">Plan:</span>{' '}
                  <span className="font-semibold capitalize">{subscription.plan_type}</span>
                </div>
                {subscription.current_period_end && (
                  <div>
                    <span className="text-gray-400">Next billing date:</span>{' '}
                    <span className="font-semibold">
                      {new Date(subscription.current_period_end).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {subscription.cancel_at_period_end === 1 && (
                  <div className="text-yellow-400">
                    ⚠️ Subscription will cancel at end of period
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleManageSubscription}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
            >
              Manage Subscription
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-900/20 border border-yellow-600 rounded-lg">
              <p className="text-yellow-400 font-semibold">
                You don't have an active subscription. Subscribe now to access premium content!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Monthly Plan */}
              <div className="border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition">
                <h3 className="text-xl font-bold mb-2">Monthly Plan</h3>
                <div className="text-4xl font-bold mb-4">
                  $9.99<span className="text-lg text-gray-400">/mo</span>
                </div>
                <ul className="space-y-2 mb-6 text-gray-300">
                  <li>✓ Unlimited podcast access</li>
                  <li>✓ Ad-free listening</li>
                  <li>✓ Premium content</li>
                  <li>✓ Cancel anytime</li>
                </ul>
                <button
                  type="button"
                  onClick={() => handleSubscribe('monthly')}
                  disabled={subscribing}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition"
                >
                  {subscribing ? 'Processing...' : 'Subscribe Monthly'}
                </button>
              </div>

              {/* Yearly Plan */}
              <div className="border-2 border-blue-500 rounded-lg p-6 relative">
                <div className="absolute -top-3 right-4 px-3 py-1 bg-blue-600 rounded-full text-sm font-bold">
                  BEST VALUE
                </div>
                <h3 className="text-xl font-bold mb-2">Yearly Plan</h3>
                <div className="text-4xl font-bold mb-4">
                  $99.99<span className="text-lg text-gray-400">/yr</span>
                </div>
                <ul className="space-y-2 mb-6 text-gray-300">
                  <li>✓ Everything in Monthly</li>
                  <li>✓ Save $20 per year</li>
                  <li>✓ Priority support</li>
                  <li>✓ Cancel anytime</li>
                </ul>
                <button
                  type="button"
                  onClick={() => handleSubscribe('yearly')}
                  disabled={subscribing}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition"
                >
                  {subscribing ? 'Processing...' : 'Subscribe Yearly'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <Suspense fallback={
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400">Loading profile...</p>
        </div>
      }>
        <ProfileContent />
      </Suspense>
    </ProtectedRoute>
  );
}

