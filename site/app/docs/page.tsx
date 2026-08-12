import type { Metadata } from 'next';
import Link from 'next/link';
import { DocShell } from '@/components/doc-shell';
import { Search } from '@/components/search';
import { getDocs, getGroups } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Developer docs',
  description:
    'Install paths, self-hosting, every environment variable, the storage adapter contract, the block system and the theme token layer.',
  alternates: { canonical: '/docs' },
};

/**
 * The developer docs index.
 *
 * Full Diátaxis here — how-to, reference and explanation — because the reader
 * is somebody who will need all three, and because "why is it built this way"
 * is the question that decides whether anybody contributes.
 */
export default function DocsIndex() {
  const groups = getGroups('docs');
  const docs = getDocs('docs');

  return (
    <DocShell groups={groups} basePath="/docs">
      <div className="stack stack--loose">
        <div className="stack">
          <h1 className="title">Developer docs</h1>
          <p className="lede">
            For anyone running the server, contributing, or building on it. These pages never
            explain what a hero section is — that is the <Link href="/help">help centre</Link>, and
            it is a different reader.
          </p>
        </div>

        <Search
          entries={docs.map(({ slug, title, summary, searchText }) => ({
            slug,
            title,
            summary,
            searchText,
          }))}
          basePath="/docs"
          label="Search the docs"
        />

        {groups.map((group) => (
          <section className="stack" key={group.title}>
            <h2 className="head">{group.title}</h2>
            <ul className="rows">
              {group.docs.map((doc) => (
                <li key={doc.slug}>
                  <Link className="rows__label" href={`/docs/${doc.slug}`}>
                    {doc.title}
                  </Link>
                  <span className="rows__note">{doc.summary}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </DocShell>
  );
}
