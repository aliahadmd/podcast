# 🎧 PodcastApp - Subscription-Based Podcast Platform

A modern, full-featured podcast streaming platform built with **Next.js 15** and deployed on **Cloudflare's edge network**.

## ✨ Features

### 🎯 For Users
- 🔐 **Secure Authentication** - Sign up, login, and password reset
- 📧 **Email Notifications** - Welcome, password reset, and subscription emails
- 🎵 **Podcast Discovery** - Browse free and premium podcasts
- ▶️ **Rich Audio Player** - Play, pause, seek, and volume control
- 📊 **Progress Tracking** - Resume playback where you left off
- 💳 **Subscription Management** - Monthly and yearly plans via Stripe
- 🔒 **Premium Access** - Unlock exclusive content with subscription

### 👨‍💼 For Admins
- 📈 **Analytics Dashboard** - Track subscribers, plays, and content
- 🎙️ **Podcast Management** - Create and edit podcasts
- 📝 **Episode Management** - Upload and manage episodes
- 💰 **Monetization** - Set content as free or premium
- ☁️ **Cloud Storage** - Audio files stored in Cloudflare R2

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2 (Object Storage)
- **Deployment**: Cloudflare Workers
- **Payments**: Stripe
- **Authentication**: JWT
- **Email**: Nodemailer + SMTP (Mailtrap)

## 📋 Quick Start

### Prerequisites
- Node.js 18+
- Cloudflare account
- Stripe account

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up Cloudflare D1**
   ```bash
   wrangler d1 create podcast-db
   # Update database_id in wrangler.jsonc
   wrangler d1 execute podcast-db --file=./schema.sql --local
   ```

3. **Create R2 bucket**
   ```bash
   wrangler r2 bucket create podcast-audio
   ```

4. **Configure environment**
   - Update `wrangler.jsonc` with your settings
   - Set Stripe keys and JWT secret
   - ⚠️ **Important**: See [STRIPE_WORKERS_FIX.md](./STRIPE_WORKERS_FIX.md) for Stripe configuration

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Deploy to production**
   ```bash
   npm run deploy
   ```

📖 **See [SETUP.md](./SETUP.md) for detailed setup instructions**

## 🏗️ Architecture

```
┌─────────────────┐
│   Next.js App   │
│  (React 19)     │
└────────┬────────┘
         │
┌────────▼────────┐
│ Cloudflare      │
│ Workers         │
├─────────────────┤
│ • D1 Database   │
│ • R2 Storage    │
│ • JWT Auth      │
└────────┬────────┘
         │
┌────────▼────────┐
│  Stripe API     │
│  (Payments)     │
└─────────────────┘
```

## 📁 Project Structure

```
├── app/
│   ├── api/              # API routes
│   ├── admin/            # Admin dashboard
│   ├── podcasts/         # Podcast pages
│   └── profile/          # User profile
├── components/           # React components
├── lib/                  # Utilities & helpers
├── schema.sql            # Database schema
└── wrangler.jsonc        # Cloudflare config
```

## 🔑 Key Features Explained

### Authentication System
- JWT-based authentication
- Secure password hashing with bcrypt
- Password reset functionality
- Role-based access control (user/admin)

### Subscription System
- Integration with Stripe Checkout
- Monthly ($9.99) and Yearly ($99.99) plans
- Automatic renewal handling
- Stripe Customer Portal for self-service
- Client-side subscription verification (no webhooks needed)
- ⚠️ **Uses Cloudflare Workers-compatible Stripe SDK** - See [STRIPE_WORKERS_FIX.md](./STRIPE_WORKERS_FIX.md)

### Audio Playback
- Custom React audio player component
- Progress tracking saved to database
- Resume playback across devices
- Skip forward/backward 15 seconds
- Volume control

### Access Control
- Middleware-based authentication
- Premium content gating
- Automatic subscription checks
- Admin-only routes

## 🧪 Testing

### Test Accounts
Create a user and upgrade to admin:
```bash
wrangler d1 execute podcast-db --remote \
  --command="UPDATE users SET role='admin' WHERE email='your@email.com'"
```

### Stripe Test Cards
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

## 🚢 Deployment

Deploy to Cloudflare:
```bash
npm run deploy
```

The app will be available at `your-app.workers.dev` or your custom domain.

## 📊 Database Schema

- **users** - User accounts and authentication
- **podcasts** - Podcast metadata
- **episodes** - Episode information and audio URLs
- **subscriptions** - User subscription status
- **playback_progress** - User listening progress
- **episode_plays** - Analytics data

## 🔒 Security

- JWT tokens for authentication
- Password hashing with bcrypt
- Stripe webhook signature verification
- Environment variable protection
- Role-based access control

## 🛠️ Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Deploy to Cloudflare
npm run deploy

# Preview deployment
npm run preview
```

## 📝 Environment Variables

Required in `wrangler.jsonc` (add to `.gitignore`):
- `JWT_SECRET` - Secret key for JWT tokens
- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `SMTP_*` - SMTP configuration for emails
- `APP_URL` - Your application URL

## 📚 Documentation

### Essential Guides
- **[STRIPE_CLOUDFLARE_GUIDE.md](./STRIPE_CLOUDFLARE_GUIDE.md)** - ⭐ **Quick Start for New Projects!** Stripe + Workers
- **[STRIPE_WORKERS_FIX.md](./STRIPE_WORKERS_FIX.md)** - ⚠️ Detailed fix explanation (this project)
- **[SETUP.md](./SETUP.md)** - Complete setup instructions
- **[LOCAL_DB_SETUP.md](./LOCAL_DB_SETUP.md)** - Database setup guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment guide

### Reference
- **[API.md](./API.md)** - API endpoints documentation
- **[AUTH_SYSTEM.md](./AUTH_SYSTEM.md)** - Authentication system details
- **[NO_WEBHOOKS.md](./NO_WEBHOOKS.md)** - Why webhooks were removed
- **[R2_SETUP.md](./R2_SETUP.md)** - Audio storage setup
- **[SMTP.md](./SMTP.md)** - Email configuration
- **[STRIPE_SETUP.md](./STRIPE_SETUP.md)** - Stripe integration guide

## 🤝 Contributing

This is a demonstration project built to showcase a full-stack podcast platform using Cloudflare's edge computing infrastructure.

## 📄 License

MIT

## 🆘 Support

For issues or questions, check the documentation above. The most common issues are covered in [STRIPE_WORKERS_FIX.md](./STRIPE_WORKERS_FIX.md).
