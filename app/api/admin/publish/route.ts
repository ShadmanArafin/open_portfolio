import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getStorageAdapter } from '@/core/storage/registry';
import { requireOwner, UnauthorizedError } from '@/core/auth/guard';
import { clientKey, rateLimit } from '@/core/auth/ratelimit';
import { withoutEnquiries } from '@/core/content/sanitise';
import { auditContrast, describeFailure } from '@/core/theme/audit';
import { flattenAppearance } from '@/core/theme/resolve';
import { looksLikeContent } from '@/core/content/validate';
import { RevisionConflictError } from '@/core/storage/contract';

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

  const body = (await req.json().catch(() => null)) as {
    content?: unknown;
    expectedRevision?: number;
  } | null;
  if (!looksLikeContent(body?.content)) {
    return NextResponse.json(
      { ok: false, error: 'That does not look like site content.' },
      { status: 400 }
    );
  }

  // Refuse a palette nobody could read. Enforced here rather than only in the
  // dashboard because the dashboard is advice and this is the boundary: a
  // client that skips the warning, or a direct call to this endpoint, must not
  // be able to put unreadable text in front of visitors.
  //
  // Scoped to contrast on purpose. The health report marks other things
  // "blocking" that are judgement calls — an unpublished draft project is the
  // owner's business — and refusing every one of them would make publishing
  // feel broken rather than careful.
  // Flattened first: with a theme selected, the stored appearance is mostly
  // empty overrides, and auditing those would check colours nobody will see.
  const contrast = auditContrast(flattenAppearance(body.content.appearance));
  if (!contrast.passes) {
    return NextResponse.json(
      {
        ok: false,
        error: describeFailure(contrast.failures[0]),
        failures: contrast.failures,
      },
      { status: 422 }
    );
  }

  // Enquiries live on their own surface now. Publishing must not carry them:
  // the editor's copy is a stale read, and writing it back would resurrect
  // deleted enquiries and lose any that arrived while the tab was open. It
  // would also publish them — this snapshot ends up in the HTML of every public
  // page — which is why the version snapshots inside it are stripped here too
  // rather than trusted to have arrived clean.
  const merged = withoutEnquiries(body.content);

  const adapter = await getStorageAdapter();

  let revision: number;
  try {
    // `expectedRevision` is optional here, unlike autosave. Publishing is a
    // deliberate act on content the person is looking at, and an editor that
    // knows what it last saw should say so — but a client that does not is
    // making a considered choice to overwrite, not an accident.
    revision = await adapter.writeSnapshot('published', merged, body.expectedRevision);
  } catch (err) {
    if (!(err instanceof RevisionConflictError)) throw err;
    const current = await adapter.readSnapshotMeta('published');
    return NextResponse.json(
      {
        ok: false,
        error: err.message,
        conflict: { expected: err.expected, current: err.current, content: current?.state ?? null },
      },
      { status: 409 }
    );
  }

  // Drop the cached renders so the change is live immediately rather than
  // whenever the revalidation window happens to lapse.
  revalidatePath('/', 'layout');

  return NextResponse.json({ ok: true, revision, publishedAt: new Date().toISOString() });
}
