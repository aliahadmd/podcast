import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { requireAuth } from '@/lib/middleware';
import { StripeHelper } from '@/lib/stripe';
import { z } from 'zod';

const verifySchema = z.object({
  sessionId: z.string(),
});

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const { sessionId } = verifySchema.parse(body);

    const stripeHelper = new StripeHelper();
    await stripeHelper.verifyAndActivateSession(sessionId, authResult.user.id);

    return NextResponse.json({
      success: true,
      message: 'Subscription activated successfully',
    });
  } catch (error: any) {
    console.error('Session verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify session' },
      { status: 400 }
    );
  }
}

