import { NextResponse } from 'next/server';
import { requireOwner, UnauthorizedError } from '@/core/auth/guard';
import { vapidConfig } from '@/core/notify/push';

/**
 * The VAPID public key the browser needs to subscribe. Owner-only: it is
 * public in the cryptographic sense, but there is no reason to hand the push
 * setup to strangers, and the route-guard test demands a reason for anything
 * public — this has none.
 */
export async function GET() {
  try {
    await requireOwner();
  } catch (err) {
    const status = err instanceof UnauthorizedError ? 401 : 500;
    return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status });
  }
  const config = vapidConfig();
  if (!config) {
    return NextResponse.json(
      { ok: false, error: 'Push is not set up yet. Add OPB_VAPID_* to the environment first.' },
      { status: 503 }
    );
  }
  return NextResponse.json({ ok: true, publicKey: config.publicKey });
}
