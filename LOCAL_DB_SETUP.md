# 🗄️ Local D1 Database Setup

## ✅ Quick Fix

If you see `D1_ERROR: no such table: users`, run:

```bash
npx wrangler d1 execute podcast-db --local --file=schema.sql
```

Then restart your dev server:

```bash
npm run dev
```

---

## 📋 What This Does

Creates 8 tables in your local D1 database:
- ✅ `users` - User accounts
- ✅ `password_reset_tokens` - Password reset functionality
- ✅ `subscriptions` - Stripe subscriptions
- ✅ `podcasts` - Podcast metadata
- ✅ `episodes` - Podcast episodes
- ✅ `playback_progress` - User listening history
- ✅ `episode_plays` - Analytics
- ✅ `sessions` - Authentication sessions

---

## 🔍 Verify Database

Check if tables exist:

```bash
npx wrangler d1 execute podcast-db --local --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
```

---

## 🌐 Remote Database Setup

For your deployed app, run the same command without `--local`:

```bash
npx wrangler d1 execute podcast-db --remote --file=schema.sql
```

---

## 📍 Local Database Location

Your local D1 database is stored at:
```
.wrangler/state/v3/d1/
```

**Note:** This directory is gitignored, so it won't be committed.

---

## 🔄 Reset Local Database

To start fresh:

```bash
# Delete local database
rm -rf .wrangler/state/v3/d1/

# Re-initialize
npx wrangler d1 execute podcast-db --local --file=schema.sql
```

---

## 🧪 Testing Database

Query data:
```bash
npx wrangler d1 execute podcast-db --local --command="SELECT * FROM users;"
```

Insert test data:
```bash
npx wrangler d1 execute podcast-db --local --command="INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at) VALUES ('test-id', 'test@example.com', 'hash', 'Test User', 'user', 1000000, 1000000);"
```

---

## 💡 Common Commands

### List all tables
```bash
npx wrangler d1 execute podcast-db --local --command="SELECT name FROM sqlite_master WHERE type='table';"
```

### Count users
```bash
npx wrangler d1 execute podcast-db --local --command="SELECT COUNT(*) as count FROM users;"
```

### List all podcasts
```bash
npx wrangler d1 execute podcast-db --local --command="SELECT * FROM podcasts;"
```

### Clear all users (careful!)
```bash
npx wrangler d1 execute podcast-db --local --command="DELETE FROM users;"
```

---

## ✅ You're All Set!

Your local D1 database is now configured and ready to use! 🎉

Run `npm run dev` and try signing up again.

