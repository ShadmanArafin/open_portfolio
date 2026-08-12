import { NextResponse } from 'next/server';
import { clientKey, rateLimit } from '@/core/auth/ratelimit';
import { unsubscribe } from '@/core/newsletter/store';

export const dynamic = 'force-dynamic';

/**
 * Leaving.
 *
 * Deliberately **not** origin-checked, which is the one place in this codebase
 * that rule is relaxed. RFC 8058 one-click unsubscribe is a POST issued by the
 * recipient's mail provider — Gmail, Outlook, Apple Mail — with no `Origin` of
 * ours, and rejecting it is how a mail client's unsubscribe button ends up
 * doing nothing. The token *is* the credential.
 *
 * The risk that trade buys is a cross-site request that unsubscribes somebody,
 * which requires already knowing their 256-bit token, and whose worst outcome
 * is that a person stops receiving email they can sign up for again. Weighed
 * against an unsubscribe button that silently fails, this is not close.
 *
 * The token is read from the query string as well as the body because that is
 * what providers send.
 */
async function handle(req: Request): Promise<NextResponse> {
  const limit = await rateLimit(`newsletter-unsub:${await clientKey()}`, 30, 60 * 60);
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, error: 'Too many attempts.' }, { status: 429 });
  }

  const url = new URL(req.url);
  let token = url.searchParams.get('token') ?? '';

  if (!token) {
    const type = req.headers.get('content-type') ?? '';
    if (type.includes('application/json')) {
      const body = (await req.json().catch(() => null)) as { token?: unknown } | null;
      if (typeof body?.token === 'string') token = body.token;
    } else if (type.includes('form')) {
      const form = await req.formData().catch(() => null);
      const value = form?.get('token');
      if (typeof value === 'string') token = value;
    }
  }

  const result = await unsubscribe(token.slice(0, 200));
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}

export async function POST(req: Request) {
  return handle(req);
}
