import { NextResponse } from 'next/server';
import { requireOwner, UnauthorizedError } from '@/core/auth/guard';
import { clientKey, rateLimit } from '@/core/auth/ratelimit';
import { relyingParty, startPasskeyRegistration } from '@/core/auth/passkey';

/**
 * Begins enrolling this device as a passkey.
 *
 * Owner-only: a passkey signs in as the owner, so only a signed-in owner may
 * mint the challenge that creates one. The challenge is single-use and
 * five-minute-lived; the ceremony it starts is verified in `register/finish`.
 */
export async function POST(req: Request) {
  let email: string;
  try {
    ({ email } = await requireOwner());
  } catch (err) {
    const status = err instanceof UnauthorizedError ? 401 : 500;
    return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status });
  }

  const limit = await rateLimit(`passkey-reg:${await clientKey()}`, 20, 10 * 60);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many attempts. Wait a few minutes.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    );
  }

  const { rpID } = relyingParty(req);
  const { options, challengeId } = await startPasskeyRegistration(email, rpID);
  return NextResponse.json({ ok: true, options, challengeId });
}
