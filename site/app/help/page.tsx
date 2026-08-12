import type { Metadata } from 'next';
import Link from 'next/link';
import { DocShell } from '@/components/doc-shell';
import { Search } from '@/components/search';
import { getDocs, getGroups } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Help centre',
  description:
    'How to get your portfolio online, edit it, point a domain at it and fix it when something goes wrong. No terminal commands.',
  alternates: { canonical: '/help' },
};

/**
 * The help centre index.
 *
 * All how-to, deliberately. Diátaxis makes the point directly: a rich list of
 * how-to guides is an encouraging suggestion of what a product can do. A
 * reference section here would be a reference to nothing the reader controls.
 */
export default function HelpIndex() {
  const groups = getGroups('help');
  const docs = getDocs('help');

  return (
    <DocShell groups={groups} basePath="/help">
      <div className="stack stack--loose">
        <div className="stack">
          <h1 className="title">Help centre</h1>
          <p className="lede">
            For anyone with a portfolio to run. Nothing on these pages asks you to open a terminal —
            where a task genuinely needs one, it says so and links across to the developer docs.
          </p>
        </div>

        <Search
          entries={docs.map(({ slug, title, summary, searchText }) => ({
            slug,
            title,
            summary,
            searchText,
          }))}
          basePath="/help"
          label="Search the help centre"
        />

        {groups.map((group) => (
          <section className="stack" key={group.title}>
            <h2 className="head">{group.title}</h2>
            <ul className="rows">
              {group.docs.map((doc) => (
                <li key={doc.slug}>
                  <Link className="rows__label" href={`/help/${doc.slug}`}>
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
