import { getPublishedContent } from '@/core/content/read';
import { resolveSiteUrl } from '@/core/content/metadata';
import { getPublicWriting, getWritingSettings, resolveWritingBody } from '@/core/writing/read';
import { cdata, writingFeedHtml } from '@/core/writing/feed';

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

  const root = siteUrl.replace(/\/$/, '');

  // A feed is chronological even when the site is curated: readers sort by
  // date, and the newest fifty is what a reader can reasonably hold. The
  // bodies come from their records, one at a time, because the published
  // snapshot deliberately carries none.
  const newest = [...entries]
    .sort(
      (a, b) => Date.parse(b.publishedAt ?? b.updatedAt) - Date.parse(a.publishedAt ?? a.updatedAt)
    )
    .slice(0, 50);

  const bodies = await Promise.all(newest.map((entry) => resolveWritingBody(entry, 'published')));

  const items = newest.map((entry, index) => {
    const url = root + '/writing/' + entry.slug;
    const date = new Date(entry.publishedAt ?? entry.updatedAt).toUTCString();
    const body = bodies[index];
    const encoded = body ? writingFeedHtml(body, root) : '';
    return [
      '    <item>',
      '      <title>' + escapeXml(entry.title) + '</title>',
      '      <link>' + escapeXml(url) + '</link>',
      '      <guid isPermaLink="true">' + escapeXml(url) + '</guid>',
      '      <pubDate>' + date + '</pubDate>',
      '      <description>' + escapeXml(entry.summary) + '</description>',
      ...(encoded ? ['      <content:encoded>' + cdata(encoded) + '</content:encoded>'] : []),
      '    </item>',
    ].join('\n');
  });

  const title = escapeXml(settings.label + ' — ' + (content.seo.siteTitle || 'Portfolio'));

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" ' +
      'xmlns:content="http://purl.org/rss/1.0/modules/content/">',
    '  <channel>',
    '    <title>' + title + '</title>',
    '    <link>' + escapeXml(root + '/writing') + '</link>',
    '    <description>' + escapeXml(content.seo.metaDescription || '') + '</description>',
    '    <language>en</language>',
    '    <atom:link href="' +
      escapeXml(root + '/writing/feed.xml') +
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
