import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { AuthHelper } from '@/lib/auth';
import { getClientIdentifier, rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const clientIdentifier = getClientIdentifier(request);
    if (!rateLimit(`forgot:${clientIdentifier}`, 3, 300_000)) {
      return NextResponse.json({
        success: false,
        message: 'Too many password reset attempts. Please try again later.',
      }, { status: 429 });
    }

    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    const authHelper = new AuthHelper();
    await authHelper.createPasswordResetToken(email);

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive password reset instructions.',
    });
  } catch (error: any) {
    // Always return success message for security
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive password reset instructions.',
    });
  }
}
