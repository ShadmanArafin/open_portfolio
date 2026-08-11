import 'server-only';
import { headers } from 'next/headers';
import { getStorageAdapter } from '@/core/storage/registry';

/**
 * Fixed-window rate limiting.
 *
 * Not a sliding window: on a single-owner portfolio the extra precision buys
 * nothing, and the simple version behaves identically on every backend.
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const adapter = await getStorageAdapter();
  const count = await adapter.kv.incr('ratelimit', key, windowSeconds);
  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    retryAfterSeconds: windowSeconds,
  };
}

/**
 * A best-effort client identifier.
 *
 * Spoofable behind a proxy that does not set these headers, so it is one layer
 * among several rather than the only thing between an attacker and the login
 * form.
 */
export async function clientKey(): Promise<string> {
  const h = await headers();
  const forwarded = h.get('x-forwarded-for');
  return (forwarded?.split(',')[0].trim() || h.get('x-real-ip') || 'unknown').slice(0, 64);
}
