import { NextResponse } from 'next/server';
import { draftMode } from 'next/headers';
import { safeRedirectPath } from '@/core/security/redirect';

/**
 * Turns preview off.
 *
 * Deliberately not owner-gated, and listed as such in the route-guard test.
 * Turning your own preview off grants nothing and reveals nothing — the worst
 * an unauthenticated caller achieves is clearing a cookie they do not have.
 * Requiring a session here would mean an expired session leaves someone stuck
 * in preview with no way out, which is a worse outcome than the non-threat.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const path = safeRedirectPath(url.searchParams.get('path'), '/');

  (await draftMode()).disable();
  // A relative Location, resolved by the browser against the address it used.
  // `url.origin` is the server's own idea of where it is — `localhost` under
  // `next start`, the container's hostname behind a proxy — so an absolute
  // redirect built from it sent the owner to a different host, and inside the
  // admin's preview panel `upgrade-insecure-requests` then turned that into an
  // https request that failed. `safeRedirectPath` guarantees a same-site path.
  return new NextResponse(null, { status: 303, headers: { Location: path } });
}
