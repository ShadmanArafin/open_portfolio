import { NextResponse } from 'next/server';
import { requireOwner, UnauthorizedError } from '@/core/auth/guard';
import { sendTestPush } from '@/core/notify/push';

/**
 * One buzz on demand, from the inbox. Bypasses the burst cap — an explicit
 * test is the owner asking, not a burst — but reports rather than throws: a
 * failed test is information, not an error.
 */
export async function POST() {
  try {
    await requireOwner();
  } catch (err) {
    const status = err instanceof UnauthorizedError ? 401 : 500;
    return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status });
  }
  const result = await sendTestPush();
  if (result.skipped === 'not-configured') {
    return NextResponse.json(
      { ok: false, error: 'Push is not set up yet. Add OPB_VAPID_* to the environment first.' },
      { status: 503 }
    );
  }
  if (result.skipped === 'no-subscriptions') {
    return NextResponse.json(
      { ok: false, error: 'This device is not subscribed yet. Enable notifications first.' },
      { status: 409 }
    );
  }
  return NextResponse.json({ ok: result.delivered > 0, ...result });
}
