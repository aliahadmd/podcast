import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  return NextResponse.json({
    success: true,
    user: authResult.user,
  });
}

