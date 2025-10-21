// API Client for frontend

const API_BASE = '/api';

export class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json() as any;

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  // Auth
  async register(email: string, password: string, name: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  // Podcasts
  async getPodcasts(premium?: boolean) {
    const query = premium !== undefined ? `?premium=${premium}` : '';
    return this.request(`/podcasts${query}`);
  }

  async getPodcast(id: string) {
    return this.request(`/podcasts/${id}`);
  }

  async createPodcast(data: any) {
    return this.request('/podcasts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePodcast(id: string, data: any) {
    return this.request(`/podcasts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePodcast(id: string) {
    return this.request(`/podcasts/${id}`, {
      method: 'DELETE',
    });
  }

  // Episodes
  async getEpisodes(podcastId: string) {
    return this.request(`/podcasts/${podcastId}/episodes`);
  }

  async getEpisode(id: string) {
    return this.request(`/episodes/${id}`);
  }

  async createEpisode(podcastId: string, data: any) {
    return this.request(`/podcasts/${podcastId}/episodes`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEpisode(id: string, data: any) {
    return this.request(`/episodes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteEpisode(id: string) {
    return this.request(`/episodes/${id}`, {
      method: 'DELETE',
    });
  }

  // Playback
  async saveProgress(episodeId: string, progressSeconds: number, completed: boolean) {
    return this.request('/playback/progress', {
      method: 'POST',
      body: JSON.stringify({ episode_id: episodeId, progress_seconds: progressSeconds, completed }),
    });
  }

  async getProgress() {
    return this.request('/playback/progress');
  }

  // Subscription
  async getSubscriptionStatus() {
    return this.request('/subscription/status');
  }

  async createCheckoutSession(plan: 'monthly' | 'yearly') {
    return this.request('/subscription/checkout', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    });
  }

  async createPortalSession() {
    return this.request('/subscription/portal', {
      method: 'POST',
    });
  }

  // Upload
  async uploadAudio(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const headers: HeadersInit = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}/upload/audio`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json() as any;

    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }

    return data;
  }

  // Analytics
  async getAnalytics() {
    return this.request('/analytics');
  }
}

export const apiClient = new ApiClient();

