import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getAudioBucket } from '@/lib/cloudflare';

// Serve audio files from R2 with signed URLs
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
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

