'use server';

import { revalidatePath } from 'next/cache';
import { demoRestrictionMessage, isDemoMode } from '@/core/demo/config';
import { requireOwner } from '@/core/auth/guard';
import { clientKey, rateLimit } from '@/core/auth/ratelimit';
import { makeMediaKey, UploadRejected, validateUpload } from '@/core/media/validate';
import { storeVariants, variantKey } from '@/core/media/variants';
import { getStorageAdapter } from '@/core/storage/registry';
import { RevisionConflictError } from '@/core/storage/contract';
import { conflictMessage } from '@/core/content/changes';
import type { CMSState, MediaItem } from '@/cms/types/cms';
import { readDraftForWrite } from '@/core/content/draft';

export interface MediaResult {
  ok: boolean;
  error?: string;
  conflict?: boolean;
  item?: MediaItem;
  warning?: string;
}

/**
 * The media library's writes, as server actions.
 *
 * Same shape as the rest of the admin — read the draft, mutate, write it back
 * revision-checked — with one deliberate difference: an upload or a delete is
 * retried once against the freshly-read draft when the revision has moved.
 * Both mutations are idempotent (append-if-absent, remove-if-present), so the
 * retry cannot double-apply anything. Refusing instead would mean one save in
 * another tab loses a file the storage backend has already accepted, or leaves
 * a delete that visibly did nothing.
 */

/** A conservative floor, so a backend reporting something absurd cannot widen it. */
const HARD_MAX_BYTES = 25 * 1024 * 1024;

async function writeDraft(
  mutate: (draft: CMSState) => void,
  mayRetry = true
): Promise<'ok' | { conflict: string }> {
  const adapter = await getStorageAdapter();
  const meta = await readDraftForWrite(adapter);

  const next = structuredClone(meta.state as CMSState);
  mutate(next);

  try {
    await adapter.writeSnapshot('draft', next, meta.revision);
    return 'ok';
  } catch (err) {
    if (err instanceof RevisionConflictError) {
      // Once, quietly: a race is safe to replay — `mutate` is a small edit
      // applied to the fresh draft, not a whole document from a form.
      if (mayRetry) return writeDraft(mutate, false);
      const fresh = await adapter.readSnapshotMeta('draft');
      return { conflict: conflictMessage(err, fresh?.state ?? null, next, 'Saving') };
    }
    throw err;
  }
}

export async function uploadMediaAction(form: FormData): Promise<MediaResult> {
  await requireOwner();

  // Switched off in the demo, like the HTTP endpoint: a disabled button is a
  // suggestion, and a server action is an endpoint.
  if (isDemoMode()) return { ok: false, error: demoRestrictionMessage('uploads') };

  // The same budget as `POST /api/admin/media`, sharing the key, so the two
  // paths cannot double it.
  const limit = await rateLimit(`upload:${await clientKey()}`, 120, 60 * 60);
  if (!limit.allowed) return { ok: false, error: 'Too many uploads. Try again shortly.' };

  const file = form.get('file');
  if (!(file instanceof File)) return { ok: false, error: 'No file was sent.' };

  const adapter = await getStorageAdapter();
  const maxBytes = Math.min(adapter.capabilities.maxUploadBytes, HARD_MAX_BYTES);

  let validated;
  try {
    validated = validateUpload(new Uint8Array(await file.arrayBuffer()), file.name, maxBytes);
  } catch (err) {
    if (err instanceof UploadRejected) return { ok: false, error: err.message };
    throw err;
  }

  const key = makeMediaKey(file.name, validated.extension);

  // Bytes first, record second: a failure after this point orphans an
  // unreferenced file, which is recoverable; the reverse order would leave the
  // library pointing at a file that was never written.
  let stored;
  try {
    stored = await adapter.media.put(key, validated.bytes, validated.mimeType);
  } catch (err) {
    console.error('[media] Upload failed.', err);
    return {
      ok: false,
      error: 'Your storage backend refused the upload. Check its configuration.',
    };
  }

  // Smaller copies for phones, beside the original. Best-effort: none is fine.
  const variants = await storeVariants(adapter.media, key, validated.bytes, validated.mimeType);

  const name = file.name.slice(0, 300);
  const typedAlt = form.get('altText');
  const dimensions = form.get('dimensions');

  const item: MediaItem = {
    id: key,
    name,
    // The app's own URL, not the backend's — `/api/media/<key>` redirects to
    // whichever store is configured now.
    url: `/api/media/${encodeURIComponent(key)}`,
    type: validated.mimeType === 'application/pdf' ? 'pdf' : 'image',
    sizeBytes: stored.sizeBytes,
    ...(typeof dimensions === 'string' && /^[0-9]{2,5}x[0-9]{2,5}$/.test(dimensions)
      ? { dimensions }
      : {}),
    ...(variants.length > 0 ? { variants } : {}),
    uploadedAt: (stored.uploadedAt || new Date().toISOString()).slice(0, 10),
    altText:
      typeof typedAlt === 'string' && typedAlt.length > 0
        ? typedAlt.slice(0, 300)
        : name.replace(/\.[^.]+$/, '').slice(0, 300),
    usageCount: 0,
  };

  const outcome = await writeDraft((draft) => {
    if (!draft.media) draft.media = [];
    if (!draft.media.some((m) => m.id === item.id)) draft.media.unshift(item);
  });

  if (outcome !== 'ok') {
    return {
      ok: false,
      conflict: true,
      error:
        'The file was stored, but the library list could not be updated. Reload the page — ' +
        'if the file is missing from the library, upload it again.',
    };
  }

  revalidatePath('/admin/media');
  return { ok: true, item };
}

