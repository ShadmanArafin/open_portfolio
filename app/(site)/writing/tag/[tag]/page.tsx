import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buildMetadata } from '@/core/content/metadata';
import { currentChannel } from '@/core/pages/read';
import { getPublicWriting, getWritingSettings } from '@/core/writing/read';

// Request-time by nature (Cache Components may block here). Any tag can be asked for; each is read when it is.
export const instant = false;

/**
 * Every piece carrying one tag.
 *
 * Tags were stored on every entry — the importer even fills them from front
 * matter — and shown nowhere, so they did nothing for a reader. A tag with no
 * live pieces is a 404 like any other address that leads nowhere.
 */

async function load(raw: string) {
  const tag = decodeURIComponent(raw).toLowerCase();
  const channel = await currentChannel();
  const [settings, entries] = await Promise.all([
    getWritingSettings(channel),
    getPublicWriting(channel),
  ]);
  const tagged = entries.filter((entry) =>
    (entry.tags ?? []).some((candidate) => candidate.toLowerCase() === tag)
  );
  return { tag, settings, tagged };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag, settings, tagged } = await load((await params).tag);
  // A tag nobody used is a dead address, refusing it before rendering returns 404.
  if (!settings.enabled || tagged.length === 0) notFound();

  return buildMetadata({
    title: `#${tag} — ${settings.label}`,
    description: `Everything under ${settings.label} tagged ${tag}.`,
    path: `/writing/tag/${encodeURIComponent(tag)}`,
  });
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag, settings, tagged } = await load((await params).tag);
  if (!settings.enabled || tagged.length === 0) notFound();

  return (
    <div style={{ paddingBlock: 'var(--section-y)' }}>
      <div
        style={{
          maxWidth: 'var(--container-default)',
          marginInline: 'auto',
          paddingInline: 'var(--gutter)',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-muted)',
            margin: 0,
          }}
        >
          <Link href="/writing" style={{ color: 'inherit' }}>
            {settings.label}
          </Link>
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-4xl)',
            lineHeight: 'var(--leading-tight)',
            margin: 0,
            marginBlock: 'var(--space-2) var(--space-8)',
          }}
        >
          #{tag}
        </h1>
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'grid',
            gap: 'var(--space-6)',
          }}
        >
          {tagged.map((entry) => (
            <li key={entry.id}>
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
                {entry.summary ? (
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
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
