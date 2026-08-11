import { NextResponse } from 'next/server';
import { draftMode } from 'next/headers';
import { safeRedirectPath } from '@/core/security/redirect';

export const dynamic = 'force-dynamic';

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
  return NextResponse.redirect(new URL(path, url.origin), 303);
}
