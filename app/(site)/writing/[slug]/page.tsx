import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { buildMetadata } from '@/core/content/metadata';
import { BlockList } from '@/core/blocks/registry';
import { currentChannel } from '@/core/pages/read';
import { getPublicWriting, getWritingSettings, resolveWriting } from '@/core/writing/read';
import { PreviewBanner } from '../../preview-banner';

/** One piece, rendered through the same block system as every page. */

export async function generateStaticParams() {
  try {
    return (await getPublicWriting('published')).map((entry) => ({ slug: entry.slug }));
  } catch {
    // A paused free-tier database must never be the reason a deploy goes red.
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await resolveWriting(slug, await currentChannel());
  if (!resolved) return buildMetadata({ title: 'Not found' });

  const { entry } = resolved;
  return {
    ...(await buildMetadata({
      title: entry.seo.title || entry.title,
      description: entry.seo.description || entry.summary,
      path: `/writing/${entry.slug}`,
      image: entry.seo.image,
      type: 'article',
    })),
    robots: entry.seo.noindex || entry.status !== 'published' ? 'noindex, nofollow' : undefined,
  };
}

export default async function WritingEntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const channel = await currentChannel();
  const [settings, resolved] = await Promise.all([
    getWritingSettings(channel),
    resolveWriting(slug, channel),
  ]);

  if (!settings.enabled || !resolved) notFound();

  return (
    <>
      {channel === 'draft' && (
        <PreviewBanner
          status={resolved.entry.status === 'published' ? 'published' : 'draft'}
          path={`/writing/${resolved.entry.slug}`}
        />
      )}
      <BlockList blocks={resolved.blocks} />
    </>
  );
}
