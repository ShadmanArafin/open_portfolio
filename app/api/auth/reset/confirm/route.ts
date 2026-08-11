import { NextResponse } from 'next/server';
import { getStorageAdapter } from '@/core/storage/registry';
import { assertSameOrigin } from '@/core/auth/guard';
import { clientKey, rateLimit } from '@/core/auth/ratelimit';
import { consumeResetToken } from '@/core/auth/reset';
import { checkPassphraseStrength, hashPassphrase } from '@/core/auth/passphrase';
import { createSession } from '@/core/auth/session';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    await assertSameOrigin();
  } catch {
    return NextResponse.json({ ok: false, error: 'Request rejected.' }, { status: 403 });
  }

  const limit = await rateLimit(`reset-confirm:${await clientKey()}`, 10, 60 * 60);
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, error: 'Too many attempts.' }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as {
    token?: string;
    passphrase?: string;
  } | null;
  const token = body?.token ?? '';
  const passphrase = body?.passphrase ?? '';

  const strength = checkPassphraseStrength(passphrase);
  if (!strength.ok) {
    return NextResponse.json({ ok: false, error: strength.reason }, { status: 400 });
  }

  const email = await consumeResetToken(token);
  if (!email) {
    return NextResponse.json(
      { ok: false, error: 'That link has expired or has already been used.' },
      { status: 400 }
    );
  }

  const adapter = getStorageAdapter();
  const owner = await adapter.readOwner();
  if (!owner) {
    return NextResponse.json({ ok: false, error: 'This site has no owner.' }, { status: 400 });
  }

  // Bumping the epoch signs out everywhere. Without it, whoever forced the
  // reset keeps any session they already held, which defeats resetting.
  const epoch = owner.sessionEpoch + 1;
  await adapter.writeOwner({
    ...owner,
    passphraseHash: await hashPassphrase(passphrase),
    sessionEpoch: epoch,
  });

  await createSession(owner.email, epoch);
  return NextResponse.json({ ok: true });
}
