import Link from 'next/link';
import { tagHref, type TocEntry } from '@/core/writing/reading';

/**
 * The frame around a piece of writing: its title and what to expect above,
 * a contents list for a long piece, and the way on at the end. Server
 * components in the site's own tokens, like the index they sit beside.
 */

const column: React.CSSProperties = {
  maxWidth: 'var(--container-default)',
  marginInline: 'auto',
  paddingInline: 'var(--gutter)',
};
const meta: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--text-xs)',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};

export function TagList({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <ul
      aria-label="Tags"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-2)',
        listStyle: 'none',
        margin: 0,
        padding: 0,
      }}
    >
      {tags.map((tag) => (
        <li key={tag}>
          <Link
            href={tagHref(tag)}
            style={{
              ...meta,
              display: 'inline-flex',
              alignItems: 'center',
              minHeight: 24,
              paddingInline: 'var(--space-3)',
              border: 'var(--hairline) solid var(--border-color)',
              borderRadius: 999,
              color: 'var(--text-secondary)',
              textDecoration: 'none',
            }}
          >
            #{tag}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function EntryHeader({
  title,
  summary,
  date,
  minutes,
  tags,
}: {
  title: string;
  summary?: string;
  date?: string;
  minutes: number;
  tags: string[];
}) {
  return (
    <header
      style={{
        ...column,
        paddingBlockStart: 'var(--section-y)',
        display: 'grid',
        gap: 'var(--space-4)',
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-4xl)',
          lineHeight: 'var(--leading-tight)',
          letterSpacing: 'var(--tracking-tight)',
          margin: 0,
        }}
      >
        {title}
      </h1>
      {summary ? (
        <p
          style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--text-secondary)',
            margin: 0,
            maxWidth: 'var(--measure)',
          }}
        >
          {summary}
        </p>
      ) : null}
      <p style={{ ...meta, margin: 0 }}>
        {date ? (
          <>
            <time dateTime={date}>
              {new Date(date).toLocaleDateString('en-GB', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            {' · '}
          </>
        ) : null}
        {minutes} min read
      </p>
      <TagList tags={tags} />
    </header>
  );
}

/** Shown from three headings up: a short piece needs no map. */
export function Contents({ toc }: { toc: TocEntry[] }) {
  if (toc.length < 3) return null;
  return (
    <nav aria-label="Contents" style={{ ...column, paddingBlockStart: 'var(--space-6)' }}>
      <p style={{ ...meta, margin: 0, marginBottom: 'var(--space-2)' }}>Contents</p>
      <ol
        style={{
          margin: 0,
          paddingInlineStart: '1.25em',
          fontFamily: 'var(--font-body)',
          display: 'grid',
          gap: 'var(--space-1)',
        }}
      >
        {toc.map((entry) => (
          <li key={entry.anchor}>
            <a href={`#${entry.anchor}`} style={{ color: 'var(--link-color)' }}>
              {entry.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Neighbours({
  previous,
  next,
}: {
  previous: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}) {
  if (!previous && !next) return null;
  const card = (entry: { slug: string; title: string }, label: string, align: 'start' | 'end') => (
    <Link
      href={`/writing/${entry.slug}`}
      rel={label === 'Previous' ? 'prev' : 'next'}
      style={{
        display: 'grid',
        gap: 'var(--space-1)',
        textAlign: align,
        textDecoration: 'none',
        color: 'inherit',
        padding: 'var(--space-4)',
        border: 'var(--hairline) solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <span style={meta}>{label}</span>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)' }}>
        {entry.title}
      </span>
    </Link>
  );
  return (
    <nav
      aria-label="More writing"
      style={{
        ...column,
        paddingBlock: 'var(--section-y)',
        display: 'grid',
        gap: 'var(--space-4)',
        gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))',
      }}
    >
      {previous ? card(previous, 'Previous', 'start') : <span />}
      {next ? card(next, 'Next', 'end') : null}
    </nav>
  );
}

/** Pieces that share a tag with this one; nothing when none do. */
export function Related({
  entries,
}: {
  entries: { slug: string; title: string; summary?: string }[];
}) {
  if (entries.length === 0) return null;
  return (
    <section
      aria-labelledby="related-heading"
      style={{
        ...column,
        paddingBottom: 'var(--section-y)',
        display: 'grid',
        gap: 'var(--space-4)',
      }}
    >
      <h2 id="related-heading" style={{ ...meta, margin: 0, fontWeight: 400 }}>
        Related
      </h2>
      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'grid',
          gap: 'var(--space-4)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))',
        }}
      >
        {entries.map((entry) => (
          <li key={entry.slug}>
            <Link
              href={`/writing/${entry.slug}`}
              style={{
                display: 'grid',
                gap: 'var(--space-1)',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)' }}>
                {entry.title}
              </span>
              {entry.summary ? (
                <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                  {entry.summary}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
