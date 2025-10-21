'use client';

import { useState } from 'react';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';

export default function GlobalAudioPlayer() {
  const {
    currentEpisode,
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackRate,
    isLooping,
    isShuffling,
    queue,
    togglePlayPause,
    seekTo,
    setVolume,
    setPlaybackRate,
    skipForward,
    skipBackward,
    toggleLoop,
    toggleShuffle,
    playNext,
    playPrevious,
    removeFromQueue,
    clearQueue,
  } = useAudioPlayer();

  const [isExpanded, setIsExpanded] = useState(true);
  const [showQueue, setShowQueue] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  if (!currentEpisode) return null;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
        >
          {isPlaying ? (
            <svg className="w-8 h-8 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed right-6 z-50 transition-all duration-300 ${isExpanded ? 'bottom-6' : 'bottom-6'}`}>
      <div className="w-96 bg-gradient-to-br from-gray-900 via-gray-950 to-black border border-gray-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-lg">
        {/* Header */}
        <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-700 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-300">Now Playing</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQueue(!showQueue)}
              className={`p-1.5 rounded-lg transition ${showQueue ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
              title="Queue"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-1.5 rounded-lg transition ${showSettings ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
              title="Settings"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button
              onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
              className={`p-1.5 rounded-lg transition ${showKeyboardHelp ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
              title="Keyboard Shortcuts"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-gray-400 hover:bg-gray-700 rounded-lg transition"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              <svg className={`w-4 h-4 transition-transform ${isExpanded ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1.5 text-gray-400 hover:bg-gray-700 rounded-lg transition"
              title="Minimize"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
          </div>
        </div>

        {isExpanded && (
          <>
            {/* Queue View */}
            {showQueue && (
              <div className="px-4 py-3 bg-gray-800/30 border-b border-gray-700 max-h-48 overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-400">Queue ({queue.length})</span>
                  {queue.length > 0 && (
                    <button
                      onClick={clearQueue}
                      className="text-xs text-red-400 hover:text-red-300 transition"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                {queue.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4">No episodes in queue</p>
                ) : (
                  <div className="space-y-2">
                    {queue.map((episode, index) => (
                      <div
                        key={episode.id}
                        className={`flex items-center gap-2 p-2 rounded-lg transition ${
                          episode.id === currentEpisode?.id
                            ? 'bg-blue-600/20 border border-blue-600/30'
                            : 'bg-gray-800/50 hover:bg-gray-700/50'
                        }`}
                      >
                        <span className="text-xs text-gray-500 w-6">{index + 1}</span>
                        <span className="flex-1 text-sm text-gray-300 truncate">{episode.title}</span>
                        <button
                          onClick={() => removeFromQueue(episode.id)}
                          className="text-gray-500 hover:text-red-400 transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settings View */}
            {showSettings && (
              <div className="px-4 py-3 bg-gray-800/30 border-b border-gray-700">
                <div className="space-y-4">
                  {/* Playback Speed */}
                  <div>
                    <label className="text-sm font-medium text-gray-400 mb-2 block">
                      Playback Speed: {playbackRate}x
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => setPlaybackRate(rate)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                            playbackRate === rate
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Volume Control */}
                  <div>
                    <label className="text-sm font-medium text-gray-400 mb-2 block">
                      Volume: {Math.round(volume * 100)}%
                    </label>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Keyboard Shortcuts Help */}
            {showKeyboardHelp && (
              <div className="px-4 py-3 bg-gray-800/30 border-b border-gray-700 max-h-60 overflow-y-auto">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Keyboard Shortcuts</h4>
                <div className="space-y-2 text-xs">
                  {[
                    { key: 'Space', action: 'Play / Pause' },
                    { key: '→', action: 'Skip forward 15s' },
                    { key: 'Shift + →', action: 'Skip forward 30s' },
                    { key: '←', action: 'Skip backward 15s' },
                    { key: 'Shift + ←', action: 'Skip backward 30s' },
                    { key: '↑', action: 'Volume up' },
                    { key: '↓', action: 'Volume down' },
                    { key: 'M', action: 'Mute / Unmute' },
                    { key: 'L', action: 'Toggle loop' },
                    { key: 'Shift + N', action: 'Next track' },
                    { key: 'Shift + P', action: 'Previous track' },
                  ].map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between py-1.5 border-b border-gray-700/50 last:border-0">
                      <span className="text-gray-400">{shortcut.action}</span>
                      <kbd className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-300 font-mono">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Episode Info */}
            <div className="px-4 py-4">
              <div className="flex gap-4">
                {currentEpisode.coverArt ? (
                  <img
                    src={currentEpisode.coverArt}
                    alt={currentEpisode.title}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-semibold text-white truncate mb-1">
                    {currentEpisode.title}
                  </h4>
                  {currentEpisode.podcastTitle && (
                    <p className="text-sm text-gray-400 truncate">{currentEpisode.podcastTitle}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="px-4 pb-3">
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={(e) => seekTo(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  style={{
                    background: `linear-gradient(to right, rgb(37, 99, 235) 0%, rgb(37, 99, 235) ${progress}%, rgb(55, 65, 81) ${progress}%, rgb(55, 65, 81) 100%)`
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleShuffle}
                    className={`p-2 rounded-lg transition ${
                      isShuffling ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'
                    }`}
                    title="Shuffle"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    onClick={toggleLoop}
                    className={`p-2 rounded-lg transition ${
                      isLooping ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'
                    }`}
                    title="Loop"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={playPrevious}
                    disabled={queue.length === 0}
                    className="p-2 text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                    title="Previous"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
                    </svg>
                  </button>

                  <button
                    onClick={() => skipBackward(15)}
                    className="p-2 text-gray-300 hover:text-white transition"
                    title="Rewind 15s"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
                    </svg>
                  </button>

                  <button
                    onClick={togglePlayPause}
                    className="p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full hover:scale-110 transition-transform shadow-lg shadow-blue-600/30"
                  >
                    {isPlaying ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={() => skipForward(15)}
                    className="p-2 text-gray-300 hover:text-white transition"
                    title="Forward 15s"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
                    </svg>
                  </button>

                  <button
                    onClick={playNext}
                    disabled={queue.length === 0}
                    className="p-2 text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                    title="Next"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
                    </svg>
                  </button>
                </div>

                <div className="w-20"></div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

