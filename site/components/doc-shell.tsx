import React from 'react';
import Link from 'next/link';
import type { Group } from '@/lib/content';

/**
 * The frame both content sections share.
 *
 * One component and one stylesheet for the help centre and the developer docs,
 * which is the reason this site does not use a documentation framework: the
 * research is explicit that the help centre has to look like the marketing
 * site, and running a second design system inside the same deployment to gain
 * MDX would put a visible seam between two halves of the same site.
 *
 * The nav is generated from the files on disk. There is no second file listing
 * the pages, because a hand-maintained index is a thing that falls out of step
 * with the directory it describes.
 */
export function DocShell({
  groups,
  basePath,
  current,
  children,
}: {
  groups: Group[];
  basePath: '/help' | '/docs';
  current?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="doc">
      <nav className="doc__nav" aria-label={basePath === '/help' ? 'Help centre' : 'Documentation'}>
        {groups.map((group) => (
          <div className="doc__group" key={group.title}>
            <h2>{group.title}</h2>
            <ul>
              {group.docs.map((doc) => (
                <li key={doc.slug}>
                  <Link
                    href={`${basePath}/${doc.slug}`}
                    aria-current={doc.slug === current ? 'page' : undefined}
                  >
                    {doc.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="doc__group">
          <h2>The other one</h2>
          <ul>
            <li>
              {/*
               * Ghost's pattern, and the only structural answer found anywhere
               * to "documentation for non-technical people": split by person
               * first. The help centre never shows a terminal command; the
               * developer docs never explain what a hero section is. Each links
               * across rather than trying to serve both.
               */}
              <Link href={basePath === '/help' ? '/docs' : '/help'}>
                {basePath === '/help'
                  ? 'Developer docs — running the server'
                  : 'Help centre — using the admin'}
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      <div>{children}</div>
    </div>
  );
}