export async function deleteMediaAction(id: unknown): Promise<MediaResult> {
  await requireOwner();
  if (typeof id !== 'string' || id.length === 0 || id.length > 300) {
    return { ok: false, error: 'That asset cannot be deleted.' };
  }

  const adapter = await getStorageAdapter();
  const meta = await readDraftForWrite(adapter);
  const item = (meta.state as CMSState).media.find((m) => m.id === id);

  // The record goes first. If the draft write conflicts, nothing has been
  // deleted at all, and the caller can simply try again.
  const outcome = await writeDraft((draft) => {
    draft.media = (draft.media ?? []).filter((m) => m.id !== id);
  });
  if (outcome !== 'ok') {
    return {
      ok: false,
      conflict: true,
      error: outcome.conflict,
    };
  }

  // Then the bytes. Only files this app stored are removed — the seeded demo
  // artwork lives in `public/demo/`, and a legacy `idb:`/`data:` reference has
  // nothing on the server to delete. A failed delete leaves an orphaned file,
  // which is worth a note but not a failure: the library no longer lists it.
  let warning: string | undefined;
  if (item && item.url.startsWith('/api/media/')) {
    try {
      await adapter.media.remove(item.id);
      for (const width of item.variants ?? []) {
        await adapter.media.remove(variantKey(item.id, width)).catch(() => undefined);
      }
    } catch (err) {
      console.error('[media] Delete failed.', err);
      warning = `"${item.name}" is out of the library, but the stored copy could not be deleted.`;
    }
  }

  revalidatePath('/admin/media');
  return { ok: true, warning };
}

export async function updateResumeAction(url: unknown, name: unknown): Promise<MediaResult> {
  await requireOwner();

  // The only URLs this ever sees come from the library, where uploads build
  // `/api/media/<key>`. Anything else — a `javascript:` URL, a data: blob —
  // must not become a link on the public site.
  if (
    typeof url !== 'string' ||
    !url.startsWith('/api/media/') ||
    url.length > 500 ||
    typeof name !== 'string' ||
    name.length === 0 ||
    name.length > 300
  ) {
    return { ok: false, error: 'That file cannot be used as the résumé.' };
  }

  const outcome = await writeDraft((draft) => {
    draft.settings.resumeUrl = url;
    draft.settings.resumeFilename = name;
  });
  if (outcome !== 'ok') {
    return {
      ok: false,
      conflict: true,
      error: outcome.conflict,
    };
  }

  revalidatePath('/admin/media');
  return { ok: true };
}
