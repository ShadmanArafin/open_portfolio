import { siteNow } from '@/core/content/now';
import { atLeastOne, SHELL_SLUG } from '@/core/pages/static-params';
import type { Metadata } from 'next';
import type { Article, WithContext } from 'schema-dts';
import { notFound } from 'next/navigation';
import { buildMetadata, resolveSiteUrl } from '@/core/content/metadata';
import { BlockList } from '@/core/blocks/registry';
import { blockContentFrom } from '@/core/blocks/content';
import { getContentForChannel } from '@/core/content/read';
import { currentChannel } from '@/core/pages/read';
import { getPublicWriting, getWritingSettings, resolveWriting } from '@/core/writing/read';
import { PreviewBanner } from '../../preview-banner';
import { JsonLd } from '@/core/content/json-ld-script';
import { breadcrumbsFor } from '@/core/content/structured-data';
import { neighbours, readingMinutes, related, withContents } from '@/core/writing/reading';
import { Contents, EntryHeader, Neighbours, Related } from '../_ui/entry-parts';

/** One piece, rendered through the same block system as every page. */

export async function generateStaticParams() {
  try {
    return atLeastOne(
      (await getPublicWriting('published')).map((entry) => ({ slug: entry.slug })),
      { slug: SHELL_SLUG }
    );
  } catch {
    // A paused free-tier database must never be the reason a deploy goes red.
    return [{ slug: SHELL_SLUG }];
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
      image: entry.seo.image || `/writing/${entry.slug}/opengraph-image`,
      type: 'article',
    })),
    robots: entry.seo.noindex || entry.status !== 'published' ? 'noindex, nofollow' : undefined,
  };
}

export default async function WritingEntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const channel = await currentChannel();
  const [settings, resolved, content, all] = await Promise.all([
    getWritingSettings(channel),
    resolveWriting(slug, channel),
    getContentForChannel(channel),
    getPublicWriting(channel),
  ]);

  if (!settings.enabled || !resolved) notFound();

  // Entity clarity, not decoration: JSON-LD tells search engines and AI
  // citations what the page is (an Article, by whom, when) in a form that
  // survives any theme. Google documents it as the recommended format.
  const siteUrl = resolveSiteUrl(content);
  const articleUrl = siteUrl ? `${siteUrl}/writing/${resolved.entry.slug}` : undefined;
  const imageUrl = resolved.entry.seo.image
    ? resolved.entry.seo.image.startsWith('/') && siteUrl
      ? `${siteUrl}${resolved.entry.seo.image}`
      : resolved.entry.seo.image
    : siteUrl
      ? `${siteUrl}/writing/${resolved.entry.slug}/opengraph-image`
      : undefined;

  const article: WithContext<Article> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: resolved.entry.title,
    ...(resolved.entry.summary ? { description: resolved.entry.summary } : {}),
    ...(articleUrl ? { mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl } } : {}),
    ...(imageUrl ? { image: [imageUrl] } : {}),
    ...(content.settings.fullName
      ? {
          author: {
            '@type': 'Person',
            name: content.settings.fullName,
            ...(siteUrl ? { url: siteUrl } : {}),
          },
          publisher: { '@type': 'Person', name: content.settings.fullName },
        }
      : {}),
    ...(resolved.entry.publishedAt ? { datePublished: resolved.entry.publishedAt } : {}),
    ...(resolved.entry.updatedAt ? { dateModified: resolved.entry.updatedAt } : {}),
  };

  const contents = withContents(resolved.blocks);

  return (
    <>
      <JsonLd data={article} />
      <JsonLd
        data={breadcrumbsFor(content, [
          { name: settings.label || 'Writing', path: '/writing' },
          { name: resolved.entry.title, path: `/writing/${resolved.entry.slug}` },
        ])}
      />
      {channel === 'draft' && (
        <PreviewBanner
          status={resolved.entry.status === 'published' ? 'published' : 'draft'}
          path={`/writing/${resolved.entry.slug}`}
        />
      )}
      <EntryHeader
        title={resolved.entry.title}
        summary={resolved.entry.summary}
        date={settings.showDates ? resolved.entry.publishedAt : undefined}
        minutes={readingMinutes(resolved.blocks)}
        tags={resolved.entry.tags ?? []}
      />
      <Contents toc={contents.toc} />
      {/* The title above is the page's h1, so the blocks start at h2. */}
      <BlockList
        blocks={contents.blocks}
        content={blockContentFrom(content, await siteNow())}
        firstLevel={2}
      />
      <Neighbours {...neighbours(all, resolved.entry.slug)} />
      <Related entries={related(all, resolved.entry.slug)} />
    </>
  );
}
