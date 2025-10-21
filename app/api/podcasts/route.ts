import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { DatabaseHelper } from '@/lib/db';
import { requireAdmin } from '@/lib/middleware';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const createPodcastSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  cover_art_url: z.string().optional(),
  author: z.string().optional(),
  is_premium: z.boolean().default(false),
  category: z.string().optional(),
});

// Get all podcasts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const premiumFilter = searchParams.get('premium');
    
    const db = new DatabaseHelper();
    let podcasts;
    
    if (premiumFilter !== null) {
      podcasts = await db.getAllPodcasts(premiumFilter === 'true');
    } else {
      podcasts = await db.getAllPodcasts();
    }

    return NextResponse.json({
      success: true,
      podcasts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch podcasts' },
      { status: 500 }
    );
  }
}

// Create new podcast (admin only)
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const data = createPodcastSchema.parse(body);

    const db = new DatabaseHelper();
    const podcast = await db.createPodcast({
      id: uuidv4(),
      title: data.title,
      description: data.description || null,
      cover_art_url: data.cover_art_url || null,
      author: data.author || null,
      is_premium: data.is_premium ? 1 : 0,
      category: data.category || null,
      created_by: authResult.user.id,
    });

    return NextResponse.json({
      success: true,
      podcast,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create podcast' },
      { status: 400 }
    );
  }
}

