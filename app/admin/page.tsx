'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

function AdminDashboardContent() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [analyticsResult, podcastsResult] = await Promise.all([
        apiClient.getAnalytics(),
        apiClient.getPodcasts(),
      ]);

      setAnalytics((analyticsResult as any).analytics);
      setPodcasts((podcastsResult as any).podcasts);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePodcast = async (id: string) => {
    if (!confirm('Are you sure you want to delete this podcast?')) {
      return;
    }

    try {
      await apiClient.deletePodcast(id);
      setPodcasts(podcasts.filter(p => p.id !== id));
    } catch (err: any) {
      alert('Failed to delete podcast: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <Link
          href="/admin/podcast/new"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
        >
          + Create Podcast
        </Link>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Total Podcasts</h3>
            <p className="text-4xl font-bold">{analytics.totalPodcasts}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Premium Podcasts</h3>
            <p className="text-4xl font-bold">{analytics.premiumPodcasts}</p>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Subscribers</h3>
            <p className="text-4xl font-bold">{analytics.totalSubscribers}</p>
          </div>

          <div className="bg-gradient-to-br from-orange-600 to-orange-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Total Plays</h3>
            <p className="text-4xl font-bold">{analytics.totalPlays}</p>
          </div>
        </div>
      )}

      {/* Podcasts Table */}
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-2xl font-semibold">Manage Podcasts</h2>
        </div>

        {podcasts.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-lg">No podcasts yet</p>
            <Link
              href="/admin/podcast/new"
              className="inline-block mt-4 text-blue-400 hover:text-blue-300"
            >
              Create your first podcast
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left">Title</th>
                  <th className="px-6 py-3 text-left">Author</th>
                  <th className="px-6 py-3 text-left">Category</th>
                  <th className="px-6 py-3 text-left">Type</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {podcasts.map((podcast) => (
                  <tr key={podcast.id} className="hover:bg-gray-800/50">
                    <td className="px-6 py-4 font-medium">{podcast.title}</td>
                    <td className="px-6 py-4 text-gray-400">{podcast.author || '-'}</td>
                    <td className="px-6 py-4 text-gray-400">{podcast.category || '-'}</td>
                    <td className="px-6 py-4">
                      {podcast.is_premium ? (
                        <span className="px-2 py-1 bg-yellow-600 text-xs font-semibold rounded">
                          Premium
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-600 text-xs font-semibold rounded">
                          Free
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/admin/podcast/${podcast.id}`}
                        className="inline-block px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/admin/podcast/${podcast.id}/episodes`}
                        className="inline-block px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm transition"
                      >
                        Episodes
                      </Link>
                      <button
                        onClick={() => handleDeletePodcast(podcast.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}

