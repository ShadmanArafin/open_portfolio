import { NextResponse } from 'next/server';
import { getStorageAdapter } from '@/core/storage/registry';
import { requireOwner, UnauthorizedError } from '@/core/auth/guard';
import { clientKey, rateLimit } from '@/core/auth/ratelimit';
import { resolveTransportWithStored } from '@/core/email/transport';

/**
 * The inbox.
 *
 * Owner-only, and the check lives here rather than in a layout, because a route
 * handler is a public HTTP endpoint no matter what rendered the screen calling
 * it.
 *
 * `emailConfigured` rides along so the admin can say "nothing tells you when an
 * enquiry arrives" without a second round trip, and without the browser ever
 * seeing the mail credentials that answer the question.
 */
export async function GET() {
  try {
    await requireOwner();
  } catch (err) {
    const status = err instanceof UnauthorizedError ? 401 : 500;
    return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status });
  }

  const limit = await rateLimit(`messages:${await clientKey()}`, 120, 60);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    );
  }

  try {
    const adapter = await getStorageAdapter();
    const messages = await adapter.messages.list();
    const transport = await resolveTransportWithStored();
    return NextResponse.json({
      ok: true,
      messages,
      emailConfigured: transport.kind !== 'none',
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'Could not load messages.' }, { status: 500 });
  }
}
