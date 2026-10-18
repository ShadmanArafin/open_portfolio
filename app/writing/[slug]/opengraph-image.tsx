import { ImageResponse } from 'next/og';
import { notFound } from 'next/navigation';
import { getContentForChannel } from '@/core/content/read';
import { resolveWriting } from '@/core/writing/read';

/**
 * The card a shared writing link unfurls into.
 *
 * **This file is deliberately outside `app/(site)/`.** Next gives every
 * metadata route whose path contains a route group a hash suffix — there is a
 * `getMetadataRouteSuffix` in `next/dist/lib/metadata/get-metadata-route.js`
 * that hashes the parent path whenever it sees a `(group)` or `@parallel`
 * segment. Inside the group the file really serves
 * `/writing/<slug>/opengraph-image-cvh5yn`, while every page, sitemap and
 * metadata object refers to the clean path, so the advertised URL 404s and
 * only the suffixed one answers. Measured, not guessed: the live check
 * returned 200 on the suffixed path and 404 on the clean one before the move.
 *
 * The page it belongs to is still in the group. A page and a metadata route
 * may sit in different places and still resolve to the same URL: the site-wide
 * card lives at `app/opengraph-image.tsx` while the home page it decorates
 * lives under `app/(site)/`. The file here is the same arrangement, one
 * segment deeper.
 *
 * Moving this back inside `(site)` breaks sharing silently: the page keeps
 * rendering, and only the unfurled preview goes grey.
 */

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Article cover';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [content, resolved] = await Promise.all([
    getContentForChannel('published'),
    resolveWriting(slug, 'published'),
  ]);

  // A card for a piece that does not exist would be a 200 saying "this is a
  // real page". Crawlers only ask for the address a page advertises, so the
  // only way to arrive here without a piece is to guess.
  if (!resolved) notFound();

  const authorName = content.settings.fullName || content.seo.siteTitle || 'Portfolio';
  const role = content.settings.role || '';
  const title = resolved.entry.title || 'Writing';
  const summary = resolved.entry.summary || '';
  const date = resolved.entry.publishedAt
    ? new Date(resolved.entry.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#090a0f',
        color: '#f4f4f5',
        padding: '64px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        border: '12px solid #181920',
        boxSizing: 'border-box',
      }}
    >
      {/* Top bar: Author and role */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #27272a',
          paddingBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: '#10b981',
            }}
          />
          <span style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.02em' }}>
            {authorName}
          </span>
          {role ? <span style={{ fontSize: '20px', color: '#71717a' }}>· {role}</span> : null}
        </div>
        <span
          style={{
            fontSize: '18px',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#10b981',
          }}
        >
          WRITING
        </span>
      </div>

      {/* Middle: Title and summary */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', margin: 'auto 0' }}>
        <h1
          style={{
            fontSize: title.length > 60 ? '48px' : '58px',
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            margin: 0,
            color: '#ffffff',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {title}
        </h1>

        {summary ? (
          <p
            style={{
              fontSize: '24px',
              lineHeight: 1.4,
              color: '#a1a1aa',
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {summary}
          </p>
        ) : null}
      </div>

      {/* Bottom bar: Publication date and site link */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid #27272a',
          paddingTop: '24px',
          fontSize: '18px',
          color: '#71717a',
        }}
      >
        <span>{date || 'Published essay'}</span>
        <span style={{ color: '#a1a1aa' }}>
          {content.settings.siteUrl ? content.settings.siteUrl.replace(/^https?:\/\//, '') : ''}
        </span>
      </div>
    </div>,
    {
      ...size,
    }
  );
}
