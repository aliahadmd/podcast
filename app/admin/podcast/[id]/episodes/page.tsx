'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

export default function ManageEpisodesPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [podcast, setPodcast] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    episode_number: '',
    season_number: '1',
    duration: '',
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    try {
      const [podcastResult, episodesResult] = await Promise.all([
        apiClient.getPodcast(params.id as string),
        apiClient.getEpisodes(params.id as string),
      ]);
      setPodcast((podcastResult as any).podcast);
      setEpisodes((episodesResult as any).episodes);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile) {
      setError('Please select an audio file');
      return;
    }

    setError('');
    setUploading(true);

    try {
      // Upload audio file
      const uploadResult = await apiClient.uploadAudio(audioFile);

      // Create proper audio URL for serving from our API
      const audioUrl = `/api/audio/${(uploadResult as any).fileName}`;

      // Create episode
      await apiClient.createEpisode(params.id as string, {
        title: formData.title,
        description: formData.description || undefined,
        audio_url: audioUrl,
        episode_number: formData.episode_number ? parseInt(formData.episode_number) : undefined,
        season_number: parseInt(formData.season_number),
        duration: formData.duration ? parseInt(formData.duration) : undefined,
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        episode_number: '',
        season_number: '1',
        duration: '',
      });
      setAudioFile(null);
      setShowForm(false);

      // Reload episodes
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create episode');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteEpisode = async (id: string) => {
    if (!confirm('Are you sure you want to delete this episode?')) {
      return;
    }

    try {
      await apiClient.deleteEpisode(id);
      setEpisodes(episodes.filter(e => e.id !== id));
    } catch (err: any) {
      alert('Failed to delete episode: ' + err.message);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div>
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-blue-400 hover:text-blue-300 mb-4"
        >
          ← Back to Admin
        </button>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">{podcast?.title}</h1>
            <p className="text-gray-400 mt-2">Manage Episodes</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
          >
            {showForm ? 'Cancel' : '+ Add Episode'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200">
          {error}
        </div>
      )}

      {/* Add Episode Form */}
      {showForm && (
        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Add New Episode</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                rows={3}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Episode Number</label>
                <input
                  type="number"
                  value={formData.episode_number}
                  onChange={(e) => setFormData({ ...formData, episode_number: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Season Number</label>
                <input
                  type="number"
                  value={formData.season_number}
                  onChange={(e) => setFormData({ ...formData, season_number: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Duration (seconds)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Audio File *</label>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
              {audioFile && (
                <p className="mt-2 text-sm text-gray-400">
                  Selected: {audioFile.name}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-semibold transition"
            >
              {uploading ? 'Uploading...' : 'Create Episode'}
            </button>
          </form>
        </div>
      )}

      {/* Episodes List */}
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-2xl font-semibold">Episodes ({episodes.length})</h2>
        </div>

        {episodes.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p>No episodes yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {episodes.map((episode) => (
              <div key={episode.id} className="p-6 hover:bg-gray-800/50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">
                      {episode.episode_number && `${episode.episode_number}. `}
                      {episode.title}
                    </h3>
                    {episode.description && (
                      <p className="text-gray-400 mb-2">{episode.description}</p>
                    )}
                    <p className="text-sm text-gray-500">
                      Published: {formatDate(episode.published_at)}
                      {episode.duration && ` • ${Math.floor(episode.duration / 60)}min`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteEpisode(episode.id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

