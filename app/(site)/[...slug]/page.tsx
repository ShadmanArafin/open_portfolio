import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { buildMetadata } from '@/core/content/metadata';
import { BlockList } from '@/core/blocks/registry';
import { currentChannel, getRoutablePages, resolvePage } from '@/core/pages/read';
import { segmentsToSlug } from '@/core/pages/schema';
import { PreviewBanner } from './preview-banner';

/**
 * Every page the owner builds, at whatever address they chose.
 *
 * A required catch-all rather than an optional one, deliberately: `[[...slug]]`
 * also matches `/`, which collides with the home route and is a build error.
 * Home stays a real route until the theme's sections become blocks.
 *
 * Static routes win over this one in the router, so a page whose slug shadows a
 * real route can never load. `checkSlug` refuses to save one — the collision is
 * caught where it is created rather than discovered as a 404 later.
 */

export async function generateStaticParams() {
  try {
    const pages = await getRoutablePages('published');
    return pages.map((page) => ({ slug: page.slug.split('/') }));
  } catch {
    // A paused free-tier database must never be the reason a deploy goes red.
    // Returning nothing yields a fully dynamic site, which still works.
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const slug = segmentsToSlug((await params).slug);
  const channel = await currentChannel();
  const resolved = await resolvePage(slug, channel);
  if (!resolved) return buildMetadata({ title: 'Not found' });

  const { page } = resolved;
  return {
    ...(await buildMetadata({
      title: page.seo.title || page.title,
      description: page.seo.description,
      path: `/${page.slug}`,
      image: page.seo.image,
    })),
    // A draft is reachable only in preview, but a preview URL pasted into a
    // chat window is one screenshot away from being crawled. Say noindex.
    robots: page.seo.noindex || page.status === 'draft' ? 'noindex, nofollow' : undefined,
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const slug = segmentsToSlug((await params).slug);
  const channel = await currentChannel();
  const resolved = await resolvePage(slug, channel);

  // Resolved on the server so an address that does not exist returns a real 404
  // status, which matters to crawlers as much as to people.
  if (!resolved) notFound();

  return (
    <>
      {channel === 'draft' && (
        <PreviewBanner status={resolved.page.status} path={`/${resolved.page.slug}`} />
      )}
      <BlockList blocks={resolved.blocks} />
    </>
  );
}
