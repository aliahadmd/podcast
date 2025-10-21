import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { requireAuth } from '@/lib/middleware';
import { StripeHelper } from '@/lib/stripe';
import { DatabaseHelper } from '@/lib/db';

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const db = new DatabaseHelper();
    const subscription = await db.getSubscriptionByUserId(authResult.user.id);

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    const stripeHelper = new StripeHelper();
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    
    const portalUrl = await stripeHelper.createPortalSession(
      subscription.stripe_customer_id,
      `${origin}/profile`
    );

    return NextResponse.json({
      success: true,
      url: portalUrl,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create portal session' },
      { status: 400 }
    );
  }
}

