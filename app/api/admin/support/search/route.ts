import { NextResponse } from 'next/server';
import { requireOwner, UnauthorizedError } from '@/core/auth/guard';
import { clientKey, rateLimit } from '@/core/auth/ratelimit';
import { findSimilar } from '@/core/support/search';
import { APP_VERSION } from '@/core/version';

export const dynamic = 'force-dynamic';

/**
 * Looks for reports that already say this.
 *
 * Server-side rather than from the browser, for two reasons: GitHub's search
 * API sends no CORS headers a browser would accept, and doing it here means one
 * shared cache and one rate-limit budget instead of one per person's laptop.
 *
 * Rate limited, and gently. The screen searches as somebody types, so the limit
 * is generous enough to never interrupt real use and low enough that a stuck
 * key cannot spend GitHub's whole allowance for everyone else on this host.
 */
export async function POST(req: Request) {
  try {
    await requireOwner();
  } catch (err) {
    const status = err instanceof UnauthorizedError ? 401 : 500;
    return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status });
  }

  const limit = await rateLimit(`issue-search:${await clientKey()}`, 40, 60 * 5);
  if (!limit.allowed) {
    // Not an error the person needs to act on, and never a reason to stop them
    // filing — so it comes back as a "could not check", same as any other
    // failure to reach GitHub.
    return NextResponse.json({
      ok: true,
      matches: [],
      problem: 'Paused checking for duplicates for a moment. You can still send your report.',
    });
  }

  const body = (await req.json().catch(() => null)) as {
    text?: string;
    kind?: 'bug' | 'feature';
  } | null;

  if (!body?.text || body.text.trim().length < 3) {
    return NextResponse.json({ ok: true, matches: [] });
  }

  const outcome = await findSimilar(
    body.text,
    body.kind === 'feature' ? 'feature' : 'bug',
    APP_VERSION
  );
  return NextResponse.json({ ok: true, ...outcome, currentVersion: APP_VERSION });
}
