import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getAudioBucket } from '@/lib/cloudflare';
import { DatabaseHelper } from '@/lib/db';
import { authenticateRequest, checkSubscription } from '@/lib/middleware';

// Serve audio files from R2 with signed URLs
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const audioPath = `/api/audio/${filename}`;
    const db = new DatabaseHelper();
    const episode = await db.getEpisodeWithPodcastByAudioUrl(audioPath);

    if (!episode) {
      return NextResponse.json(
        { error: 'Audio file not found' },
        { status: 404 }
      );
    }

    if (episode.podcast_is_premium) {
      const { user, error } = await authenticateRequest(request);
      if (!user) {
        return NextResponse.json(
          { error: error || 'Authentication required for premium content' },
          { status: 401 }
        );
      }

      const hasSubscription = await checkSubscription(user.id);
      if (!hasSubscription) {
        return NextResponse.json(
          { error: 'Active subscription required for premium content' },
          { status: 403 }
        );
      }
    }

    const bucket = getAudioBucket();
    
    // Get the file from R2
    const object = await bucket.get(filename);
    
    if (!object) {
      return NextResponse.json(
        { error: 'Audio file not found' },
        { status: 404 }
      );
    }

    // Stream the audio file
    const headers = new Headers();
    headers.set('Content-Type', object.httpMetadata?.contentType || 'audio/mpeg');
    headers.set('Content-Length', object.size.toString());
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', 'public, max-age=31536000');

    return new NextResponse(object.body, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error('Failed to serve audio:', error);
    return NextResponse.json(
      { error: 'Failed to serve audio file' },
      { status: 500 }
    );
  }
}
