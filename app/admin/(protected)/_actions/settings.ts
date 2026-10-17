'use server';

import { revalidatePath } from 'next/cache';
import { getStorageAdapter } from '@/core/storage/registry';
import { requireOwner } from '@/core/auth/guard';
import { RevisionConflictError } from '@/core/storage/contract';
import { THEME_PRESETS, DEFAULT_THEME_ID } from '@/core/theme/presets';
import { INITIAL_CMS_STATE } from '@/cms/data/initialData';
import { SOCIAL_PLATFORM_BY_ID } from '@/cms/data/socialPlatforms';
import type { CMSState, SocialLinkItem, SocialPlatformId } from '@/cms/types/cms';

export interface SettingsResult {
  ok: boolean;
  error?: string;
  conflict?: boolean;
}

export interface RestoreSummary {
  published: boolean;
  draft: boolean;
  manifestEntries: number;
  filesPresent: number;
  filesMissing: number;
}

/**
 * The settings family's writes, as server actions.
 *
 * Every screen here edits the draft: content is drafted, published and
 * exported with everything else. The pattern is the newsletter form's — read
 * the draft from storage, transform it, write it back revision-checked — and
 * the same two rules as every other endpoint: `requireOwner()` first, and the
 * payload validated against a written-down set rather than trusted.
 */

const MAX_TEXT = 2000;

async function writeDraft(
  path: string,
  mutate: (draft: CMSState) => void
): Promise<SettingsResult> {
  const adapter = await getStorageAdapter();
  const meta = await adapter.readSnapshotMeta('draft');
  if (!meta) return { ok: false, error: 'There is no draft to change yet.' };

  const next = structuredClone(meta.state as CMSState);
  mutate(next);

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
  revalidatePath(path);
  return { ok: true };
}

function isText(value: unknown, max = MAX_TEXT): value is string {
  return typeof value === 'string' && value.length <= max;
}

const SITE_SETTING_FIELDS = [
  'fullName',
  'role',
  'location',
  'email',
  'whatsappNumber',
  'whatsappFormatted',
  'whatsappUrl',
  'availabilityStatus',
  'aboutHeading',
  'copyrightText',
] as const;

export async function updateSiteSettingsAction(
  patch: Record<string, unknown>
): Promise<SettingsResult> {
  await requireOwner();
  if (!patch || typeof patch !== 'object') return { ok: false, error: 'Nothing to save.' };

  for (const [key, value] of Object.entries(patch)) {
    if (key === 'aboutStoryParagraphs') {
      if (!Array.isArray(value) || value.length > 50 || value.some((p) => !isText(p, 5000))) {
        return { ok: false, error: 'Those values are not usable.' };
      }
      continue;
    }
    if (!(SITE_SETTING_FIELDS as readonly string[]).includes(key)) {
      return { ok: false, error: 'Unknown setting.' };
    }
    if (!isText(value, 500)) return { ok: false, error: 'Those values are not usable.' };
  }

  return writeDraft('/admin/settings', (draft) => {
    for (const [key, value] of Object.entries(patch)) {
      (draft.settings as unknown as Record<string, unknown>)[key] = value;
    }
  });
}

const APPEARANCE_TEXT_FIELDS = [
  'accentDark',
  'accentLight',
  'backgroundDark',
  'backgroundLight',
  'strokeDark',
  'strokeLight',
] as const;

const APPEARANCE_FONT_FIELDS = ['displayFontFamily', 'bodyFontFamily', 'monoFontFamily'] as const;

const THEME_IDS = new Set([DEFAULT_THEME_ID, ...THEME_PRESETS.map((preset) => preset.id)]);

