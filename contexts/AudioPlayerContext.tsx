'use client';

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api-client';

interface Episode {
  id: string;
  title: string;
  audioUrl: string;
  podcastTitle?: string;
  coverArt?: string;
  duration?: number;
}

interface AudioPlayerContextType {
  currentEpisode: Episode | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  isLooping: boolean;
  isShuffling: boolean;
  queue: Episode[];
  playEpisode: (episode: Episode) => void;
  togglePlayPause: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  skipForward: (seconds?: number) => void;
  skipBackward: (seconds?: number) => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
  playNext: () => void;
  playPrevious: () => void;
  addToQueue: (episode: Episode) => void;
  removeFromQueue: (episodeId: string) => void;
  clearQueue: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [queue, setQueue] = useState<Episode[]>([]);
  const [playedEpisodes, setPlayedEpisodes] = useState<string[]>([]);

  // Initialize audio element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
      audioRef.current.playbackRate = playbackRate;

      audioRef.current.addEventListener('loadedmetadata', () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
        }
      });

      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      });

      audioRef.current.addEventListener('ended', handleEnded);

      // Load saved progress
      const savedVolume = localStorage.getItem('audioVolume');
      if (savedVolume) {
        const vol = parseFloat(savedVolume);
        setVolumeState(vol);
        if (audioRef.current) {
          audioRef.current.volume = vol;
        }
      }

      const savedRate = localStorage.getItem('playbackRate');
      if (savedRate) {
        const rate = parseFloat(savedRate);
        setPlaybackRateState(rate);
        if (audioRef.current) {
          audioRef.current.playbackRate = rate;
        }
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Save progress periodically
  useEffect(() => {
    if (!currentEpisode || !isPlaying) return;

    const interval = setInterval(() => {
      if (audioRef.current && currentEpisode) {
        const time = audioRef.current.currentTime;
        if (Math.floor(time) % 5 === 0) {
          apiClient.saveProgress(currentEpisode.id, time, false).catch(console.error);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, currentEpisode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'arrowright':
          e.preventDefault();
          skipForward(e.shiftKey ? 30 : 15);
          break;
        case 'arrowleft':
          e.preventDefault();
          skipBackward(e.shiftKey ? 30 : 15);
          break;
        case 'arrowup':
          e.preventDefault();
          setVolume(Math.min(volume + 0.1, 1));
          break;
        case 'arrowdown':
          e.preventDefault();
          setVolume(Math.max(volume - 0.1, 0));
          break;
        case 'm':
          e.preventDefault();
          setVolume(volume > 0 ? 0 : 0.8);
          break;
        case 'l':
          e.preventDefault();
          toggleLoop();
          break;
        case 'n':
          if (e.shiftKey) {
            e.preventDefault();
            playNext();
          }
          break;
        case 'p':
          if (e.shiftKey) {
            e.preventDefault();
            playPrevious();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [volume, isPlaying, currentEpisode, queue]);

  const handleEnded = () => {
    if (currentEpisode) {
      apiClient.saveProgress(currentEpisode.id, duration, true).catch(console.error);
    }

    if (isLooping && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else if (queue.length > 0) {
      playNext();
    } else {
      setIsPlaying(false);
    }
  };

  const playEpisode = async (episode: Episode) => {
    if (!audioRef.current) return;

    // If same episode, just toggle play/pause
    if (currentEpisode?.id === episode.id) {
      togglePlayPause();
      return;
    }

    try {
      audioRef.current.src = episode.audioUrl;
      audioRef.current.load();
      
      setCurrentEpisode(episode);
      setCurrentTime(0);
      
      await audioRef.current.play();
      setIsPlaying(true);
      setPlayedEpisodes([...playedEpisodes, episode.id]);
    } catch (error) {
      console.error('Error playing episode:', error);
      setIsPlaying(false);
    }
  };

  const togglePlayPause = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const setVolume = (vol: number) => {
    if (audioRef.current) {
      audioRef.current.volume = vol;
      setVolumeState(vol);
      localStorage.setItem('audioVolume', vol.toString());
    }
  };

  const setPlaybackRate = (rate: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
      setPlaybackRateState(rate);
      localStorage.setItem('playbackRate', rate.toString());
    }
  };

  const skipForward = (seconds: number = 15) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.currentTime + seconds,
        duration
      );
    }
  };

  const skipBackward = (seconds: number = 15) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        audioRef.current.currentTime - seconds,
        0
      );
    }
  };

  const toggleLoop = () => {
    setIsLooping(!isLooping);
  };

  const toggleShuffle = () => {
    setIsShuffling(!isShuffling);
  };

  const playNext = () => {
    if (queue.length === 0) return;

    let nextEpisode: Episode;
    if (isShuffling) {
      const unplayedQueue = queue.filter(ep => !playedEpisodes.includes(ep.id));
      if (unplayedQueue.length === 0) {
        setPlayedEpisodes([]);
        nextEpisode = queue[Math.floor(Math.random() * queue.length)];
      } else {
        nextEpisode = unplayedQueue[Math.floor(Math.random() * unplayedQueue.length)];
      }
    } else {
      const currentIndex = queue.findIndex(ep => ep.id === currentEpisode?.id);
      nextEpisode = queue[(currentIndex + 1) % queue.length];
    }

    playEpisode(nextEpisode);
  };

  const playPrevious = () => {
    if (queue.length === 0) return;

    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    const currentIndex = queue.findIndex(ep => ep.id === currentEpisode?.id);
    const prevIndex = currentIndex - 1 < 0 ? queue.length - 1 : currentIndex - 1;
    playEpisode(queue[prevIndex]);
  };

  const addToQueue = (episode: Episode) => {
    if (!queue.find(ep => ep.id === episode.id)) {
      setQueue([...queue, episode]);
    }
  };

  const removeFromQueue = (episodeId: string) => {
    setQueue(queue.filter(ep => ep.id !== episodeId));
  };

  const clearQueue = () => {
    setQueue([]);
    setPlayedEpisodes([]);
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        currentEpisode,
        isPlaying,
        currentTime,
        duration,
        volume,
        playbackRate,
        isLooping,
        isShuffling,
        queue,
        playEpisode,
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
        addToQueue,
        removeFromQueue,
        clearQueue,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
}

