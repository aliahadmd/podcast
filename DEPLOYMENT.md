# 🚀 Deployment Guide - Cloudflare Workers

## ✅ Deployment Status: SUCCESSFUL

Your podcast application is now **live on Cloudflare!**

🌐 **Live URL:** https://podcast.aliahad.workers.dev

---

## 🔧 Deployment Fix Applied

### Problem:
The deployment was failing with:
```
binding DB of type d1 must have a valid `id` specified [code: 10021]
```

### Root Cause:
- **Duplicate database bindings** in `wrangler.jsonc`
- First binding had invalid ID: `"database_id": "podcast-db"` (not a UUID)
- Second binding had valid ID: `"2cfa6cb8-65cf-4f4c-97ef-d4d185d0166f"`

### Solution:
1. ✅ Removed duplicate D1 database binding
2. ✅ Removed duplicate R2 bucket binding
3. ✅ Used the valid UUID for the database
4. ✅ Initialized D1 database with schema (8 tables created)
5. ✅ Verified R2 bucket exists

---

## 📊 Deployment Details

### Resources Provisioned:

| Resource | Type | ID/Name | Status |
|----------|------|---------|--------|
| **D1 Database** | Database | `2cfa6cb8-65cf-4f4c-97ef-d4d185d0166f` | ✅ Active |
| **R2 Bucket** | Object Storage | `podcast-audio` | ✅ Active |
| **Worker** | Compute | `podcast` | ✅ Deployed |

### Database Schema:
- ✅ **8 tables** created successfully
- ✅ **29 queries** executed
- ✅ **50 rows** written
- ✅ Database size: **0.19 MB**

### Build Output:
- ✅ **29 routes** built successfully
- ✅ **6.89 MB** uploaded (1.29 MB gzipped)
- ✅ **Worker startup time:** 28ms
- ✅ **Version ID:** `33e7b7b6-76e1-431d-a57a-dd9d37d84ff7`

---

## 🔐 Environment Variables Deployed

The following environment variables are configured in production:

| Variable | Status | Notes |
|----------|--------|-------|
| `JWT_SECRET` | ⚠️ Default | **Change in production!** |
| `STRIPE_PUBLISHABLE_KEY` | ✅ Set | Test mode key |
| `STRIPE_SECRET_KEY` | ✅ Set | Test mode key |
| `STRIPE_WEBHOOK_SECRET` | ⚠️ Placeholder | **Update with actual webhook secret!** |
| `NODE_ENV` | ⚠️ `development` | **Change to `production`!** |
| `SMTP_HOST` | ✅ Set | Mailtrap sandbox |
| `SMTP_PORT` | ✅ Set | 2525 |
| `SMTP_USER` | ✅ Set | Mailtrap credentials |
| `SMTP_PASS` | ✅ Set | Mailtrap credentials |
| `SMTP_FROM_EMAIL` | ✅ Set | noreply@podcastapp.com |
| `SMTP_FROM_NAME` | ✅ Set | PodcastApp |
| `APP_URL` | ⚠️ `localhost:3000` | **Update to production URL!** |

---

## ⚠️ IMPORTANT: Post-Deployment Actions

### 1. Update Environment Variables (CRITICAL)

Run these commands to update production secrets:

```bash
# Update JWT Secret
wrangler secret put JWT_SECRET
# Enter a strong, random secret when prompted

# Update Stripe Webhook Secret
wrangler secret put STRIPE_WEBHOOK_SECRET
# Get this from Stripe Dashboard > Developers > Webhooks

# Update SMTP credentials (if using production email service)
wrangler secret put SMTP_USER
wrangler secret put SMTP_PASS
```

### 2. Update `wrangler.jsonc` Variables

Update these values in `wrangler.jsonc`:

```jsonc
"vars": {
  "NODE_ENV": "production",           // ← Change from "development"
  "APP_URL": "https://podcast.aliahad.workers.dev",  // ← Update to your domain
  // ... other variables
}
```

Then redeploy:
```bash
npm run deploy
```

### 3. Configure Stripe Webhook

#### A. Create Webhook Endpoint in Stripe:
1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click **"Add endpoint"**
3. **Endpoint URL:** `https://podcast.aliahad.workers.dev/api/subscription/webhook`
4. **Events to listen for:**
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

#### B. Get Webhook Secret:
1. After creating, click on the webhook
2. Click **"Reveal"** under "Signing secret"
3. Copy the secret (starts with `whsec_...`)

#### C. Update Worker:
```bash
wrangler secret put STRIPE_WEBHOOK_SECRET
# Paste the webhook secret
```

### 4. Create Admin User

Connect to the production database and create an admin user:

```bash
# Open D1 console
wrangler d1 execute podcast-db --remote --command="SELECT * FROM users"

# After first user registers, make them admin:
wrangler d1 execute podcast-db --remote --command="UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com'"
```

### 5. Configure Custom Domain (Optional)

If you have a custom domain:

```bash
# Add custom domain
wrangler deployments domains add podcast.yourdomain.com

# Update APP_URL in wrangler.jsonc
"APP_URL": "https://podcast.yourdomain.com"
```

Then redeploy.

### 6. Set Up Production SMTP (Recommended)