export async function updateAppearanceAction(
  patch: Record<string, unknown>
): Promise<SettingsResult> {
  await requireOwner();
  if (!patch || typeof patch !== 'object') return { ok: false, error: 'Nothing to save.' };

  for (const [key, value] of Object.entries(patch)) {
    if (key === 'themeId') {
      if (!isText(value, 60) || !THEME_IDS.has(value)) {
        return { ok: false, error: 'That theme does not exist.' };
      }
      continue;
    }
    if (key === 'giantFooterText') {
      if (!isText(value, 200)) return { ok: false, error: 'Those values are not usable.' };
      continue;
    }
    if ((APPEARANCE_TEXT_FIELDS as readonly string[]).includes(key)) {
      // Empty means "no override"; otherwise it must be a colour the inputs
      // and the theme resolver can both use.
      if (!isText(value, 64) || (value !== '' && !/^#[0-9a-fA-F]{3,8}$/.test(value))) {
        return { ok: false, error: 'Colours are written as #rrggbb.' };
      }
      continue;
    }
    if ((APPEARANCE_FONT_FIELDS as readonly string[]).includes(key)) {
      if (!isText(value, 120)) return { ok: false, error: 'Those values are not usable.' };
      continue;
    }
    return { ok: false, error: 'Unknown setting.' };
  }

  return writeDraft('/admin/appearance', (draft) => {
    for (const [key, value] of Object.entries(patch)) {
      (draft.appearance as unknown as Record<string, unknown>)[key] = value;
    }
  });
}

const SEO_FIELDS: Record<string, number> = {
  siteTitle: 300,
  titleTemplate: 300,
  metaDescription: 2000,
  canonicalUrl: 500,
  ogImage: 500,
  author: 300,
  robots: 200,
};

export async function updateSeoAction(patch: Record<string, unknown>): Promise<SettingsResult> {
  await requireOwner();
  if (!patch || typeof patch !== 'object') return { ok: false, error: 'Nothing to save.' };

  for (const [key, value] of Object.entries(patch)) {
    const max = SEO_FIELDS[key];
    if (max === undefined) return { ok: false, error: 'Unknown setting.' };
    if (!isText(value, max)) return { ok: false, error: 'Those values are not usable.' };
  }

  return writeDraft('/admin/seo', (draft) => {
    for (const [key, value] of Object.entries(patch)) {
      (draft.seo as unknown as Record<string, unknown>)[key] = value;
    }
  });
}

export async function updateMicrocopyAction(
  patch: Record<string, string>
): Promise<SettingsResult> {
  await requireOwner();
  if (!patch || typeof patch !== 'object') return { ok: false, error: 'Nothing to save.' };

  const entries = Object.entries(patch);
  if (entries.length > 200) return { ok: false, error: 'Too many strings at once.' };
  for (const [key, value] of entries) {
    if (key.length === 0 || key.length > 100 || !isText(value, 500)) {
      return { ok: false, error: 'Those values are not usable.' };
    }
  }

  return writeDraft('/admin/microcopy', (draft) => {
    const microcopy = draft.microcopy as unknown as Record<string, string>;
    // Only keys the content already has. A stale screen cannot add fields.
    for (const [key, value] of entries) {
      if (key in microcopy) microcopy[key] = value;
    }
  });
}

export async function updateFooterAction(input: {
  copyrightText: string;
  giantFooterText: string;
}): Promise<SettingsResult> {
  await requireOwner();
  if (!input || typeof input !== 'object') return { ok: false, error: 'Nothing to save.' };
  if (!isText(input.copyrightText, 500) || !isText(input.giantFooterText, 200)) {
    return { ok: false, error: 'Those values are not usable.' };
  }

  return writeDraft('/admin/footer', (draft) => {
    draft.settings.copyrightText = input.copyrightText;
    draft.appearance.giantFooterText = input.giantFooterText;
  });
}

export async function updateSocialLinksAction(links: unknown): Promise<SettingsResult> {
  await requireOwner();
  if (!Array.isArray(links) || links.length > 30) {
    return { ok: false, error: 'Those links are not usable.' };
  }

  const clean: SocialLinkItem[] = [];
  for (const entry of links) {
    if (!entry || typeof entry !== 'object')
      return { ok: false, error: 'Those links are not usable.' };
    const link = entry as Record<string, unknown>;
    if (
      !isText(link.id, 100) ||
      link.id.length === 0 ||
      !isText(link.label, 100) ||
      !isText(link.name, 100) ||
      !isText(link.url, 500) ||
      typeof link.iconType !== 'string' ||
      !Object.prototype.hasOwnProperty.call(SOCIAL_PLATFORM_BY_ID, link.iconType) ||
      typeof link.visible !== 'boolean' ||
      typeof link.sortOrder !== 'number' ||
      !Number.isFinite(link.sortOrder)
    ) {
      return { ok: false, error: 'Those links are not usable.' };
    }
    clean.push({
      id: link.id,
      label: link.label,
      name: link.name,
      url: link.url,
      iconType: link.iconType as SocialPlatformId,
      visible: link.visible,
      sortOrder: link.sortOrder,
    });
  }

  return writeDraft('/admin/footer', (draft) => {
    draft.socialLinks = clean;
  });
}

/**
 * Reset everything to the built-in content.
 *
 * Both snapshots are written unconditionally, like a restore: this is a
 * deliberate act on content the owner just confirmed, and the revision check
 * would refuse the most common case — resetting a site that has moved on.
 * Uploaded media files are not deleted; they simply stop being referenced.
 */
export async function resetContentAction(): Promise<SettingsResult> {
  await requireOwner();
  const adapter = await getStorageAdapter();
  await adapter.writeSnapshot('published', structuredClone(INITIAL_CMS_STATE));
  await adapter.writeSnapshot('draft', structuredClone(INITIAL_CMS_STATE));
  revalidatePath('/', 'layout');
  revalidatePath('/admin', 'layout');
  return { ok: true };
}
