import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { DatabaseHelper } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';
import { z } from 'zod';

const progressSchema = z.object({
  episode_id: z.string(),
  progress_seconds: z.number().min(0),
  completed: z.boolean().default(false),
});

// Save/update playback progress
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const data = progressSchema.parse(body);

    const db = new DatabaseHelper();
    await db.upsertPlaybackProgress({
      user_id: authResult.user.id,
      episode_id: data.episode_id,
      progress_seconds: data.progress_seconds,
      completed: data.completed ? 1 : 0,
      last_played_at: Date.now(),
    });

    // Record play for analytics
    await db.recordEpisodePlay(data.episode_id, authResult.user.id);

    return NextResponse.json({
      success: true,
      message: 'Progress saved',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to save progress' },
      { status: 400 }
    );
  }
}

// Get user's recent progress
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const db = new DatabaseHelper();
    const progress = await db.getUserRecentProgress(authResult.user.id, 20);

    return NextResponse.json({
      success: true,
      progress,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

