import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { AuthHelper } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const authHelper = new AuthHelper();
    const result = await authHelper.login(email, password);

    return NextResponse.json({
      success: true,
      user: result.user,
      token: result.token,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 401 }
    );
  }
}

