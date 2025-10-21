import { NextRequest, NextResponse } from 'next/server';
import { AuthHelper } from './auth';
import { DatabaseHelper } from './db';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export async function authenticateRequest(request: NextRequest): Promise<{ user: any; error?: string }> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'No token provided' };
  }

  const token = authHeader.substring(7);
  const authHelper = new AuthHelper();
  
  try {
    const user = await authHelper.getUserFromToken(token);
    if (!user) {
      return { user: null, error: 'Invalid token' };
    }
    return { user };
  } catch (error) {
    return { user: null, error: 'Authentication failed' };
  }
}

export async function requireAuth(request: NextRequest): Promise<NextResponse | { user: any }> {
  const { user, error } = await authenticateRequest(request);
  
  if (!user) {
    return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
  }
  
  return { user };
}

export async function requireAdmin(request: NextRequest): Promise<NextResponse | { user: any }> {
  const { user, error } = await authenticateRequest(request);
  
  if (!user) {
    return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
  }
  
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  
  return { user };
}

export async function checkSubscription(userId: string): Promise<boolean> {
  const db = new DatabaseHelper();
  const subscription = await db.getSubscriptionByUserId(userId);
  
  if (!subscription) {
    return false;
  }
  
  if (subscription.status !== 'active') {
    return false;
  }
  
  // Check if subscription is expired
  if (subscription.current_period_end && subscription.current_period_end < Date.now()) {
    return false;
  }
  
  return true;
}

export async function requireSubscription(request: NextRequest): Promise<NextResponse | { user: any }> {
  const { user, error } = await authenticateRequest(request);
  
  if (!user) {
    return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
  }
  
  const hasSubscription = await checkSubscription(user.id);
  
  if (!hasSubscription) {
    return NextResponse.json({ error: 'Active subscription required' }, { status: 403 });
  }
  
  return { user };
}