For production, switch from Mailtrap to a real email service:

**Options:**
- **SendGrid** - 100 emails/day free
- **Mailgun** - 5,000 emails/month free
- **AWS SES** - Very cheap, reliable
- **Postmark** - Developer-friendly

**Update SMTP settings:**
```bash
wrangler secret put SMTP_HOST
wrangler secret put SMTP_PORT
wrangler secret put SMTP_USER
wrangler secret put SMTP_PASS
```

### 7. Update Stripe to Production Mode

When ready for production:

1. Switch to **Production keys** in Stripe Dashboard
2. Update environment:
   ```bash
   wrangler secret put STRIPE_SECRET_KEY
   # Enter production secret key
   ```
3. Update `wrangler.jsonc`:
   ```jsonc
   "STRIPE_PUBLISHABLE_KEY": "pk_live_..."
   ```
4. Recreate webhook endpoint for production
5. Update `STRIPE_WEBHOOK_SECRET`

---

## 🧪 Testing Your Deployment

### 1. Test Home Page:
```
https://podcast.aliahad.workers.dev/
```

### 2. Test User Registration:
```
https://podcast.aliahad.workers.dev/register
```

### 3. Test Authentication:
1. Register a new account
2. Check if you receive a welcome email (in Mailtrap)
3. Log in with your credentials
4. Verify navbar updates with your name

### 4. Test Admin Access:
1. Make your user an admin (see step 4 above)
2. Visit: `https://podcast.aliahad.workers.dev/admin`
3. Try creating a podcast

### 5. Test API Endpoints:
```bash
# Health check
curl https://podcast.aliahad.workers.dev/api/auth/me

# Should return 401 without auth token
```

---

## 📈 Monitoring & Logs

### View Logs:
```bash
# Live tail logs
wrangler tail

# View logs in dashboard
wrangler dash
```

### View Analytics:
1. Go to: https://dash.cloudflare.com/
2. Navigate to: **Workers & Pages** > **podcast**
3. View metrics:
   - Request count
   - Errors
   - CPU time
   - Duration

### Database Analytics:
```bash
# View database info
wrangler d1 info podcast-db

# Query database
wrangler d1 execute podcast-db --remote --command="SELECT COUNT(*) FROM users"
```

---

## 🔄 Redeployment

To deploy updates:

```bash
# Build and deploy
npm run deploy

# Or separately:
npm run build
npx opennextjs-cloudflare deploy
```

---

## 🗂️ File Structure (Deployed)

```
.open-next/
├── assets/              # Static files (CSS, JS, images)
├── cache/               # Next.js cache
├── server-functions/    # API routes
└── worker.js           # Cloudflare Worker entry point
```

---

## 🚨 Troubleshooting

### Issue: "Database not found"
```bash
# Verify database exists
wrangler d1 list

# Verify binding in wrangler.jsonc
cat wrangler.jsonc | grep database_id
```

### Issue: "R2 bucket not found"
```bash
# Verify bucket exists
wrangler r2 bucket list

# Verify binding in wrangler.jsonc
cat wrangler.jsonc | grep bucket_name
```

### Issue: "Environment variables not working"
```bash
# List all secrets
wrangler secret list

# Check wrangler.jsonc for vars section
```

### Issue: "Stripe webhook not working"
- Verify webhook URL in Stripe Dashboard
- Check webhook secret is correct
- View logs: `wrangler tail`
- Test locally with Stripe CLI:
  ```bash
  stripe listen --forward-to https://podcast.aliahad.workers.dev/api/subscription/webhook
  ```

---

## 📚 Additional Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [D1 Database Docs](https://developers.cloudflare.com/d1/)
- [R2 Storage Docs](https://developers.cloudflare.com/r2/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [OpenNext Cloudflare](https://github.com/opennextjs/opennextjs-cloudflare)

---

## ✅ Deployment Checklist

Use this checklist to ensure production readiness:

- [ ] Update `JWT_SECRET` to a strong random value
- [ ] Update `STRIPE_WEBHOOK_SECRET` with actual webhook secret
- [ ] Change `NODE_ENV` to `production`
- [ ] Update `APP_URL` to production URL
- [ ] Configure Stripe webhook endpoint
- [ ] Create admin user in database
- [ ] Test user registration and login
- [ ] Test password reset flow
- [ ] Test subscription payment (use Stripe test cards)
- [ ] Verify email delivery (check Mailtrap)
- [ ] Test admin panel access
- [ ] Test podcast creation and episode upload
- [ ] Test audio playback
- [ ] Configure custom domain (optional)
- [ ] Set up production SMTP service
- [ ] Switch to Stripe production keys (when ready)
- [ ] Set up monitoring and alerts
- [ ] Review security settings
- [ ] Backup database regularly

---

## 🎉 Summary

Your podcast application is successfully deployed to Cloudflare Workers! 

**Next Steps:**
1. ✅ Complete the post-deployment actions above
2. ✅ Test all functionality thoroughly
3. ✅ Configure production settings
4. ✅ Launch! 🚀

**Support:**
- View logs: `wrangler tail`
- Check status: https://dash.cloudflare.com/
- Refer to documentation in the repo

**Great work! Your app is live!** 🎊

