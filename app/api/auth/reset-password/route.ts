import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { AuthHelper } from '@/lib/auth';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = resetPasswordSchema.parse(body);

    const authHelper = new AuthHelper();
    await authHelper.resetPassword(token, password);

    return NextResponse.json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to reset password' },
      { status: 400 }
    );
  }
}

