'use client';

import Link from 'next/link';

export default function SubscriptionCancelPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-gray-900 rounded-lg shadow-lg text-center">
        <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Subscription Cancelled</h1>
        <p className="text-gray-400 mb-8">
          No worries! You can always subscribe again when you're ready.
        </p>
        
        <div className="space-y-3">
          <Link
            href="/podcasts"
            className="block w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
          >
            Browse Free Podcasts
          </Link>
          <Link
            href="/profile"
            className="block w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition"
          >
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
}

