import { NextResponse } from 'next/server';
import type { RegistrationResponseJSON } from '@simplewebauthn/server';
import { requireOwner, UnauthorizedError } from '@/core/auth/guard';
import { clientKey, rateLimit } from '@/core/auth/ratelimit';
import { finishPasskeyRegistration, relyingParty } from '@/core/auth/passkey';

/**
 * Completes enrollment: verifies the attestation and stores the credential.
 *
 * Owner-only like the start. The request body is the browser's ceremony
 * output plus an optional human label — both validated, the credential id
 * matched against the burned challenge before anything is written.
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

  const body = (await req.json().catch(() => null)) as {
    challengeId?: unknown;
    response?: unknown;
    deviceName?: unknown;
  } | null;
  if (
    typeof body?.challengeId !== 'string' ||
    !body.response ||
    typeof body.response !== 'object'
  ) {
    return NextResponse.json(
      { ok: false, error: 'That enrollment is incomplete.' },
      { status: 400 }
    );
  }

  const result = await finishPasskeyRegistration(
    email,
    body.challengeId,
    body.response as RegistrationResponseJSON,
    relyingParty(req),
    typeof body.deviceName === 'string' ? body.deviceName : undefined
  );
  if (!result.ok) return NextResponse.json(result, { status: 400 });
  return NextResponse.json(result);
}
