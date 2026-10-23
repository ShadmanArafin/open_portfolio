import { NextResponse } from 'next/server';
import { assertSameOrigin } from '@/core/auth/guard';
import { clientKey, rateLimit } from '@/core/auth/ratelimit';
import { relyingParty, startPasskeyLogin } from '@/core/auth/passkey';

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

  // The login page asks for an autofill challenge on every load, so it gets
  // a bucket of its own: reloading the page must not use up the attempts a
  // deliberate "Sign in with a passkey" press needs.
  const body = (await req.json().catch(() => null)) as { autofill?: unknown } | null;
  const bucket = body?.autofill === true ? 'passkey-autofill' : 'passkey-login';
  const limit = await rateLimit(
    `${bucket}:${await clientKey()}`,
    bucket === 'passkey-autofill' ? 30 : 10,
    15 * 60
  );
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many sign-in attempts. Try again in 15 minutes.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    );
  }

  const started = await startPasskeyLogin(relyingParty(req).rpID);
  // The autofill request is speculative — the page asks before anyone has
  // chosen passkeys — so "none enrolled" is an answer, not a failure.
  if (!started.ok) {
    return NextResponse.json(started, { status: bucket === 'passkey-autofill' ? 200 : 400 });
  }
  return NextResponse.json({ ok: true, ...started.start });
}
