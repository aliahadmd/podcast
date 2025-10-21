'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

interface Podcast {
  id: string;
  title: string;
  description: string | null;
  cover_art_url: string | null;
  author: string | null;
  is_premium: number;
  category: string | null;
}

export default function EditPodcastPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    author: '',
    category: '',
    is_premium: false,
    cover_art_url: '',
  });

  useEffect(() => {
    loadPodcast();
  }, [params.id]);

  const loadPodcast = async () => {
    try {
      setLoading(true);
      const result = await apiClient.getPodcast(params.id as string) as any;
      setPodcast(result.podcast);
      setFormData({
        title: result.podcast.title,
        description: result.podcast.description || '',
        author: result.podcast.author || '',
        category: result.podcast.category || '',
        is_premium: result.podcast.is_premium === 1,
        cover_art_url: result.podcast.cover_art_url || '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load podcast');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');

      await apiClient.updatePodcast(params.id as string, {
        title: formData.title,
        description: formData.description || undefined,
        author: formData.author || undefined,
        category: formData.category || undefined,
        is_premium: formData.is_premium,
        cover_art_url: formData.cover_art_url || undefined,
      });

      alert('Podcast updated successfully!');
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Failed to update podcast');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this podcast? This action cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      await apiClient.deletePodcast(params.id as string);
      alert('Podcast deleted successfully!');
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Failed to delete podcast');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-lg text-gray-400">Loading podcast...</p>
      </div>
    );
  }

  if (error && !podcast) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-xl text-red-400 mb-4">{error}</p>
        <Link
          href="/admin"
          className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-full transition"
        >
          Back to Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-gray-400 hover:text-white transition-colors group"
        >
          <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Admin Dashboard
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Edit Podcast
              </span>
            </h1>
            <p className="text-gray-400">Update podcast details and settings</p>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/admin/podcast/${params.id}/episodes`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              Manage Episodes
            </Link>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition"
            >
              Delete Podcast
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-600 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-8">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
              required
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Author
            </label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., Technology, Business, Entertainment"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
            />
          </div>

          {/* Cover Art URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cover Art URL
            </label>
            <input
              type="url"
              value={formData.cover_art_url}
              onChange={(e) => setFormData({ ...formData, cover_art_url: e.target.value })}
              placeholder="https://example.com/cover.jpg"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
            />
            {formData.cover_art_url && (
              <div className="mt-3">
                <img
                  src={formData.cover_art_url}
                  alt="Cover preview"
                  className="w-32 h-32 object-cover rounded-lg border-2 border-gray-700"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Premium Toggle */}
          <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <input
              type="checkbox"
              id="is_premium"
              checked={formData.is_premium}
              onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
              className="w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
            />
            <label htmlFor="is_premium" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2">
                <span className="font-medium text-white">Premium Content</span>
                <span className="px-2 py-0.5 bg-yellow-600 text-xs font-semibold rounded">
                  PRO
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Requires active subscription to access
              </p>
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-4 pt-6">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition shadow-lg shadow-blue-600/30"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              href="/admin"
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}

