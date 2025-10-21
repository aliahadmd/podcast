import { getDB } from './cloudflare';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: 'user' | 'admin';
  created_at: number;
  updated_at: number;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan_type: 'monthly' | 'yearly' | null;
  status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: number;
  created_at: number;
  updated_at: number;
}

export interface Podcast {
  id: string;
  title: string;
  description: string | null;
  cover_art_url: string | null;
  author: string | null;
  is_premium: number;
  category: string | null;
  created_by: string;
  created_at: number;
  updated_at: number;
}

export interface Episode {
  id: string;
  podcast_id: string;
  title: string;
  description: string | null;
  audio_url: string;
  duration: number | null;
  episode_number: number | null;
  season_number: number;
  published_at: number;
  created_at: number;
  updated_at: number;
}

export interface PlaybackProgress {
  id: string;
  user_id: string;
  episode_id: string;
  progress_seconds: number;
  completed: number;
  last_played_at: number;
}

// Database helper functions
export class DatabaseHelper {
  private db: D1Database;

  constructor() {
    this.db = getDB();
  }

  // Users
  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first<User>();
    return result || null;
  }

  async getUserById(id: string): Promise<User | null> {
    const result = await this.db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first<User>();
    return result || null;
  }

  async createUser(user: Omit<User, 'created_at' | 'updated_at'>): Promise<User> {
    const now = Date.now();
    await this.db
      .prepare('INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(user.id, user.email, user.password_hash, user.name, user.role, now, now)
      .run();
    
    return { ...user, created_at: now, updated_at: now };
  }

  async updateUser(id: string, updates: Partial<Omit<User, 'id' | 'created_at'>>): Promise<void> {
    const now = Date.now();
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length > 0) {
      fields.push('updated_at = ?');
      values.push(now, id);
      await this.db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
    }
  }

  // Subscriptions
  async getSubscriptionByUserId(userId: string): Promise<Subscription | null> {
    const result = await this.db
      .prepare('SELECT * FROM subscriptions WHERE user_id = ?')
      .bind(userId)
      .first<Subscription>();
    return result || null;
  }

  async createSubscription(subscription: Omit<Subscription, 'created_at' | 'updated_at'>): Promise<Subscription> {
    const now = Date.now();
    
    // Ensure all values are primitives
    const cancel_at_period_end = typeof subscription.cancel_at_period_end === 'boolean' 
      ? (subscription.cancel_at_period_end ? 1 : 0) 
      : subscription.cancel_at_period_end;
    
    await this.db
      .prepare(
        'INSERT INTO subscriptions (id, user_id, stripe_customer_id, stripe_subscription_id, plan_type, status, current_period_start, current_period_end, cancel_at_period_end, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(
        subscription.id,
        subscription.user_id,
        subscription.stripe_customer_id || null,
        subscription.stripe_subscription_id || null,
        subscription.plan_type || null,
        subscription.status,
        subscription.current_period_start || null,
        subscription.current_period_end || null,
        cancel_at_period_end,
        now,
        now
      )
      .run();

    return { ...subscription, created_at: now, updated_at: now };
  }

  async updateSubscription(userId: string, updates: Partial<Omit<Subscription, 'id' | 'user_id' | 'created_at'>>): Promise<void> {
    const now = Date.now();
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'user_id' && key !== 'created_at') {
        fields.push(`${key} = ?`);
        // Ensure all values are primitives (string, number, null)
        // Convert undefined to null, and ensure numbers/booleans are properly typed
        let processedValue = value;
        if (value === undefined) {
          processedValue = null;
        } else if (typeof value === 'boolean') {
          processedValue = value ? 1 : 0;
        } else if (value !== null && typeof value === 'object') {
          // If it's an object, try to convert to string or null
          processedValue = null;
          console.warn(`Warning: Object value for key ${key} converted to null`);
        }
        values.push(processedValue);
      }
    });

    if (fields.length > 0) {
      fields.push('updated_at = ?');
      values.push(now, userId);
      await this.db.prepare(`UPDATE subscriptions SET ${fields.join(', ')} WHERE user_id = ?`).bind(...values).run();
    }
  }

  // Podcasts
  async getAllPodcasts(isPremium?: boolean): Promise<Podcast[]> {
    let query = 'SELECT * FROM podcasts ORDER BY created_at DESC';
    if (isPremium !== undefined) {
      query = 'SELECT * FROM podcasts WHERE is_premium = ? ORDER BY created_at DESC';
      const result = await this.db.prepare(query).bind(isPremium ? 1 : 0).all<Podcast>();
      return result.results || [];
    }
    const result = await this.db.prepare(query).all<Podcast>();
    return result.results || [];
  }

  async getPodcastById(id: string): Promise<Podcast | null> {
    const result = await this.db.prepare('SELECT * FROM podcasts WHERE id = ?').bind(id).first<Podcast>();
    return result || null;
  }

  async createPodcast(podcast: Omit<Podcast, 'created_at' | 'updated_at'>): Promise<Podcast> {
    const now = Date.now();
    await this.db
      .prepare(
        'INSERT INTO podcasts (id, title, description, cover_art_url, author, is_premium, category, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(
        podcast.id,
        podcast.title,
        podcast.description,
        podcast.cover_art_url,
        podcast.author,
        podcast.is_premium,
        podcast.category,
        podcast.created_by,
        now,
        now
      )
      .run();

    return { ...podcast, created_at: now, updated_at: now };
  }

  async updatePodcast(id: string, updates: Partial<Omit<Podcast, 'id' | 'created_by' | 'created_at'>>): Promise<void> {
    const now = Date.now();
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_by' && key !== 'created_at') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length > 0) {
      fields.push('updated_at = ?');
      values.push(now, id);
      await this.db.prepare(`UPDATE podcasts SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
    }
  }

  async deletePodcast(id: string): Promise<void> {
    await this.db.prepare('DELETE FROM podcasts WHERE id = ?').bind(id).run();
  }

  // Episodes
  async getEpisodesByPodcastId(podcastId: string): Promise<Episode[]> {
    const result = await this.db
      .prepare('SELECT * FROM episodes WHERE podcast_id = ? ORDER BY published_at DESC')
      .bind(podcastId)
      .all<Episode>();
    return result.results || [];
  }

  async getEpisodeById(id: string): Promise<Episode | null> {
    const result = await this.db.prepare('SELECT * FROM episodes WHERE id = ?').bind(id).first<Episode>();
    return result || null;
  }

  async createEpisode(episode: Omit<Episode, 'created_at' | 'updated_at'>): Promise<Episode> {
    const now = Date.now();
    await this.db
      .prepare(
        'INSERT INTO episodes (id, podcast_id, title, description, audio_url, duration, episode_number, season_number, published_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(
        episode.id,
        episode.podcast_id,
        episode.title,
        episode.description,
        episode.audio_url,
        episode.duration,
        episode.episode_number,
        episode.season_number,
        episode.published_at,
        now,
        now
      )
      .run();

    return { ...episode, created_at: now, updated_at: now };
  }

  async updateEpisode(id: string, updates: Partial<Omit<Episode, 'id' | 'podcast_id' | 'created_at'>>): Promise<void> {
    const now = Date.now();
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'podcast_id' && key !== 'created_at') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length > 0) {
      fields.push('updated_at = ?');
      values.push(now, id);
      await this.db.prepare(`UPDATE episodes SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
    }
  }

  async deleteEpisode(id: string): Promise<void> {
    await this.db.prepare('DELETE FROM episodes WHERE id = ?').bind(id).run();
  }

  // Playback Progress
  async getPlaybackProgress(userId: string, episodeId: string): Promise<PlaybackProgress | null> {
    const result = await this.db
      .prepare('SELECT * FROM playback_progress WHERE user_id = ? AND episode_id = ?')
      .bind(userId, episodeId)
      .first<PlaybackProgress>();
    return result || null;
  }

  async upsertPlaybackProgress(progress: Omit<PlaybackProgress, 'id'>): Promise<void> {
    const existing = await this.getPlaybackProgress(progress.user_id, progress.episode_id);
    const now = Date.now();

    if (existing) {
      await this.db
        .prepare('UPDATE playback_progress SET progress_seconds = ?, completed = ?, last_played_at = ? WHERE user_id = ? AND episode_id = ?')
        .bind(progress.progress_seconds, progress.completed, now, progress.user_id, progress.episode_id)
        .run();
    } else {
      const { v4: uuidv4 } = await import('uuid');
      await this.db
        .prepare('INSERT INTO playback_progress (id, user_id, episode_id, progress_seconds, completed, last_played_at) VALUES (?, ?, ?, ?, ?, ?)')
        .bind(uuidv4(), progress.user_id, progress.episode_id, progress.progress_seconds, progress.completed, now)
        .run();
    }
  }

  async getUserRecentProgress(userId: string, limit: number = 10): Promise<PlaybackProgress[]> {
    const result = await this.db
      .prepare('SELECT * FROM playback_progress WHERE user_id = ? ORDER BY last_played_at DESC LIMIT ?')
      .bind(userId, limit)
      .all<PlaybackProgress>();
    return result.results || [];
  }

  // Analytics
  async recordEpisodePlay(episodeId: string, userId: string | null): Promise<void> {
    const { v4: uuidv4 } = await import('uuid');
    await this.db
      .prepare('INSERT INTO episode_plays (id, episode_id, user_id, played_at) VALUES (?, ?, ?, ?)')
      .bind(uuidv4(), episodeId, userId, Date.now())
      .run();
  }

  async getEpisodePlayCount(episodeId: string): Promise<number> {
    const result = await this.db
      .prepare('SELECT COUNT(*) as count FROM episode_plays WHERE episode_id = ?')
      .bind(episodeId)
      .first<{ count: number }>();
    return result?.count || 0;
  }

  async getTotalSubscribers(): Promise<number> {
    const result = await this.db
      .prepare("SELECT COUNT(*) as count FROM subscriptions WHERE status = 'active'")
      .first<{ count: number }>();
    return result?.count || 0;
  }

  async getTotalPlays(): Promise<number> {
    const result = await this.db
      .prepare('SELECT COUNT(*) as count FROM episode_plays')
      .first<{ count: number }>();
    return result?.count || 0;
  }
}

