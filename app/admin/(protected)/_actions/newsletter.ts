'use server';

import { revalidatePath } from 'next/cache';
import { getStorageAdapter } from '@/core/storage/registry';
import { requireOwner } from '@/core/auth/guard';
import { NEWSLETTER_DEFAULTS } from '@/core/newsletter/schema';
import { RevisionConflictError } from '@/core/storage/contract';
import { conflictMessage } from '@/core/content/changes';
import { screenToken, staleScreenError } from '@/core/content/screen-token';
import { readDraftForWrite } from '@/core/content/draft';

export interface NewsletterActionResult {
  ok: boolean;
  error?: string;
  conflict?: boolean;
  /** The screen's new token, for the next save. See `core/content/screen-token`. */
  token?: string;
}

/**
 * The form copy on the site. Content, not list: drafted, published and
 * exported with everything else — which is why this writes the draft
 * snapshot rather than touching the subscribers surface.
 */
export async function updateNewsletterSettingsAction(
  settings: {
    enabled: boolean;
    pitch: string;
    buttonLabel: string;
    pendingMessage: string;
  },
  token?: string
): Promise<NewsletterActionResult> {
  await requireOwner();
  if (
    typeof settings.enabled !== 'boolean' ||
    typeof settings.pitch !== 'string' ||
    typeof settings.buttonLabel !== 'string' ||
    typeof settings.pendingMessage !== 'string'
  ) {
    return { ok: false, error: 'Those settings are not usable.' };
  }

  const adapter = await getStorageAdapter();
  const meta = await readDraftForWrite(adapter);
  const stale = staleScreenError(meta.state, 'newsletter', token);
  if (stale) return { ok: false, conflict: true, error: stale };

  const next = structuredClone(meta.state);
  next.newsletter = {
    ...NEWSLETTER_DEFAULTS,
    ...(next.newsletter ?? {}),
    enabled: settings.enabled,
    pitch: settings.pitch.slice(0, 300),
    buttonLabel: settings.buttonLabel.slice(0, 60),
    pendingMessage: settings.pendingMessage.slice(0, 500),
  };

  try {
    await adapter.writeSnapshot('draft', next, meta.revision);
  } catch (err) {
    if (err instanceof RevisionConflictError) {
      // Raced with another save. Re-read for the diff: what matters is what is
      // stored now, not the read this write was built on.
      const fresh = await adapter.readSnapshotMeta('draft');
      return {
        ok: false,
        conflict: true,
        error: conflictMessage(err, fresh?.state ?? null, next, 'Saving'),
      };
    }
    throw err;
  }
  revalidatePath('/admin/newsletter');
  return { ok: true, token: screenToken(next, 'newsletter') };
}

export async function removeSubscriberAction(id: string): Promise<NewsletterActionResult> {
  await requireOwner();
  if (!id) return { ok: false, error: 'A subscriber is required.' };
  await (await getStorageAdapter()).subscribers.remove(id);
  revalidatePath('/admin/newsletter');
  return { ok: true };
}
