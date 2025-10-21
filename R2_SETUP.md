# R2 Audio Storage Setup

## Current Implementation

The podcast app now serves audio files through an API endpoint that fetches from R2 storage.

### How It Works

1. **Upload Flow:**
   - Admin uploads audio file via `/api/upload/audio`
   - File is stored in R2 bucket `podcast-audio`
   - Filename is returned: `{uuid}.mp3`
   - Episode is created with URL: `/api/audio/{filename}`

2. **Playback Flow:**
   - Player requests: `/api/audio/{filename}`
   - API fetches file from R2
   - Streams audio to player

### Advantages
- ✅ No public R2 bucket needed
- ✅ Access control possible
- ✅ Works immediately without extra configuration
- ✅ Can add authentication/authorization later

## Production Options

### Option 1: Keep Current Setup (Recommended for MVP)
**Pros:**
- Works immediately
- Full control over access
- Can add auth/analytics
- No extra configuration

**Cons:**
- Slightly higher latency vs direct R2
- Uses Worker compute time

**No changes needed!** Current setup works out of the box.

### Option 2: R2 Public Bucket + Custom Domain

For better performance with high traffic:

#### Step 1: Make R2 Bucket Public
```bash
wrangler r2 bucket update podcast-audio --public
```

#### Step 2: Connect Custom Domain

1. Go to Cloudflare Dashboard
2. Navigate to R2 > podcast-audio bucket
3. Click "Connect Domain"
4. Add: `cdn.yourdomain.com` or `audio.yourdomain.com`
5. Wait for SSL certificate

#### Step 3: Update Upload Route

```typescript
// In app/api/upload/audio/route.ts
const audioUrl = `https://audio.yourdomain.com/${fileName}`;
```

#### Benefits:
- Direct R2 access (faster)
- CDN caching
- Lower compute costs
- Better for high traffic

### Option 3: R2 Public Access URLs

For quick testing without custom domain:

```typescript
// Generate R2 public URL
const audioUrl = `https://pub-{bucket-id}.r2.dev/${fileName}`;
```

Note: This requires public bucket setting.

## Current Configuration

**Bucket Name:** `podcast-audio`  
**Binding:** `AUDIO_BUCKET`  
**Serve Via:** `/api/audio/{filename}` (API endpoint)

## Testing

1. Upload an audio file in admin panel
2. Create episode with uploaded file
3. Play episode - audio should stream correctly
4. Check browser console for any errors

## Troubleshooting

### Audio Not Playing

**Check:**
1. File was uploaded successfully (check admin panel feedback)
2. Episode has correct URL: `/api/audio/{uuid}.mp3`
3. Browser console for errors
4. Network tab shows 200 response from `/api/audio/*`

### Slow Streaming

**Solutions:**
1. Switch to Option 2 (Public Bucket + Domain)
2. Enable streaming optimization in R2
3. Add CDN layer

### CORS Issues

Add to `app/api/audio/[filename]/route.ts`:

```typescript
headers.set('Access-Control-Allow-Origin', '*');
headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
```

## Cost Considerations

### Current Setup (Option 1)
- R2 Storage: $0.015/GB/month
- Class A Operations (upload): $4.50/million
- Class B Operations (read): $0.36/million
- Worker requests: Included in free tier (100k/day)

### Public Bucket (Option 2)
- R2 Storage: $0.015/GB/month
- Class A Operations: $4.50/million
- Class B Operations: Free (public access)
- No Worker compute for audio serving

## Migration Guide

To switch from API serving to public bucket:

1. Make bucket public:
   ```bash
   wrangler r2 bucket update podcast-audio --public
   ```

2. Connect custom domain in dashboard

3. Update upload route to use public URL

4. Update existing episodes (run migration script):
   ```typescript
   // Update all episodes
   UPDATE episodes 
   SET audio_url = REPLACE(audio_url, '/api/audio/', 'https://audio.yourdomain.com/')
   WHERE audio_url LIKE '/api/audio/%'
   ```

## Recommendations

**For Development/Testing:**  
✅ Use current setup (Option 1) - works immediately

**For Production (<1000 users):**  
✅ Use current setup (Option 1) - simpler, more control

**For Production (>1000 users):**  
⭐ Use Option 2 (Public Bucket + Custom Domain) - better performance

**For Very High Traffic:**  
⭐ Option 2 + Cloudflare CDN caching

