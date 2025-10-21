'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

export default function NewPodcastPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    author: '',
    category: '',
    cover_art_url: '',
    is_premium: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient.createPodcast(formData);
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Failed to create podcast');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Create New Podcast</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-gray-900 rounded-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Author</label>
          <input
            type="text"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="e.g., Technology, Comedy, Education"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Cover Art URL</label>
          <input
            type="url"
            value={formData.cover_art_url}
            onChange={(e) => setFormData({ ...formData, cover_art_url: e.target.value })}
            placeholder="https://example.com/cover.jpg"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="is_premium"
            checked={formData.is_premium}
            onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
            className="w-5 h-5 bg-gray-800 border-gray-700 rounded"
          />
          <label htmlFor="is_premium" className="text-sm font-medium cursor-pointer">
            This is a premium podcast (requires subscription)
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-semibold transition"
          >
            {loading ? 'Creating...' : 'Create Podcast'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

