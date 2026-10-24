import 'server-only';
import { cache } from 'react';
import { getContentForChannel } from '@/core/content/read';
import { publicView } from '@/core/content/sanitise';
import { currentChannel } from '@/core/pages/read';
import { siteNow } from '@/core/content/now';
import type { CMSState } from './types/cms';
import { buildImageIndex, srcSetFor, type ImageIndex } from '@/core/media/srcset';

/**
 * The theme's content, read on the server: what `useCMS()` gives a client
 * component, for the server components that replaced most of them.
 *
 * Draft or published by the same channel rule as the layout, cut to what a
 * visitor may see by the same `publicView`, and read once per request
 * however many sections ask (React `cache`). Unlike the client copy it keeps
 * page blocks and stories: nothing here is serialised to the browser.
 */
export const siteContent = cache(async (): Promise<CMSState> => {
  return publicView(await getContentForChannel(await currentChannel()), await siteNow());
});

/**
 * URL → smaller copies, for the server's `<img srcset>`. Built once per
 * request from the same content as `siteContent`, so the browser never needs
 * the media library to choose an image size.
 */
export const imageIndex = cache(async (): Promise<ImageIndex> => {
  return buildImageIndex((await siteContent()).media);
});

/**
 * The `srcset` of each URL a client island will show, worked out here and
 * passed down as data. Only URLs that have smaller copies get an entry.
 */
export async function srcSetsFor(urls: Iterable<string | undefined | null>) {
  const index = await imageIndex();
  const out: Record<string, string> = {};
  for (const url of urls) {
    const srcSet = srcSetFor(url, index);
    if (url && srcSet) out[url] = srcSet;
  }
  return out;
}
