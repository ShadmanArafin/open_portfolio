import { NextResponse } from 'next/server';
import { assertSameOrigin } from '@/core/auth/guard';
import { clientKey, rateLimit } from '@/core/auth/ratelimit';
import { verifyEmailCode } from '@/core/auth/otp';
import { createSession } from '@/core/auth/session';
import { getStorageAdapter } from '@/core/storage/registry';
import { MAX_EMAIL_LENGTH } from '@/core/email/send';

export const dynamic = 'force-dynamic';

/**
 * Trades a one-time code for a session.
 *
 * One message for every failure — unknown address, expired code, wrong digits,
 * exhausted attempts — so neither the wording nor the timing reveals whether
 * the address owns this site. A correct code mints the same session a
 * passphrase or a passkey would.
 */
export async function POST(req: Request) {
  try {
    await assertSameOrigin();
  } catch {
    return NextResponse.json({ ok: false, error: 'Request rejected.' }, { status: 403 });
  }

  const limit = await rateLimit(`otp-verify:${await clientKey()}`, 10, 60 * 60);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many attempts. Request a fresh code and try again.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    );
  }

  const body = (await req.json().catch(() => null)) as {
    email?: unknown;
    code?: unknown;
  } | null;
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const code = typeof body?.code === 'string' ? body.code : '';

  const generic = { ok: false as const, error: 'That code is not right. Request a fresh one.' };
  if (!email || email.length > MAX_EMAIL_LENGTH || !code) {
    return NextResponse.json(generic, { status: 401 });
  }

  if (!(await verifyEmailCode(email, code))) {
    return NextResponse.json(generic, { status: 401 });
  }

  const owner = await (await getStorageAdapter()).readOwner();
  if (!owner || owner.email !== email) {
    return NextResponse.json(generic, { status: 401 });
  }
  await createSession(owner.email, owner.sessionEpoch);
  return NextResponse.json({ ok: true });
}
