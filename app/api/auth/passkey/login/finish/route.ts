import { NextResponse } from 'next/server';
import type { AuthenticationResponseJSON } from '@simplewebauthn/server';
import { assertSameOrigin } from '@/core/auth/guard';
import { clientKey, rateLimit } from '@/core/auth/ratelimit';
import { createSession } from '@/core/auth/session';
import { getStorageAdapter } from '@/core/storage/registry';
import { finishPasskeyLogin, relyingParty } from '@/core/auth/passkey';

/**
 * Completes a passkey sign-in and mints the session.
 *
 * Every failure reads identically — unknown credential, bad signature,
 * expired challenge, suspected clone — so the endpoint cannot be used to ask
 * which credentials are enrolled here.
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

  const body = (await req.json().catch(() => null)) as {
    challengeId?: unknown;
    response?: unknown;
  } | null;
  if (
    typeof body?.challengeId !== 'string' ||
    !body.response ||
    typeof body.response !== 'object'
  ) {
    return NextResponse.json(
      { ok: false, error: 'That passkey did not work. Try again or use your passphrase.' },
      { status: 401 }
    );
  }

  const result = await finishPasskeyLogin(
    body.challengeId,
    body.response as AuthenticationResponseJSON,
    relyingParty(req)
  );
  if (!result.ok) return NextResponse.json(result, { status: 401 });

  const owner = await (await getStorageAdapter()).readOwner();
  if (!owner || owner.email !== result.email) {
    return NextResponse.json(
      { ok: false, error: 'That passkey did not work. Try again or use your passphrase.' },
      { status: 401 }
    );
  }
  await createSession(owner.email, owner.sessionEpoch);
  return NextResponse.json({ ok: true });
}
