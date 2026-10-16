import { NextResponse } from 'next/server';
import { turnstileSiteKey } from '@/core/integrations/turnstile';

/**
 * The Turnstile site key for the browser widget.
 *
 * Public by design — a site key belongs in page HTML the way a lock belongs
 * on a door, visible and useless without the secret, which never leaves the
 * server. A 404 here means bot protection is simply off and the forms fall
 * back to the honeypot; the widget renders nothing in that case rather than
 * an error.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  const siteKey = await turnstileSiteKey();
  if (!siteKey) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, siteKey });
}
