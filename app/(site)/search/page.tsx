import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '@/core/content/metadata';
import { getPublishedProjects } from '@/core/content/read';
import { getIndexablePages } from '@/core/pages/read';
import { getPublicWriting, getWritingSettings } from '@/core/writing/read';
import { buildSearchIndex, MAX_QUERY, searchIndex } from '@/core/content/search';
import { SearchForm } from './search-form';

/**
 * Search, rendered on the server from the published site.
 *
 * Only what a visitor could already reach and what search engines may index:
 * published work, published pages not marked "keep out of search", and live
 * writing. A results page is never indexed itself — an endless set of
 * addresses with thin content is what search engines penalise.
 */

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await buildMetadata({ title: 'Search', path: '/search' })),
    robots: 'noindex, follow',
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const raw = (await searchParams).q;
  const query = (Array.isArray(raw) ? raw[0] : (raw ?? '')).trim().slice(0, MAX_QUERY);

  const [projects, pages, writingSettings, writing] = await Promise.all([
    getPublishedProjects(),
    getIndexablePages(),
    getWritingSettings('published'),
    getPublicWriting('published'),
  ]);
  const results = query
    ? searchIndex(
        buildSearchIndex({
          projects,
          pages,
          writing: writingSettings.enabled ? writing.filter((entry) => !entry.seo.noindex) : [],
        }),
        query
      )
    : [];

  return (
    <div
      style={{
        paddingBlock: 'var(--section-y)',
        maxWidth: 'var(--container-default)',
        marginInline: 'auto',
        paddingInline: 'var(--gutter)',
        display: 'grid',
        gap: 'var(--space-8)',
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-4xl)',
          lineHeight: 'var(--leading-tight)',
          margin: 0,
        }}
      >
        Search
      </h1>
      <SearchForm query={query} />

      {query ? (
        <section
          aria-labelledby="results-heading"
          style={{ display: 'grid', gap: 'var(--space-6)' }}
        >
          <h2
            id="results-heading"
            role="status"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              fontWeight: 400,
              color: 'var(--text-secondary)',
              margin: 0,
            }}
          >
            {results.length === 0
              ? `Nothing matches “${query}”. Try fewer or different words.`
              : `${results.length} result${results.length === 1 ? '' : 's'} for “${query}”`}
          </h2>
          {results.length > 0 ? (
            <ol
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'grid',
                gap: 'var(--space-6)',
              }}
            >
              {results.map((result) => (
                <li key={result.href} style={{ display: 'grid', gap: 'var(--space-1)' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {result.kind}
                  </span>
                  <Link
                    href={result.href}
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'var(--text-xl)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {result.title}
                  </Link>
                  {result.snippet ? (
                    <p
                      style={{
                        margin: 0,
                        color: 'var(--text-secondary)',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      {result.snippet}
                    </p>
                  ) : null}
                </li>
              ))}
            </ol>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
