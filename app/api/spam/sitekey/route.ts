import { NextResponse } from 'next/server';
import { turnstileSiteKey } from '@/core/integrations/turnstile';

/**
 * The Turnstile site key for the browser widget.
 *
 * Public by design — a site key belongs in page HTML the way a lock belongs
 * on a door, visible and useless without the secret, which never leaves the
 * server. `siteKey: null` means bot protection is simply off and the forms
 * fall back to the honeypot; the widget renders nothing in that case.
 *
 * That answer used to be a 404, which every browser logs as a red console
 * error — on every page with a form, on every site that had not set Turnstile
 * up, which is most of them. "Off" is a normal answer, so it is a 200.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  const siteKey = await turnstileSiteKey();
  return NextResponse.json({ ok: true, siteKey: siteKey || null });
}
