import 'server-only';
import { cache } from 'react';
import { draftMode } from 'next/headers';
import type { Channel } from '@/core/storage/contract';
import { getContentForChannel } from '@/core/content/read';
import { parsePage } from '@/core/blocks/registry';
import type { ParsedBlock } from '@/core/blocks/schema';
import { HOME_SLUG, isHomePage, pageSchema, type PageRecord } from './schema';

/**
 * Reading pages, for both the public site and the preview.
 *
 * The channel is decided once, here, rather than passed down from every route.
 * A route that forgets to thread it through would silently show live content in
 * preview — which looks like preview being broken, and is the kind of bug that
 * survives for months because everything appears to work.
 */

/**
 * `draft` only when preview is switched on.
 *
 * `draftMode()` throws outside a request — during `generateStaticParams`, in the
 * sitemap, in a test — and every one of those cases wants the published site.
 * Catching is the correct answer rather than a guard, because "is there a
 * request in scope" is not something a caller should have to know.
 */
export const currentChannel = cache(async (): Promise<Channel> => {
  try {
    const { isEnabled } = await draftMode();
    return isEnabled ? 'draft' : 'published';
  } catch {
    return 'published';
  }
});

/**
 * Every page in a channel, invalid records dropped rather than thrown on.
 *
 * A page that fails this schema is malformed at the record level — no slug, no
 * id — so there is nothing to render and nowhere to render it. That is a
 * different situation from a *block* failing to parse, which is quarantined and
 * kept, because there the rest of the page is still worth showing.
 */
export const getPages = cache(async (channel: Channel): Promise<PageRecord[]> => {
  const content = await getContentForChannel(channel);
  const raw = content.pages ?? [];

  const pages: PageRecord[] = [];
  for (const entry of raw) {
    const parsed = pageSchema.safeParse(entry);
    if (parsed.success) pages.push(parsed.data);
  }
  return pages;
});

/**
 * The pages that should actually resolve to a URL in this channel.
 *
 * Draft pages are reachable in preview and nowhere else. That is the whole
 * contract of a draft: the owner can see it, the internet cannot.
 */
export async function getRoutablePages(channel: Channel): Promise<PageRecord[]> {
  const pages = await getPages(channel);
  return channel === 'draft' ? pages : pages.filter((page) => page.status === 'published');
}

export async function getPageBySlug(slug: string, channel: Channel): Promise<PageRecord | null> {
  const pages = await getRoutablePages(channel);
  return pages.find((page) => page.slug === slug) ?? null;
}

export interface ResolvedPage {
  page: PageRecord;
  blocks: ParsedBlock[];
}

/** A page with its blocks parsed, ready to render. */
export async function resolvePage(slug: string, channel: Channel): Promise<ResolvedPage | null> {
  const page = await getPageBySlug(slug, channel);
  if (!page) return null;
  return { page, blocks: parsePage(page.blocks) };
}

/**
 * Published, indexable pages, for the sitemap.
 *
 * The home page is excluded: `/` is already in the sitemap as a static route,
 * and listing it twice under two spellings is how a site tells a crawler its
 * front door is duplicate content.
 */
export async function getIndexablePages(): Promise<PageRecord[]> {
  const pages = await getRoutablePages('published');
  return pages.filter((page) => !page.seo.noindex && !isHomePage(page));
}

/**
 * The home page, when its owner has built one and put something on it.
 *
 * Returns null while it is empty, so the theme's own sections keep rendering —
 * an install that has never opened this screen must not suddenly serve a blank
 * front page.
 */
export async function resolveHomePage(channel: Channel): Promise<ResolvedPage | null> {
  const resolved = await resolvePage(HOME_SLUG, channel);
  return resolved && resolved.blocks.length > 0 ? resolved : null;
}

/** Pages the owner asked to appear in site navigation, in their chosen order. */
export async function getNavPages(channel: Channel): Promise<PageRecord[]> {
  const pages = await getRoutablePages(channel);
  return pages
    .filter((page) => page.nav.show && !isHomePage(page))
    .sort((a, b) => a.nav.order - b.nav.order || a.title.localeCompare(b.title));
}
