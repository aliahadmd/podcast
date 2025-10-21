import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { DatabaseHelper } from '@/lib/db';
import { requireAdmin } from '@/lib/middleware';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const createEpisodeSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  audio_url: z.string().min(1),
  duration: z.number().optional(),
  episode_number: z.number().optional(),
  season_number: z.number().default(1),
});

// Get episodes for a podcast
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = new DatabaseHelper();
    const episodes = await db.getEpisodesByPodcastId(id);

    return NextResponse.json({
      success: true,
      episodes,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch episodes' },
      { status: 500 }
    );
  }
}

// Create episode (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const data = createEpisodeSchema.parse(body);

    const db = new DatabaseHelper();
    const podcast = await db.getPodcastById(id);

    if (!podcast) {
      return NextResponse.json(
        { error: 'Podcast not found' },
        { status: 404 }
      );
    }

    const episode = await db.createEpisode({
      id: uuidv4(),
      podcast_id: id,
      title: data.title,
      description: data.description || null,
      audio_url: data.audio_url,
      duration: data.duration || null,
      episode_number: data.episode_number || null,
      season_number: data.season_number,
      published_at: Date.now(),
    });

    return NextResponse.json({
      success: true,
      episode,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create episode' },
      { status: 400 }
    );
  }
}

