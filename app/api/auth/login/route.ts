import { NextResponse } from 'next/server';
import { getStorageAdapter } from '@/core/storage/registry';
import { verifyPassphrase } from '@/core/auth/passphrase';
import { createSession } from '@/core/auth/session';
import { assertSameOrigin } from '@/core/auth/guard';
import { clientKey, rateLimit } from '@/core/auth/ratelimit';

export const dynamic = 'force-dynamic';

/** A well-formed hash of nothing, used to keep the timing of a miss honest. */
const DUMMY_HASH = 'scrypt$65536$8$1$YWFhYWFhYWFhYWFhYWFhYQ==$YWFhYWFhYWFhYWFhYWFhYQ==';

export async function POST(req: Request) {
  try {
    await assertSameOrigin();
  } catch {
    return NextResponse.json({ ok: false, error: 'Request rejected.' }, { status: 403 });
  }

  const limit = await rateLimit(`login:${await clientKey()}`, 10, 15 * 60);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many sign-in attempts. Try again in 15 minutes.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    );
  }

  const body = (await req.json().catch(() => null)) as Record<string, string> | null;
  const email = (body?.email ?? '').trim().toLowerCase();
  const passphrase = body?.passphrase ?? '';

  const owner = await getStorageAdapter().readOwner();

  // One message for every kind of failure, and the passphrase is verified even
  // when there is no owner, so neither the wording nor the response time
  // reveals whether an account exists.
  const generic = { ok: false as const, error: 'That email or passphrase is not right.' };

  if (!owner) {
    await verifyPassphrase(passphrase, DUMMY_HASH);
    return NextResponse.json(generic, { status: 401 });
  }

  const passphraseOk = await verifyPassphrase(passphrase, owner.passphraseHash);
  if (!passphraseOk || email !== owner.email) {
    return NextResponse.json(generic, { status: 401 });
  }

  await createSession(owner.email, owner.sessionEpoch);
  return NextResponse.json({ ok: true });
}
