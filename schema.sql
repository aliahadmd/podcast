-- Podcast App Database Schema for Cloudflare D1

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Password Reset Tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at INTEGER NOT NULL,
  used INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_reset_tokens_user ON password_reset_tokens(user_id);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_type TEXT CHECK(plan_type IN ('monthly', 'yearly')),
  status TEXT DEFAULT 'inactive' CHECK(status IN ('active', 'inactive', 'cancelled', 'past_due')),
  current_period_start INTEGER,
  current_period_end INTEGER,
  cancel_at_period_end INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Podcasts Table
CREATE TABLE IF NOT EXISTS podcasts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_art_url TEXT,
  author TEXT,
  is_premium INTEGER DEFAULT 0,
  category TEXT,
  created_by TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_podcasts_premium ON podcasts(is_premium);
CREATE INDEX idx_podcasts_category ON podcasts(category);
CREATE INDEX idx_podcasts_created_by ON podcasts(created_by);

-- Episodes Table
CREATE TABLE IF NOT EXISTS episodes (
  id TEXT PRIMARY KEY,
  podcast_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT NOT NULL,
  duration INTEGER,
  episode_number INTEGER,
  season_number INTEGER DEFAULT 1,
  published_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (podcast_id) REFERENCES podcasts(id) ON DELETE CASCADE
);

CREATE INDEX idx_episodes_podcast ON episodes(podcast_id);
CREATE INDEX idx_episodes_published ON episodes(published_at);

-- Playback Progress Table
CREATE TABLE IF NOT EXISTS playback_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  episode_id TEXT NOT NULL,
  progress_seconds INTEGER DEFAULT 0,
  completed INTEGER DEFAULT 0,
  last_played_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE,
  UNIQUE(user_id, episode_id)
);

CREATE INDEX idx_progress_user ON playback_progress(user_id);
CREATE INDEX idx_progress_episode ON playback_progress(episode_id);
CREATE INDEX idx_progress_last_played ON playback_progress(last_played_at);

-- Analytics Table
CREATE TABLE IF NOT EXISTS episode_plays (
  id TEXT PRIMARY KEY,
  episode_id TEXT NOT NULL,
  user_id TEXT,
  played_at INTEGER NOT NULL,
  FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_plays_episode ON episode_plays(episode_id);
CREATE INDEX idx_plays_user ON episode_plays(user_id);
CREATE INDEX idx_plays_date ON episode_plays(played_at);

-- Session Table (for auth)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

