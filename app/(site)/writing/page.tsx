import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { buildMetadata } from '@/core/content/metadata';
import { currentChannel } from '@/core/pages/read';
import { getPublicWriting, getWritingSettings } from '@/core/writing/read';

/**
 * The index. Whatever the owner calls it.
 *
 * A fixed route rather than one derived from the configured slug: Next needs
 * the path at build time, and a settings-driven route would mean a rewrite in
 * middleware for a rename almost nobody performs. The label is what people
 * read; the address is `/writing` and that is not worth a layer of indirection.
 */

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getWritingSettings(await currentChannel());
  return buildMetadata({ title: settings.label, path: '/writing' });
}

export default async function WritingIndex() {
  const channel = await currentChannel();
  const [settings, entries] = await Promise.all([
    getWritingSettings(channel),
    getPublicWriting(channel),
  ]);

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

        {entries.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
            Nothing here yet.
          </p>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {entries.map((entry) => (
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
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
