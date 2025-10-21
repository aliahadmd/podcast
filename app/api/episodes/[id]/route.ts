import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { DatabaseHelper } from '@/lib/db';
import { requireAdmin, authenticateRequest, checkSubscription } from '@/lib/middleware';
import { z } from 'zod';

const updateEpisodeSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  audio_url: z.string().optional(),
  duration: z.number().optional(),
  episode_number: z.number().optional(),
  season_number: z.number().optional(),
});

// Get single episode
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = new DatabaseHelper();
    const episode = await db.getEpisodeById(id);

    if (!episode) {
      return NextResponse.json(
        { error: 'Episode not found' },
        { status: 404 }
      );
    }

    // Check if podcast is premium
    const podcast = await db.getPodcastById(episode.podcast_id);
    if (podcast?.is_premium) {
      // Check if user has active subscription
      const { user } = await authenticateRequest(request);
      if (!user) {
        return NextResponse.json(
          { error: 'Authentication required for premium content' },
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

    return NextResponse.json({
      success: true,
      episode,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch episode' },
      { status: 500 }
    );
  }
}

// Update episode (admin only)
export async function PATCH(
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
    const data = updateEpisodeSchema.parse(body);

    const db = new DatabaseHelper();
    const episode = await db.getEpisodeById(id);

    if (!episode) {
      return NextResponse.json(
        { error: 'Episode not found' },
        { status: 404 }
      );
    }

    await db.updateEpisode(id, data);

    const updatedEpisode = await db.getEpisodeById(id);

    return NextResponse.json({
      success: true,
      episode: updatedEpisode,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update episode' },
      { status: 400 }
    );
  }
}

// Delete episode (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await params;
    const db = new DatabaseHelper();
    const episode = await db.getEpisodeById(id);

    if (!episode) {
      return NextResponse.json(
        { error: 'Episode not found' },
        { status: 404 }
      );
    }

    await db.deleteEpisode(id);

    return NextResponse.json({
      success: true,
      message: 'Episode deleted',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete episode' },
      { status: 500 }
    );
  }
}

