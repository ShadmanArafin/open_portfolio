import { NextResponse } from 'next/server';
import { requireOwner, UnauthorizedError } from '@/core/auth/guard';
import { clientKey, rateLimit } from '@/core/auth/ratelimit';
import { getStorageAdapter } from '@/core/storage/registry';

/**
 * Removes one enrolled passkey.
 *
 * Owner-only. Removing the last credential is allowed — the passphrase (and
 * email codes, when mail is configured) remain — because a lockout help page
 * that can strand its only reader is worse than an account with one fewer
 * factor. The settings screen says exactly that before confirming.
 */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireOwner();
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

  const { id } = await params;
  if (!id) return NextResponse.json({ ok: false, error: 'Which one?' }, { status: 400 });
  await (await getStorageAdapter()).passkeys.remove(decodeURIComponent(id));
  return NextResponse.json({ ok: true });
}
