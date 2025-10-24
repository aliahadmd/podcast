const attempts = new Map<string, { count: number; expiresAt: number }>();

export function getClientIdentifier(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for') ||
    'unknown'
  );
}

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const existing = attempts.get(key);

  if (existing && existing.expiresAt > now) {
    if (existing.count >= limit) {
      return false;
    }

    existing.count += 1;
    return true;
  }

  attempts.set(key, { count: 1, expiresAt: now + windowMs });
  return true;
}

