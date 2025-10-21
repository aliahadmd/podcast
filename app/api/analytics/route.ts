import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import { DatabaseHelper } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const db = new DatabaseHelper();
    
    const totalSubscribers = await db.getTotalSubscribers();
    const totalPlays = await db.getTotalPlays();
    const allPodcasts = await db.getAllPodcasts();

    return NextResponse.json({
      success: true,
      analytics: {
        totalSubscribers,
        totalPlays,
        totalPodcasts: allPodcasts.length,
        premiumPodcasts: allPodcasts.filter(p => p.is_premium).length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

