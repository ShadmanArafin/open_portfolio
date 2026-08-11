import { NextResponse } from 'next/server';
import { getStorageAdapter } from '@/core/storage/registry';
import { requireOwner, UnauthorizedError } from '@/core/auth/guard';
import { clientKey, rateLimit } from '@/core/auth/ratelimit';
import { withoutEnquiries } from '@/core/content/sanitise';
import { looksLikeContent } from '@/core/content/validate';

export const dynamic = 'force-dynamic';

/**
 * Saving work without showing it to anyone.
 *
 * The draft channel is what preview reads. Without it, "preview" could only
 * ever mean "the site as published", which is the one thing you never need to
 * preview.
 *
 * Deliberately *not* subject to the contrast gate that publishing runs. A draft
 * with an unreadable palette is a work in progress; refusing to save it would
 * mean losing an afternoon's writing over a colour that was going to be changed
 * anyway. The gate belongs at the moment content becomes public, and that is
 * where it stays.
 */
export async function POST(req: Request) {
  try {
    await requireOwner();
  } catch (err) {
    const status = err instanceof UnauthorizedError ? 401 : 500;
    return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status });
  }

  // Higher than publishing's allowance: this is autosave, not a decision.
  const limit = await rateLimit(`draft:${await clientKey()}`, 600, 60 * 60);
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, error: 'Too many saves.' }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as { content?: unknown } | null;
  if (!looksLikeContent(body?.content)) {
    return NextResponse.json(
      { ok: false, error: 'That does not look like site content.' },
      { status: 400 }
    );
  }

  // Enquiries have their own surface and their own writer. A draft carrying a
  // stale copy of the inbox would resurrect deleted messages the moment it was
  // published.
  await (await getStorageAdapter()).writeSnapshot('draft', withoutEnquiries(body.content));

  return NextResponse.json({ ok: true, savedAt: new Date().toISOString() });
}
