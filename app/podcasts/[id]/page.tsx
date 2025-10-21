'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';

interface Podcast {
  id: string;
  title: string;
  description: string | null;
  cover_art_url: string | null;
  author: string | null;
  is_premium: number;
  category: string | null;
}

interface Episode {
  id: string;
  title: string;
  description: string | null;
  audio_url: string;
  duration: number | null;
  episode_number: number | null;
  season_number: number;
  published_at: number;
}

export default function PodcastPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { playEpisode, addToQueue, currentEpisode, clearQueue } = useAudioPlayer();
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load subscription status
      try {
        const subResult = await apiClient.getSubscriptionStatus();
        setSubscription((subResult as any).subscription);
      } catch (err) {
        // User not logged in
      }

      // Load podcast
      const podcastResult = await apiClient.getPodcast(params.id as string);
      setPodcast((podcastResult as any).podcast);

      // Load episodes
      const episodesResult = await apiClient.getEpisodes(params.id as string);
      setEpisodes((episodesResult as any).episodes);
    } catch (err: any) {
      setError(err.message || 'Failed to load podcast');
    } finally {
      setLoading(false);
    }
  };

  const handleEpisodeClick = (episode: Episode) => {
    // Check if premium podcast and user has subscription
    if (podcast?.is_premium && subscription?.status !== 'active') {
      router.push('/profile?subscribe=true');
      return;
    }
    
    playEpisode({
      id: episode.id,
      title: episode.title,
      audioUrl: episode.audio_url,
      podcastTitle: podcast?.title,
      coverArt: podcast?.cover_art_url || undefined,
      duration: episode.duration || undefined,
    });
  };

  const handleAddAllToQueue = () => {
    if (podcast?.is_premium && subscription?.status !== 'active') {
      router.push('/profile?subscribe=true');
      return;
    }

    clearQueue();
    episodes.forEach((episode) => {
      addToQueue({
        id: episode.id,
        title: episode.title,
        audioUrl: episode.audio_url,
        podcastTitle: podcast?.title,
        coverArt: podcast?.cover_art_url || undefined,
        duration: episode.duration || undefined,
      });
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
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

  if (error || !podcast) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-xl text-red-400 mb-4">{error || 'Podcast not found'}</p>
        <Link
          href="/podcasts"
          className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-full transition"
        >
          Back to Podcasts
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Back Button */}
      <Link
        href="/podcasts"
        className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-gray-400 hover:text-white transition-colors group"
      >
        <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to all podcasts
      </Link>

      {/* Hero Section */}
      <div className="relative mb-12 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-br from-blue-950/30 via-gray-950/30 to-purple-950/30 border-y border-gray-800 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            {/* Cover Image */}
            <div className="flex-shrink-0">
              <div className="relative group">
                {podcast.cover_art_url ? (
                  <img
                    src={podcast.cover_art_url}
                    alt={podcast.title}
                    className="w-72 h-72 object-cover rounded-3xl shadow-2xl shadow-black/50 border-4 border-gray-800"
                  />
                ) : (
                  <div className="w-72 h-72 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-black/50 border-4 border-gray-800">
                    <svg className="w-32 h-32 text-white/90" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                    </svg>
                  </div>
                )}
                {/* Premium Badge on Image */}
                {podcast.is_premium === 1 && (
                  <div className="absolute -top-3 -right-3">
                    <div className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full shadow-xl flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-bold text-sm">PREMIUM</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Podcast Info */}
            <div className="flex-1">
              <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {podcast.title}
                </span>
              </h1>
              
              {podcast.author && (
                <div className="flex items-center gap-2 text-lg text-gray-400 mb-6">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>by {podcast.author}</span>
                </div>
              )}
              
              {podcast.description && (
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  {podcast.description}
                </p>
              )}

              <div className="flex flex-wrap gap-3 mb-6">
                {podcast.category && (
                  <span className="px-4 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-full text-sm font-medium">
                    {podcast.category}
                  </span>
                )}
                <span className="px-4 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-full text-sm font-medium">
                  {episodes.length} {episodes.length === 1 ? 'Episode' : 'Episodes'}
                </span>
              </div>

              {/* Premium CTA */}
              {podcast.is_premium === 1 && subscription?.status !== 'active' && (
                <div className="p-6 bg-gradient-to-br from-yellow-900/20 to-orange-900/20 backdrop-blur-sm border border-yellow-600/50 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">Premium Content</h3>
                      <p className="text-gray-300 mb-4">
                        Subscribe now to unlock all episodes of this exclusive podcast and thousands more.
                      </p>
                      <button
                        onClick={() => router.push('/profile?subscribe=true')}
                        className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg shadow-yellow-500/30"
                      >
                        Subscribe Now
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Episodes Section */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Episodes
            </span>
          </h2>
          <div className="flex items-center gap-4">
            {episodes.length > 0 && (
              <button
                onClick={handleAddAllToQueue}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-sm font-semibold hover:scale-105 transition-transform shadow-lg shadow-blue-500/30 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Play All
              </button>
            )}
            <span className="px-4 py-2 bg-gray-900 rounded-full text-sm font-medium text-gray-400">
              {episodes.length} total
            </span>
          </div>
        </div>

        {episodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <p className="text-gray-400 text-lg">No episodes available yet</p>
            <p className="text-gray-500 text-sm mt-2">Check back later for new content!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {episodes.map((episode, index) => (
              <div
                key={episode.id}
                onClick={() => handleEpisodeClick(episode)}
                className={`group relative overflow-hidden rounded-2xl transition-all duration-300 cursor-pointer ${
                  currentEpisode?.id === episode.id
                    ? 'bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-2 border-blue-500 shadow-xl shadow-blue-500/20'
                    : 'bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 hover:border-gray-700 hover:shadow-xl'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Episode Number Badge */}
                    <div className="flex-shrink-0">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg transition-all ${
                        currentEpisode?.id === episode.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-800 text-gray-400 group-hover:bg-gray-700'
                      }`}>
                        {episode.episode_number || index + 1}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Title and Date */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className={`text-xl font-bold transition-colors ${
                          currentEpisode?.id === episode.id
                            ? 'text-blue-400'
                            : 'text-white group-hover:text-blue-400'
                        }`}>
                          {episode.title}
                        </h3>
                        <span className="flex-shrink-0 text-sm text-gray-500">
                          {formatDate(episode.published_at)}
                        </span>
                      </div>
                      
                      {/* Description */}
                      {episode.description && (
                        <p className="text-gray-400 mb-3 line-clamp-2">
                          {episode.description}
                        </p>
                      )}
                      
                      {/* Duration */}
                      {episode.duration && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatDuration(episode.duration)}
                        </div>
                      )}
                    </div>

                    {/* Play Button */}
                    <button className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      currentEpisode?.id === episode.id
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                        : 'bg-gray-800 text-gray-400 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110'
                    }`}>
                      {currentEpisode?.id === episode.id ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Playing Indicator */}
                {currentEpisode?.id === episode.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

