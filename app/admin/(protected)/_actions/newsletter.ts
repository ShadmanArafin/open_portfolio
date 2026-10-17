'use server';

import { revalidatePath } from 'next/cache';
import { getStorageAdapter } from '@/core/storage/registry';
import { requireOwner } from '@/core/auth/guard';
import { NEWSLETTER_DEFAULTS } from '@/core/newsletter/schema';
import { RevisionConflictError } from '@/core/storage/contract';

export interface NewsletterActionResult {
  ok: boolean;
  error?: string;
  conflict?: boolean;
}

/**
 * The form copy on the site. Content, not list: drafted, published and
 * exported with everything else — which is why this writes the draft
 * snapshot rather than touching the subscribers surface.
 */
export async function updateNewsletterSettingsAction(settings: {
  enabled: boolean;
  pitch: string;
  buttonLabel: string;
  pendingMessage: string;
}): Promise<NewsletterActionResult> {
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
  const meta = await adapter.readSnapshotMeta('draft');
  if (!meta) return { ok: false, error: 'There is no draft to change yet.' };

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
      return {
        ok: false,
        conflict: true,
        error: 'This changed somewhere else. Reload and try again.',
      };
    }
    throw err;
  }
  revalidatePath('/admin/newsletter');
  return { ok: true };
}

export async function removeSubscriberAction(id: string): Promise<NewsletterActionResult> {
  await requireOwner();
  if (!id) return { ok: false, error: 'A subscriber is required.' };
  await (await getStorageAdapter()).subscribers.remove(id);
  revalidatePath('/admin/newsletter');
  return { ok: true };
}
