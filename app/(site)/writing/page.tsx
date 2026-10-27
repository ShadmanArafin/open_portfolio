import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { TagList } from './_ui/entry-parts';
import { SearchForm } from '../search/search-form';
import { buildMetadata } from '@/core/content/metadata';
import { currentChannel } from '@/core/pages/read';
import { getPublicWriting, getWritingSettings } from '@/core/writing/read';
import { WRITING_PAGE_SIZE } from '@/core/writing/schema';

/**
 * The index. Whatever the owner calls it.
 *
 * A fixed route rather than one derived from the configured slug: Next needs
 * the path at build time, and a settings-driven route would mean a rewrite in
 * middleware for a rename almost nobody performs. The label is what people
 * read; the address is `/writing` and that is not worth a layer of indirection.
 */

type PageQuery = { page?: string | string[] };

/**
 * `?page=` is read strictly.
 *
 * `parseInt` would turn `?page=2abc` into page two and make every typo a valid
 * address; anything that is not a positive whole number is the first page. A
 * page past the end is a 404 rather than a silent clamp, so a stale link says
 * it is stale instead of quietly showing different writing.
 */
function pageNumber(raw: string | string[] | undefined, totalPages: number): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || !/^\d+$/.test(value)) return 1;
  const requested = Number(value);
  if (!Number.isSafeInteger(requested) || requested < 1) return 1;
  return requested > totalPages ? totalPages + 1 : requested;
}

const pageHref = (page: number) => (page <= 1 ? '/writing' : `/writing?page=${page}`);

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<PageQuery>;
}): Promise<Metadata> {
  const channel = await currentChannel();
  const settings = await getWritingSettings(channel);
  const total = (await getPublicWriting(channel)).length;
  const pages = Math.max(1, Math.ceil(total / WRITING_PAGE_SIZE));
  const page = pageNumber((await searchParams).page, pages);
  // The index and its pagination are addresses too: a switched-off section or
  // `?page=999` must answer 404 before rendering.
  if (!settings.enabled || page > pages) notFound();
  return buildMetadata({
    title: page > 1 ? `${settings.label} — page ${page}` : settings.label,
    description: `Essays and notes filed under ${settings.label}.`,
    // Each page names itself. A canonical of `/writing` on page three would
    // tell a crawler every page is a duplicate of the first.
    path: page > 1 ? `/writing?page=${page}` : '/writing',
    rss: '/writing/feed.xml',
  });
}

export default async function WritingIndex({ searchParams }: { searchParams: Promise<PageQuery> }) {
  const channel = await currentChannel();
  const settings = await getWritingSettings(channel);

  // Off by default, and a 404 rather than an empty page: a section with nothing
  // in it is worse for a portfolio than no section at all.
  if (!settings.enabled) notFound();

  return (
    <div style={{ paddingBlock: 'var(--section-y)' }}>
      <div
        style={{
          maxWidth: 'var(--container-default)',
          marginInline: 'auto',
          paddingInline: 'var(--gutter)',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-4xl)',
            lineHeight: 'var(--leading-tight)',
            letterSpacing: 'var(--tracking-tight)',
            margin: 0,
            marginBottom: 'var(--space-8)',
          }}
        >
          {settings.label}
        </h1>

        <Suspense fallback={null}>
          <WritingFeed channel={channel} settings={settings} searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function WritingFeed({
  channel,
  settings,
  searchParams,
}: {
  channel: 'draft' | 'published';
  settings: Awaited<ReturnType<typeof getWritingSettings>>;
  searchParams: Promise<PageQuery>;
}) {
  const [entries, query] = await Promise.all([getPublicWriting(channel), searchParams]);

  // The index reads listing metadata, which the published snapshot carries; the
  // posts themselves are hydrated only on their own pages and in the feed.
  const totalPages = Math.max(1, Math.ceil(entries.length / WRITING_PAGE_SIZE));
  const page = pageNumber(query.page, totalPages);
  if (page > totalPages) notFound();
  const visible = entries.slice((page - 1) * WRITING_PAGE_SIZE, page * WRITING_PAGE_SIZE);

  return (
    <>
      {entries.length > 5 ? (
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <SearchForm />
        </div>
      ) : null}

      {entries.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
          Nothing here yet.
        </p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {visible.map((entry) => (
            <li key={entry.id} style={{ marginBottom: 'var(--space-8)' }}>
              <Link
                href={`/writing/${entry.slug}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-2xl)',
                    lineHeight: 'var(--leading-snug)',
                    margin: 0,
                  }}
                >
                  {entry.title}
                </h2>
                {entry.summary && (
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      color: 'var(--text-secondary)',
                      margin: 'var(--space-2) 0 0',
                      maxWidth: 'var(--measure)',
                    }}
                  >
                    {entry.summary}
                  </p>
                )}
                {/* Dates only when asked for. An evergreen essay looks stale
                    with a date on it, and that is the default case here. */}
                {settings.showDates && entry.publishedAt && (
                  <time
                    dateTime={entry.publishedAt}
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-muted)',
                      marginTop: 'var(--space-2)',
                    }}
                  >
                    {new Date(entry.publishedAt).toLocaleDateString('en-GB', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                )}
              </Link>
              {/* Outside the link: each tag is its own link. */}
              {entry.tags?.length ? (
                <div style={{ marginTop: 'var(--space-2)' }}>
                  <TagList tags={entry.tags} />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 ? (
        <nav
          aria-label="Pages of writing"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
            marginTop: 'var(--space-10)',
            paddingTop: 'var(--space-6)',
            borderTop: '1px solid var(--border)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
          }}
        >
          {page > 1 ? (
            <Link href={pageHref(page - 1)} rel="prev" style={{ color: 'var(--text-primary)' }}>
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          <span aria-current="page" style={{ color: 'var(--text-muted)' }}>
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={pageHref(page + 1)} rel="next" style={{ color: 'var(--text-primary)' }}>
              Next →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </>
  );
}
