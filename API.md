# PodcastApp API Documentation

## Base URL
- Local: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "token": "jwt-token"
}
```

### POST /api/auth/login
Login to existing account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "user": { ... },
  "token": "jwt-token"
}
```

### GET /api/auth/me
Get current user information.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

### POST /api/auth/forgot-password
Request password reset.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset token created",
  "resetToken": "token" // Remove in production
}
```

### POST /api/auth/reset-password
Reset password with token.

**Request Body:**
```json
{
  "token": "reset-token",
  "password": "newpassword123"
}
```

---

## Podcast Endpoints

### GET /api/podcasts
Get all podcasts.

**Query Parameters:**
- `premium` (optional): `true` or `false` to filter

**Response:**
```json
{
  "success": true,
  "podcasts": [
    {
      "id": "uuid",
      "title": "Tech Talks",
      "description": "Latest in technology",
      "cover_art_url": "https://...",
      "author": "John Doe",
      "is_premium": 0,
      "category": "Technology"
    }
  ]
}
```

### GET /api/podcasts/:id
Get single podcast.

**Response:**
```json
{
  "success": true,
  "podcast": { ... }
}
```

### POST /api/podcasts
Create new podcast (Admin only).

**Headers:** `Authorization: Bearer <admin-token>`

**Request Body:**
```json
{
  "title": "New Podcast",
  "description": "Podcast description",
  "author": "Author Name",
  "is_premium": true,
  "category": "Technology",
  "cover_art_url": "https://..."
}
```

### PATCH /api/podcasts/:id
Update podcast (Admin only).

**Headers:** `Authorization: Bearer <admin-token>`

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "is_premium": false
}
```

### DELETE /api/podcasts/:id
Delete podcast (Admin only).

**Headers:** `Authorization: Bearer <admin-token>`

---

## Episode Endpoints

### GET /api/podcasts/:id/episodes
Get all episodes for a podcast.

**Response:**
```json
{
  "success": true,
  "episodes": [
    {
      "id": "uuid",
      "podcast_id": "uuid",
      "title": "Episode 1",
      "description": "Episode description",
      "audio_url": "https://...",
      "duration": 3600,
      "episode_number": 1,
      "published_at": 1234567890
    }
  ]
}
```

### GET /api/episodes/:id
Get single episode.

**Note:** Premium podcasts require authentication and active subscription.

**Response:**
```json
{
  "success": true,
  "episode": { ... }
}
```

### POST /api/podcasts/:id/episodes
Create new episode (Admin only).

**Headers:** `Authorization: Bearer <admin-token>`

**Request Body:**
```json
{
  "title": "Episode Title",
  "description": "Episode description",
  "audio_url": "https://r2-url.com/audio.mp3",
  "duration": 3600,
  "episode_number": 1,
  "season_number": 1
}
```

### PATCH /api/episodes/:id
Update episode (Admin only).

### DELETE /api/episodes/:id
Delete episode (Admin only).

---

## Playback Endpoints

### POST /api/playback/progress
Save playback progress.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "episode_id": "uuid",
  "progress_seconds": 1234,
  "completed": false
}
```

### GET /api/playback/progress
Get user's recent playback progress.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "progress": [
    {
      "id": "uuid",
      "episode_id": "uuid",
      "progress_seconds": 1234,
      "completed": 0,
      "last_played_at": 1234567890
    }
  ]
}
```

---

## Subscription Endpoints

### GET /api/subscription/status
Get user's subscription status.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "subscription": {
    "status": "active",
    "plan_type": "monthly",
    "current_period_end": 1234567890,
    "cancel_at_period_end": 0
  }
}
```

### POST /api/subscription/checkout
Create Stripe checkout session.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "plan": "monthly" // or "yearly"
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://checkout.stripe.com/..."
}
```

### POST /api/subscription/portal
Create Stripe billing portal session.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "url": "https://billing.stripe.com/..."
}
```

### POST /api/subscription/webhook
Stripe webhook endpoint (called by Stripe).

**Headers:**
- `stripe-signature`: Webhook signature

**Note:** This endpoint is automatically called by Stripe. Do not call manually.

---

## Upload Endpoints

### POST /api/upload/audio
Upload audio file to R2 (Admin only).

**Headers:**
- `Authorization: Bearer <admin-token>`
- `Content-Type: multipart/form-data`

**Request Body:**
- `file`: Audio file (mp3, wav, ogg)

**Response:**
```json
{
  "success": true,
  "audioUrl": "https://r2-domain.com/uuid.mp3",
  "fileName": "uuid.mp3"
}
```

---

## Analytics Endpoints

### GET /api/analytics
Get platform analytics (Admin only).

**Headers:** `Authorization: Bearer <admin-token>`

**Response:**
```json
{
  "success": true,
  "analytics": {
    "totalSubscribers": 150,
    "totalPlays": 5000,
    "totalPodcasts": 25,
    "premiumPodcasts": 10
  }
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting in production using Cloudflare Workers rate limiting features.

---

## CORS

Configure CORS headers as needed for your frontend domain in production.

---

## Webhook Configuration

### Stripe Webhooks

Configure the following webhook events in Stripe Dashboard:

**Endpoint URL:** `https://your-domain.com/api/subscription/webhook`

**Events to listen for:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

**Webhook Signing Secret:** Add to environment as `STRIPE_WEBHOOK_SECRET`

