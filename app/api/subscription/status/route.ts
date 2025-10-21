import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { requireAuth } from '@/lib/middleware';
import { DatabaseHelper } from '@/lib/db';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const db = new DatabaseHelper();
    const subscription = await db.getSubscriptionByUserId(authResult.user.id);

    return NextResponse.json({
      success: true,
      subscription: subscription || {
        status: 'inactive',
        plan_type: null,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subscription status' },
      { status: 500 }
    );
  }
}

