'use client';

import { useEffect, useState } from 'react';
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

export default function PodcastsPage() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'free' | 'premium'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPodcasts();
  }, [filter]);

  const loadPodcasts = async () => {
    try {
      setLoading(true);
      let result: any;
      if (filter === 'all') {
        result = await apiClient.getPodcasts();
      } else {
        result = await apiClient.getPodcasts(filter === 'premium');
      }
      setPodcasts(result.podcasts);
    } catch (error) {
      console.error('Failed to load podcasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPodcasts = podcasts.filter(podcast => {
    const matchesSearch = searchQuery === '' || 
      podcast.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      podcast.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      podcast.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen pb-20">
      {/* Header Section */}
      <div className="relative mb-12 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-br from-blue-950/50 via-gray-950/50 to-purple-950/50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Discover Podcasts
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Explore thousands of podcasts across all genres and topics
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search podcasts, authors, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pl-14 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                suppressHydrationWarning
                spellCheck={false}
                autoComplete="off"
              />
              <svg className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: 'All Podcasts', value: 'all', icon: '🎧' },
              { label: 'Free', value: 'free', icon: '🆓' },
              { label: 'Premium', value: 'premium', icon: '⭐' },
            ].map((btn) => (
              <button
                key={btn.value}
                onClick={() => setFilter(btn.value as any)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  filter === btn.value
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30 scale-105'
                    : 'bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-gray-700 hover:bg-gray-800/50'
                }`}
              >
                <span className="mr-2">{btn.icon}</span>
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      {!loading && (
        <div className="mb-6 text-gray-400">
          <span className="text-lg">
            {filteredPodcasts.length} {filteredPodcasts.length === 1 ? 'podcast' : 'podcasts'} found
          </span>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative w-20 h-20 mb-6">
            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-lg text-gray-400">Loading amazing podcasts...</p>
        </div>
      ) : filteredPodcasts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xl text-gray-400 mb-2">No podcasts found</p>
          <p className="text-gray-500">Try adjusting your filters or search query</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPodcasts.map((podcast) => (
            <Link
              key={podcast.id}
              href={`/podcasts/${podcast.id}`}
              className="group relative"
            >
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 transition-all duration-300 hover:border-blue-500/50 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20">
                {/* Cover Image */}
                <div className="relative aspect-square overflow-hidden">
                  {podcast.cover_art_url ? (
                    <img
                      src={podcast.cover_art_url}
                      alt={podcast.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center">
                      <svg className="w-20 h-20 text-white/80" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                      </svg>
                    </div>
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Premium Badge */}
                  {podcast.is_premium === 1 && (
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        PREMIUM
                      </span>
                    </div>
                  )}

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl">
                      <svg className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold mb-2 line-clamp-1 group-hover:text-blue-400 transition-colors">
                    {podcast.title}
                  </h3>
                  
                  {podcast.author && (
                    <p className="text-sm text-gray-400 mb-3 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {podcast.author}
                    </p>
                  )}
                  
                  {podcast.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                      {podcast.description}
                    </p>
                  )}
                  
                  {podcast.category && (
                    <span className="inline-flex items-center px-3 py-1 bg-gray-800/50 border border-gray-700 rounded-full text-xs font-medium text-gray-400">
                      {podcast.category}
                    </span>
                  )}
                </div>

                {/* Bottom Gradient Line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty State CTA */}
      {!loading && podcasts.length === 0 && (
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-semibold hover:scale-105 transition-transform"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      )}
    </div>
  );
}

