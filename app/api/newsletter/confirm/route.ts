import { NextResponse } from 'next/server';
import { assertSameOrigin } from '@/core/auth/guard';
import { clientKey, rateLimit } from '@/core/auth/ratelimit';
import { confirm } from '@/core/newsletter/store';

export const dynamic = 'force-dynamic';

/**
 * Completing a sign-up.
 *
 * **POST, from a button on a page — not the link in the email itself.** A
 * confirmation that happens on `GET` is confirmed by every link-scanning proxy
 * and safe-preview service that opens the mail before its recipient does, which
 * quietly turns double opt-in back into single opt-in without anybody
 * noticing. The link in the email opens a page; the page asks; the answer is
 * this request.
 */
export async function POST(req: Request) {
  try {
    await assertSameOrigin();
  } catch {
    return NextResponse.json({ ok: false, error: 'Request rejected.' }, { status: 403 });
  }

  // Bounds guessing. The token is 256 bits, so this is not what stops a brute
  // force — it stops somebody using the endpoint as a free oracle.
  const limit = await rateLimit(`newsletter-confirm:${await clientKey()}`, 20, 60 * 60);
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, error: 'Too many attempts.' }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as { token?: unknown } | null;
  const token = typeof body?.token === 'string' ? body.token.slice(0, 200) : '';

  const result = await confirm(token);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
