'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { PUBLISHED_TAG } from '@/core/content/read';
import { getStorageAdapter } from '@/core/storage/registry';
import { requireOwner } from '@/core/auth/guard';
import { RevisionConflictError } from '@/core/storage/contract';
import { conflictMessage } from '@/core/content/changes';
import { normaliseLanguage } from '@/core/content/language';
import { screenToken, staleScreenError, type ScreenSlice } from '@/core/content/screen-token';
import { THEME_PRESETS, DEFAULT_THEME_ID } from '@/core/theme/presets';
import { INITIAL_CMS_STATE } from '@/cms/data/initialData';
import { SOCIAL_PLATFORM_BY_ID } from '@/cms/data/socialPlatforms';
import type { CMSState, SocialLinkItem, SocialPlatformId } from '@/cms/types/cms';
import { readDraftForWrite } from '@/core/content/draft';

export interface SettingsResult {
  ok: boolean;
  error?: string;
  conflict?: boolean;
  /** The screen's new token, for the next save. See `core/content/screen-token`. */
  token?: string;
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
  slice: ScreenSlice,
  token: unknown,
  mutate: (draft: CMSState) => void
): Promise<SettingsResult> {
  const adapter = await getStorageAdapter();
  const meta = await readDraftForWrite(adapter);
  const stale = staleScreenError(meta.state as CMSState, slice, token);
  if (stale) return { ok: false, conflict: true, error: stale };

  const next = structuredClone(meta.state as CMSState);
  mutate(next);

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
  revalidatePath(path);
  return { ok: true, token: screenToken(next, slice) };
}

function isText(value: unknown, max = MAX_TEXT): value is string {
  return typeof value === 'string' && value.length <= max;
}

/**
 * Copies only the named keys. The key written always comes from the list,
 * never from the request, so no patch can reach `__proto__` or a prototype.
 */
function copyKnown(target: object, source: Record<string, unknown>, keys: readonly string[]) {
  const into = target as Record<string, unknown>;
  for (const key of keys) if (Object.hasOwn(source, key)) into[key] = source[key];
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
  patch: Record<string, unknown>,
  token?: string
): Promise<SettingsResult> {
  await requireOwner();
  if (!patch || typeof patch !== 'object') return { ok: false, error: 'Nothing to save.' };

  const clean: Record<string, unknown> = { ...patch };
  for (const [key, value] of Object.entries(patch)) {
    if (key === 'language') {
      const tag = normaliseLanguage(value);
      if (tag === null) {
        return {
          ok: false,
          error: 'That is not a language code. Try one like en, bn, es or pt-BR.',
        };
      }
      clean.language = tag;
      continue;
    }
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

  return writeDraft('/admin/settings', 'site', token, (draft) => {
    copyKnown(draft.settings, clean, [...SITE_SETTING_FIELDS, 'language', 'aboutStoryParagraphs']);
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
  patch: Record<string, unknown>,
  token?: string
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

  return writeDraft('/admin/appearance', 'appearance', token, (draft) => {
    copyKnown(draft.appearance, patch, [
      'themeId',
      'giantFooterText',
      ...APPEARANCE_TEXT_FIELDS,
      ...APPEARANCE_FONT_FIELDS,
    ]);
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

export async function updateSeoAction(
  patch: Record<string, unknown>,
  token?: string
): Promise<SettingsResult> {
  await requireOwner();
  if (!patch || typeof patch !== 'object') return { ok: false, error: 'Nothing to save.' };

  for (const [key, value] of Object.entries(patch)) {
    const max = Object.hasOwn(SEO_FIELDS, key) ? SEO_FIELDS[key] : undefined;
    if (max === undefined) return { ok: false, error: 'Unknown setting.' };
    if (!isText(value, max)) return { ok: false, error: 'Those values are not usable.' };
  }

  return writeDraft('/admin/seo', 'seo', token, (draft) => {
    copyKnown(draft.seo, patch, Object.keys(SEO_FIELDS));
  });
}

export async function updateMicrocopyAction(
  patch: Record<string, string>,
  token?: string
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

  return writeDraft('/admin/microcopy', 'microcopy', token, (draft) => {
    const microcopy = draft.microcopy as unknown as Record<string, string>;
    // Only keys the content already has. A stale screen cannot add fields.
    for (const [key, value] of entries) {
      if (key in microcopy) microcopy[key] = value;
    }
  });
}

export async function updateFooterAction(
  input: {
    copyrightText: string;
    giantFooterText: string;
  },
  token?: string
): Promise<SettingsResult> {
  await requireOwner();
  if (!input || typeof input !== 'object') return { ok: false, error: 'Nothing to save.' };
  if (!isText(input.copyrightText, 500) || !isText(input.giantFooterText, 200)) {
    return { ok: false, error: 'Those values are not usable.' };
  }

  return writeDraft('/admin/footer', 'footer', token, (draft) => {
    draft.settings.copyrightText = input.copyrightText;
    draft.appearance.giantFooterText = input.giantFooterText;
  });
}

export async function updateSocialLinksAction(
  links: unknown,
  token?: string
): Promise<SettingsResult> {
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

  return writeDraft('/admin/footer', 'socialLinks', token, (draft) => {
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
  updateTag(PUBLISHED_TAG);
  revalidatePath('/', 'layout');
  revalidatePath('/admin', 'layout');
  return { ok: true };
}
