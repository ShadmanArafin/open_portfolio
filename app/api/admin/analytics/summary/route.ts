import { NextResponse } from 'next/server';
import { requireOwner, UnauthorizedError } from '@/core/auth/guard';
import { audienceSummary } from '@/core/integrations/stats';

/**
 * View counts for the dashboard.
 *
 * Owner-only, and the check lives here rather than in a layout, because a route
 * handler is a public HTTP endpoint no matter what rendered the screen calling
 * it. Answers null — not an error — when there is nothing useful to say: no
 * provider, no API key, or an unreachable host are all ordinary states, and
 * the dashboard shows the enquiry half in all of them.
 */
export async function GET() {
  try {
    await requireOwner();
  } catch (err) {
    const status = err instanceof UnauthorizedError ? 401 : 500;
    return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status });
  }

  return NextResponse.json({ ok: true, summary: await audienceSummary() });
}
