import { NextResponse } from 'next/server';
import { assertSameOrigin } from '@/core/auth/guard';
import { clientKey, rateLimit } from '@/core/auth/ratelimit';
import { relyingParty, startPasskeyLogin } from '@/core/auth/passkey';

export const dynamic = 'force-dynamic';

/**
 * Begins a passkey sign-in. Public — signing in cannot require being signed in.
 *
 * When no passkey is enrolled the answer says exactly that, so the login page
 * can fall back to the passphrase form instead of stranding its only visitor.
 */
export async function POST(req: Request) {
  try {
    await assertSameOrigin();
  } catch {
    return NextResponse.json({ ok: false, error: 'Request rejected.' }, { status: 403 });
  }

  const limit = await rateLimit(`passkey-login:${await clientKey()}`, 10, 15 * 60);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many sign-in attempts. Try again in 15 minutes.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    );
  }

  const started = await startPasskeyLogin(relyingParty(req).rpID);
  if (!started.ok) return NextResponse.json(started, { status: 400 });
  return NextResponse.json({ ok: true, ...started.start });
}
