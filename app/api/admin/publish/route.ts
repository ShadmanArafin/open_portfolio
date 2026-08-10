import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getStorageAdapter } from '@/core/storage/registry';
import { requireOwner, UnauthorizedError } from '@/core/auth/guard';
import { clientKey, rateLimit } from '@/core/auth/ratelimit';
import type { CMSState } from '@/cms/types/cms';

export const dynamic = 'force-dynamic';

/**
 * Publishing, at last.
 *
 * Until now "Publish" only moved content between two copies inside the
 * editor's own browser, so a visitor never saw any of it. This writes the
 * published snapshot to the server's store and clears the cached pages, which
 * is what makes the button mean what it says.
 *
 * Owner-only, and the check lives in this handler rather than in middleware or
 * a layout — a route handler is a public HTTP endpoint no matter what rendered
 * the button that calls it.
 */

/** Cheap structural check. Enough to reject nonsense without a schema library. */
function looksLikeContent(value: unknown): value is CMSState {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<CMSState>;
  return (
    typeof v.settings === 'object' &&
    typeof v.seo === 'object' &&
    Array.isArray(v.projects) &&
    Array.isArray(v.sections)
  );
}

export async function POST(req: Request) {
  try {
    await requireOwner();
  } catch (err) {
    const status = err instanceof UnauthorizedError ? 401 : 500;
    return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status });
  }

  const limit = await rateLimit(`publish:${await clientKey()}`, 60, 60 * 60);
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, error: 'Too many publishes.' }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as { content?: unknown } | null;
  if (!looksLikeContent(body?.content)) {
    return NextResponse.json(
      { ok: false, error: 'That does not look like site content.' },
      { status: 400 }
    );
  }

  const content = body.content;

  // Messages belong to the server, not to whatever the browser happens to be
  // holding. Overwriting them with the editor's copy would erase enquiries that
  // arrived while the tab was open.
  const adapter = getStorageAdapter();
  const existing = await adapter.readSnapshot('published');
  const merged: CMSState = { ...content, messages: existing?.messages ?? content.messages ?? [] };

  await adapter.writeSnapshot('published', merged);

  // Drop the cached renders so the change is live immediately rather than
  // whenever the revalidation window happens to lapse.
  revalidatePath('/', 'layout');

  return NextResponse.json({ ok: true, publishedAt: new Date().toISOString() });
}
