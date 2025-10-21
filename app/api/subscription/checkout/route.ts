import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { requireAuth } from '@/lib/middleware';
import { StripeHelper } from '@/lib/stripe';
import { z } from 'zod';

const checkoutSchema = z.object({
  plan: z.enum(['monthly', 'yearly']),
});

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const { plan } = checkoutSchema.parse(body);

    const stripeHelper = new StripeHelper();
    const origin = request.headers.get('origin') || request.headers.get('referer')?.split('/').slice(0, 3).join('/') || 'http://localhost:3000';
    
    console.log('[Checkout] Request from origin:', origin);
    console.log('[Checkout] User:', authResult.user.email, 'Plan:', plan);
    
    const checkoutUrl = await stripeHelper.createCheckoutSession(
      authResult.user.id,
      authResult.user.email,
      plan,
      `${origin}/subscription/success`,
      `${origin}/subscription/cancel`
    );

    console.log('[Checkout] Success! Checkout URL created');
    return NextResponse.json({
      success: true,
      url: checkoutUrl,
    });
  } catch (error: any) {
    console.error('[Checkout] ERROR:', error);
    console.error('[Checkout] Error type:', error.type);
    console.error('[Checkout] Error code:', error.code);
    console.error('[Checkout] Error message:', error.message);
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create checkout session',
        details: error.type || error.code || 'unknown',
        stripeError: error.raw?.message || undefined
      },
      { status: 400 }
    );
  }
}

