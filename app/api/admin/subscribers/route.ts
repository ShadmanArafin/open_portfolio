import { NextResponse } from 'next/server';
import { requireOwner, UnauthorizedError } from '@/core/auth/guard';
import { listSubscribers, sweepStalePending } from '@/core/newsletter/store';
import { toCsv } from '@/core/newsletter/schema';
import { getStorageAdapter } from '@/core/storage/registry';
import { resolveTransportWithStored } from '@/core/email/transport';

export const dynamic = 'force-dynamic';

/**
 * The list.
 *
 * Owner-only, and the check is here rather than in a layout because a route
 * handler is a public HTTP endpoint whatever rendered the screen that calls it.
 *
 * The subscribers never travel with the content document — they are not in the
 * published snapshot, not in an export, and not serialised into any page — so
 * this is the only way they are ever read, and it is one that requires a
 * session.
 */
async function guard(): Promise<NextResponse | null> {
  try {
    await requireOwner();
    return null;
  } catch (err) {
    const status = err instanceof UnauthorizedError ? 401 : 500;
    return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status });
  }
}

export async function GET(req: Request) {
  const denied = await guard();
  if (denied) return denied;

  const subscribers = await listSubscribers();

  if (new URL(req.url).searchParams.get('format') === 'csv') {
    // Confirmed addresses only — see `toCsv`. Downloading the pending ones
    // would hand somebody a file of people who have not consented, one import
    // away from being mailed.
    return new NextResponse(toCsv(subscribers), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="subscribers.csv"',
        // Never cached anywhere. A list of email addresses behind a shared
        // cache is a list of email addresses without a session check.
        'Cache-Control': 'no-store, private',
      },
    });
  }

  void sweepStalePending().catch(() => {});

  return NextResponse.json({
    ok: true,
    // Tokens are hashes, not tokens, but there is still no reason for the
    // browser to hold them: nothing on the screen uses either one.
    subscribers: subscribers.map(
      ({ confirmTokenHash: _c, unsubscribeTokenHash: _u, ...rest }) => rest
    ),
    emailConfigured: (await resolveTransportWithStored()).kind !== 'none',
  });
}

/**
 * Removing somebody by hand.
 *
 * A real request people make — "take me off, I mailed you about it" — and the
 * owner should be able to honour it in one click rather than by editing a file
 * on a server.
 */
export async function DELETE(req: Request) {
  const denied = await guard();
  if (denied) return denied;

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ ok: false, error: 'Which one?' }, { status: 400 });

  await (await getStorageAdapter()).subscribers.remove(id);
  return NextResponse.json({ ok: true });
}
