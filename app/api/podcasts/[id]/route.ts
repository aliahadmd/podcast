import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { DatabaseHelper } from '@/lib/db';
import { requireAdmin } from '@/lib/middleware';
import { z } from 'zod';

const updatePodcastSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  cover_art_url: z.string().optional(),
  author: z.string().optional(),
  is_premium: z.boolean().optional(),
  category: z.string().optional(),
});

// Get single podcast
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = new DatabaseHelper();
    const podcast = await db.getPodcastById(id);

    if (!podcast) {
      return NextResponse.json(
        { error: 'Podcast not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      podcast,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch podcast' },
      { status: 500 }
    );
  }
}

// Update podcast (admin only)
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
    const data = updatePodcastSchema.parse(body);

    const db = new DatabaseHelper();
    const podcast = await db.getPodcastById(id);

    if (!podcast) {
      return NextResponse.json(
        { error: 'Podcast not found' },
        { status: 404 }
      );
    }

    const updates: any = {};
    if (data.title !== undefined) updates.title = data.title;
    if (data.description !== undefined) updates.description = data.description;
    if (data.cover_art_url !== undefined) updates.cover_art_url = data.cover_art_url;
    if (data.author !== undefined) updates.author = data.author;
    if (data.is_premium !== undefined) updates.is_premium = data.is_premium ? 1 : 0;
    if (data.category !== undefined) updates.category = data.category;

    await db.updatePodcast(id, updates);

    const updatedPodcast = await db.getPodcastById(id);

    return NextResponse.json({
      success: true,
      podcast: updatedPodcast,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update podcast' },
      { status: 400 }
    );
  }
}

// Delete podcast (admin only)
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
    const podcast = await db.getPodcastById(id);

    if (!podcast) {
      return NextResponse.json(
        { error: 'Podcast not found' },
        { status: 404 }
      );
    }

    await db.deletePodcast(id);

    return NextResponse.json({
      success: true,
      message: 'Podcast deleted',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete podcast' },
      { status: 500 }
    );
  }
}

