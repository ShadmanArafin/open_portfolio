import { getPublishedContent } from '@/core/content/read';
import { resolveSiteUrl } from '@/core/content/metadata';
import { getPublicWriting, getWritingSettings } from '@/core/writing/read';

/**
 * RSS, unconditionally.
 *
 * It costs almost nothing and the people who want a feed want it badly — and
 * they are disproportionately the people who go on to link to somebody's
 * writing. Serving it even when the collection is arranged as a curated list is
 * deliberate: a reader's feed application sorts by date regardless, and denying
 * them the feed to protect an ordering choice helps nobody.
 */

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function GET() {
  const [content, settings, entries] = await Promise.all([
    getPublishedContent(),
    getWritingSettings('published'),
    getPublicWriting('published'),
  ]);

  const siteUrl = resolveSiteUrl(content);

  // Without an address there is nothing to link to, and a feed full of relative
  // URLs is worse than no feed at all.
  if (!settings.enabled || !siteUrl) return new Response('Not found', { status: 404 });

  const items = entries.map((entry) => {
    const url = siteUrl + '/writing/' + entry.slug;
    const date = new Date(entry.publishedAt ?? entry.updatedAt).toUTCString();
    return [
      '    <item>',
      '      <title>' + escapeXml(entry.title) + '</title>',
      '      <link>' + escapeXml(url) + '</link>',
      '      <guid isPermaLink="true">' + escapeXml(url) + '</guid>',
      '      <pubDate>' + date + '</pubDate>',
      '      <description>' + escapeXml(entry.summary) + '</description>',
      '    </item>',
    ].join('\n');
  });

  const title = escapeXml(settings.label + ' — ' + (content.seo.siteTitle || 'Portfolio'));

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    '    <title>' + title + '</title>',
    '    <link>' + escapeXml(siteUrl + '/writing') + '</link>',
    '    <description>' + escapeXml(content.seo.metaDescription || '') + '</description>',
    '    <language>en</language>',
    '    <atom:link href="' +
      escapeXml(siteUrl + '/writing/feed.xml') +
      '" rel="self" type="application/rss+xml" />',
    ...items,
    '  </channel>',
    '</rss>',
  ].join('\n');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      // Feed readers poll. An hour is polite to them and to the database.
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
