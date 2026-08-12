import type { Metadata } from 'next';
import { buildMetadata } from '@/core/content/metadata';
import { BlockList } from '@/core/blocks/registry';
import { blockContentFrom } from '@/core/blocks/content';
import { getContentForChannel } from '@/core/content/read';
import { currentChannel, resolveHomePage } from '@/core/pages/read';
import { HomePage } from '@/views/HomePage';
import { PreviewBanner } from './preview-banner';

/**
 * The front door — either built from blocks, or the theme's own sections.
 *
 * Until now the home page was the one page nobody could edit with the builder,
 * which made it the largest hole in the product: the page every visitor lands
 * on was the page its owner had least control over.
 *
 * The fallback is what makes this safe to ship. An install that has never
 * opened the Pages screen has no home record and keeps exactly the site it had.
 * A home record with no blocks on it also falls through, so somebody who
 * creates one and wanders off does not come back to a blank front page.
 */

export async function generateMetadata(): Promise<Metadata> {
  const resolved = await resolveHomePage(await currentChannel());

  // `title: undefined` is deliberate: the home page is the site's front door,
  // so it gets the site title rather than "Home — Site Title".
  return buildMetadata({
    path: '/',
    title: resolved?.page.seo.title || undefined,
    description: resolved?.page.seo.description,
    image: resolved?.page.seo.image,
  });
}

export default async function Page() {
  const channel = await currentChannel();
  const resolved = await resolveHomePage(channel);
  const content = await getContentForChannel(channel);

  if (!resolved) return <HomePage />;

  return (
    <>
      {channel === 'draft' && <PreviewBanner status={resolved.page.status} path="/" />}
      <BlockList blocks={resolved.blocks} content={blockContentFrom(content)} />
    </>
  );
}
