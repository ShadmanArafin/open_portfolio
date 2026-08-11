import { demoRestrictionMessage, isDemoMode } from '@/core/demo/config';
import { NextResponse } from 'next/server';
import { getStorageAdapter } from '@/core/storage/registry';
import { assertSameOrigin, requireOwner, UnauthorizedError } from '@/core/auth/guard';
import { clientKey, rateLimit } from '@/core/auth/ratelimit';
import { makeMediaKey, UploadRejected, validateUpload } from '@/core/media/validate';

export const dynamic = 'force-dynamic';

/**
 * Uploads, at last on the server.
 *
 * Until now `uploadMedia` put the bytes in the editor's own IndexedDB and wrote
 * an `idb:<id>` reference into the content. Publishing then sent that reference
 * to the server, where it means nothing — so every visitor received a 1x1
 * transparent GIF in place of the image, silently, while the owner's own
 * browser still rendered it perfectly from the local blob. This route is what
 * makes an uploaded image something other people can see.
 *
 * Owner-only, and the check lives in this handler rather than in middleware or
 * a layout, because a route handler is a public HTTP endpoint regardless of
 * what rendered the form that calls it.
 */

/** A conservative floor, so a backend reporting something absurd cannot widen it. */
const HARD_MAX_BYTES = 25 * 1024 * 1024;

async function guard(): Promise<NextResponse | null> {
  try {
    await assertSameOrigin();
  } catch {
    return NextResponse.json({ ok: false, error: 'Request rejected.' }, { status: 403 });
  }

  try {
    await requireOwner();
  } catch (err) {
    const status = err instanceof UnauthorizedError ? 401 : 500;
    return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status });
  }

  return null;
}

export async function POST(req: Request) {
  // Switched off in the demo. Enforced here rather than hidden in the UI: a
  // disabled button is a suggestion, and this endpoint is reachable without it.
  if (isDemoMode()) {
    return NextResponse.json(
      { ok: false, error: demoRestrictionMessage('uploads') },
      { status: 403 }
    );
  }

  const rejected = await guard();
  if (rejected) return rejected;

  const limit = await rateLimit(`upload:${await clientKey()}`, 120, 60 * 60);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many uploads. Try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    );
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'No file was sent.' }, { status: 400 });
  }

  const adapter = await getStorageAdapter();
  const maxBytes = Math.min(adapter.capabilities.maxUploadBytes, HARD_MAX_BYTES);

  let validated;
  try {
    validated = validateUpload(new Uint8Array(await file.arrayBuffer()), file.name, maxBytes);
  } catch (err) {
    if (err instanceof UploadRejected) {
      return NextResponse.json({ ok: false, error: err.message }, { status: err.status });
    }
    throw err;
  }

  const key = makeMediaKey(file.name, validated.extension);

  try {
    const record = await adapter.media.put(key, validated.bytes, validated.mimeType);

    // The app's own URL, not the backend's. Content that hardcoded
    // `https://<project>.supabase.co/...` would break every image the day
    // someone moved to another backend; `/api/media/<key>` redirects to
    // whichever store is configured now.
    return NextResponse.json({
      ok: true,
      media: {
        key: record.key,
        url: `/api/media/${encodeURIComponent(record.key)}`,
        mimeType: record.mimeType,
        sizeBytes: record.sizeBytes,
        uploadedAt: record.uploadedAt,
      },
    });
  } catch (err) {
    console.error('[media] Upload failed.', err);
    return NextResponse.json(
      { ok: false, error: 'Your storage backend refused the upload. Check its configuration.' },
      { status: 502 }
    );
  }
}

export async function DELETE(req: Request) {
  const rejected = await guard();
  if (rejected) return rejected;

  const key = new URL(req.url).searchParams.get('key');
  if (!key) {
    return NextResponse.json({ ok: false, error: 'No key was given.' }, { status: 400 });
  }

  try {
    await (await getStorageAdapter()).media.remove(key);
  } catch (err) {
    console.error('[media] Delete failed.', err);
    return NextResponse.json(
      { ok: false, error: 'Your storage backend refused the delete.' },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
