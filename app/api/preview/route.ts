import { NextResponse } from 'next/server';
import { draftMode } from 'next/headers';
import { requireOwner, UnauthorizedError } from '@/core/auth/guard';
import { safeRedirectPath } from '@/core/security/redirect';

/**
 * Turns preview on.
 *
 * Preview shows unpublished content, so this is an authorization boundary, not
 * a convenience: anyone who can enable it can read every draft on the site.
 * Gated on the owner session rather than a shared preview token — a token in a
 * URL ends up in a browser history, a chat window and an analytics referrer,
 * and cannot be revoked without redeploying.
 *
 * The old preview was an iframe with `?preview=true`, which meant unpublished
 * content was one query parameter away from being public.
 */
export async function GET(req: Request) {
  try {
    await requireOwner();
  } catch (err) {
    const status = err instanceof UnauthorizedError ? 401 : 500;
    return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status });
  }

  const url = new URL(req.url);
  // An attacker-supplied `path` is the classic open redirect. Only same-site
  // paths are honoured; anything else falls back to the homepage.
  const path = safeRedirectPath(url.searchParams.get('path'), '/');

  (await draftMode()).enable();
  // A relative Location, resolved by the browser against the address it used.
  // `url.origin` is the server's own idea of where it is — `localhost` under
  // `next start`, the container's hostname behind a proxy — so an absolute
  // redirect built from it sent the owner to a different host, and inside the
  // admin's preview panel `upgrade-insecure-requests` then turned that into an
  // https request that failed. `safeRedirectPath` guarantees a same-site path.
  return new NextResponse(null, { status: 303, headers: { Location: path } });
}
