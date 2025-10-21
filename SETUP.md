# PodcastApp Setup Guide

## Overview

This is a comprehensive subscription-based podcast web application built with:
- **Next.js 15** (App Router)
- **Cloudflare Workers** for deployment
- **Cloudflare D1** for database
- **Cloudflare R2** for audio storage
- **Stripe** for payments
- **TypeScript** and **Tailwind CSS**

## Features

### User Features
- ✅ User authentication (sign up, login, password reset)
- ✅ User profiles
- ✅ Podcast discovery and browsing
- ✅ Audio player with playback controls
- ✅ Playback progress tracking
- ✅ Subscription management (monthly/yearly plans)
- ✅ Premium content access control

### Admin Features
- ✅ Admin dashboard with analytics
- ✅ Create and manage podcasts
- ✅ Upload and manage episodes
- ✅ Set podcasts as free or premium
- ✅ View subscriber and play count statistics

## Prerequisites

1. Node.js 18+ installed
2. A Cloudflare account
3. A Stripe account
4. Wrangler CLI installed globally: `npm install -g wrangler`

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Cloudflare D1 Database

```bash
# Create D1 database
wrangler d1 create podcast-db

# Note the database_id from the output and update wrangler.jsonc
```

Update `wrangler.jsonc` with your database ID:
```json
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "podcast-db",
    "database_id": "YOUR_DATABASE_ID_HERE"
  }
]
```

Initialize the database schema:
```bash
wrangler d1 execute podcast-db --file=./schema.sql --local
wrangler d1 execute podcast-db --file=./schema.sql --remote
```

### 3. Set Up Cloudflare R2 Bucket

```bash
# Create R2 bucket
wrangler r2 bucket create podcast-audio

# Enable public access (optional, for direct audio URLs)
# Or set up a custom domain for your R2 bucket
```

Update `app/api/upload/audio/route.ts` with your R2 public URL.

### 4. Configure Stripe

⚠️ **Important**: You need to configure Stripe API keys to enable subscriptions.

📖 **See detailed instructions**: [STRIPE_SETUP.md](./STRIPE_SETUP.md)

**Quick steps:**
1. Get your Stripe API keys from https://dashboard.stripe.com/apikeys
2. Add `STRIPE_SECRET_KEY` to `.dev.vars` or `wrangler.jsonc`
3. Create two products in Stripe:
   - Monthly plan ($9.99/month)
   - Yearly plan ($99.99/year)
4. Note the Price IDs for each plan
5. Update `lib/stripe.ts` with your price IDs
6. Restart your development server

### 5. Set Environment Variables

For **local development**, create a `.dev.vars` file or update `wrangler.jsonc`:

**.dev.vars** (Recommended):
```bash
JWT_SECRET=your-secure-jwt-secret-here
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NODE_ENV=development
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-user
SMTP_PASS=your-mailtrap-pass
SMTP_FROM_EMAIL=noreply@podcastapp.com
SMTP_FROM_NAME=PodcastApp
APP_URL=http://localhost:3000
```

Or in **wrangler.jsonc**:
```json
"vars": {
  "JWT_SECRET": "your-secure-jwt-secret-here",
  "STRIPE_PUBLISHABLE_KEY": "pk_test_...",
  "STRIPE_SECRET_KEY": "sk_test_...",
  "STRIPE_WEBHOOK_SECRET": "whsec_...",
  "NODE_ENV": "development",
  "SMTP_HOST": "sandbox.smtp.mailtrap.io",
  "SMTP_PORT": "2525",
  "SMTP_USER": "your-mailtrap-user",
  "SMTP_PASS": "your-mailtrap-pass",
  "SMTP_FROM_EMAIL": "noreply@podcastapp.com",
  "SMTP_FROM_NAME": "PodcastApp",
  "APP_URL": "http://localhost:3000"
}
```

For **production**, use Wrangler secrets:
```bash
wrangler secret put JWT_SECRET
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
wrangler secret put STRIPE_PUBLISHABLE_KEY
wrangler secret put SMTP_HOST
wrangler secret put SMTP_PORT
wrangler secret put SMTP_USER
wrangler secret put SMTP_PASS
wrangler secret put SMTP_FROM_EMAIL
wrangler secret put APP_URL
```

### 6. Set Up Stripe Webhook

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://your-domain.com/api/subscription/webhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook signing secret
5. Add it to your secrets: `wrangler secret put STRIPE_WEBHOOK_SECRET`

## Running Locally

```bash
# Development mode with hot reload
npm run dev

# Open http://localhost:3000
```

## Creating the First Admin User

Since there's no UI for creating admin users, you'll need to:

1. Register a normal user through the UI
2. Update the user's role in the database:

```bash
# Local database
wrangler d1 execute podcast-db --local --command="UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com'"

# Production database
wrangler d1 execute podcast-db --remote --command="UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com'"
```

## Deployment

### Deploy to Cloudflare

```bash
# Build and deploy
npm run deploy

# Or preview before deploying
npm run preview
```

### Configure Custom Domain (Optional)

1. Go to Cloudflare Dashboard > Workers & Pages
2. Select your worker
3. Go to Settings > Triggers > Custom Domains
4. Add your custom domain

## Testing the Application

### Test User Flow
1. Visit the homepage
2. Sign up for an account
3. Browse free podcasts
4. Try to access a premium podcast (should prompt for subscription)
5. Subscribe using Stripe test cards
6. Access premium content

### Test Admin Flow
1. Login as admin user
2. Visit `/admin`
3. Create a new podcast
4. Add episodes
5. Upload audio files
6. View analytics

### Stripe Test Cards
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Use any future date for expiry and any 3 digits for CVC

## Project Structure

```
/app
  /api                  # API routes
    /auth              # Authentication endpoints
    /podcasts          # Podcast management
    /episodes          # Episode management
    /subscription      # Stripe integration
    /playback          # Playback progress
    /upload            # File uploads
    /analytics         # Admin analytics
  /admin               # Admin dashboard pages
  /podcasts            # Public podcast pages
  /profile             # User profile
  /login, /register    # Auth pages

/components            # React components
  AudioPlayer.tsx      # Audio player component
  Navbar.tsx          # Navigation bar

/lib                   # Utilities
  api-client.ts       # Frontend API client
  auth.ts             # Authentication helper
  cloudflare.ts       # Cloudflare bindings
  db.ts               # Database helper
  middleware.ts       # Auth middleware
  stripe.ts           # Stripe integration

schema.sql            # D1 database schema
wrangler.jsonc        # Cloudflare configuration
```

## Common Issues

### Issue: "Failed to get Cloudflare context"
**Solution**: Make sure you're running with `npm run dev` which initializes the Cloudflare environment.

### Issue: Database not found
**Solution**: Run the schema initialization commands again for both local and remote.

### Issue: Audio upload fails
**Solution**: Check that your R2 bucket name matches the one in `wrangler.jsonc`.

### Issue: Stripe webhook not working
**Solution**: 
- Verify webhook secret is set correctly
- Check webhook URL is accessible
- Review Stripe webhook logs

## Security Notes

1. **Never commit secrets** to version control
2. Use strong JWT secrets in production
3. Enable HTTPS for production deployments
4. Regularly rotate API keys and secrets
5. Implement rate limiting for production
6. Add CORS policies as needed

## Support

For issues or questions:
- Check Cloudflare Workers documentation
- Review Stripe API documentation
- Check Next.js App Router documentation

## License

MIT

