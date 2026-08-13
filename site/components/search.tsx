'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';

/**
 * A filter over one section's pages.
 *
 * Scoped to the section it sits in, and that is the point rather than a
 * simplification: a search in the help centre must never return a page about
 * Docker volumes. Somebody who wanted that page is in the wrong section, and
 * handing it to them is how a help centre stops feeling like one.
 *
 * The whole index is in the page, because both sections are small enough that
 * shipping them costs less than any search service would — and it works
 * offline, needs no build step and cannot be down.
 */
export interface Entry {
  slug: string;
  title: string;
  summary: string;
  searchText: string;
}

export function Search({
  entries,
  basePath,
  label,
}: {
  entries: Entry[];
  basePath: string;
  label: string;
}) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    // Every word has to appear somewhere, in any order. Substring matching on
    // the whole phrase makes "domain email" find nothing, which is the shape
    // of query people actually type.
    const words = needle.split(/\s+/);
    return entries
      .filter((entry) => words.every((word) => entry.searchText.includes(word)))
      .slice(0, 8);
  }, [entries, query]);

  return (
    <div className="stack stack--tight" style={{ marginBottom: '1.5rem' }}>
      <label className="stack stack--tight">
        <span className="micro">{label}</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Type a word or two"
          style={{
            width: '100%',
            maxWidth: '28rem',
            minHeight: '2.75rem',
            padding: '0 0.9rem',
            border: '1px solid var(--rule-strong)',
            borderRadius: 'var(--radius)',
            background: 'var(--card)',
            color: 'var(--ink)',
            font: 'inherit',
          }}
        />
      </label>

      {query.trim() && (
        <div aria-live="polite">
          {results.length === 0 ? (
            <p className="small">
              Nothing here matches that. Try one word rather than a sentence, or{' '}
              <a href="https://github.com/ShadmanArafin/open_portfolio/issues">ask about it</a>.
            </p>
          ) : (
            <ul className="rows" style={{ maxWidth: '46rem' }}>
              {results.map((entry) => (
                <li key={entry.slug}>
                  <Link className="rows__label" href={`${basePath}/${entry.slug}`}>
                    {entry.title}
                  </Link>
                  <span className="rows__note">{entry.summary}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
