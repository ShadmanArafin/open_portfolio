import React from 'react';
import Link from 'next/link';
import { MAINTAINER, NAV, PRODUCT, REPO, VERSION } from '@/lib/site';

/**
 * Navigation and footer.
 *
 * Two decisions in here that look like omissions and are not.
 *
 * **No star count.** Six of twenty-four projects in the research show one, and
 * the split is almost perfectly by audience — infrastructure tools show it,
 * products sold to non-developers do not. Ours would read zero. It is omitted
 * permanently rather than until the number is flattering, because putting it up
 * later is an admission that the earlier page was hiding something.
 *
 * **Help and Docs are separate destinations.** One is for somebody with a
 * portfolio to run and never shows a terminal command; the other is for
 * somebody running the server. Merging them produces docs that fail both.
 */

export function Nav() {
  return (
    <header className="nav">
      <div className="nav__inner">
        <Link className="nav__brand" href="/">
          {PRODUCT}
          <span className="nav__version">v{VERSION}</span>
        </Link>
        <nav className="nav__links" aria-label="Main">
          {NAV.map((item) =>
            item.external ? (
              <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer">
                {item.label}
              </a>
            ) : (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  );
}

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: 'Product',
    links: [
      { href: '/demo', label: 'Live demo' },
      { href: '/deploy', label: 'Deploy' },
      { href: `${REPO}/blob/main/CHANGELOG.md`, label: 'Changelog' },
      { href: '/what-it-costs', label: 'What it costs' },
    ],
  },
  {
    title: 'Compare',
    links: [
      { href: '/alternatives/adobe-portfolio', label: 'Adobe Portfolio' },
      { href: '/alternatives/squarespace', label: 'Squarespace' },
      { href: '/alternatives/wix', label: 'Wix' },
      { href: '/alternatives/framer', label: 'Framer' },
      { href: '/is-this-right-for-you', label: 'Right for you?' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { href: '/help', label: 'Help centre' },
      { href: '/docs', label: 'Developer docs' },
    ],
  },
  {
    title: 'Project',
    links: [
      { href: REPO, label: 'GitHub' },
      { href: `${REPO}/issues`, label: 'Issues' },
      { href: `${REPO}/blob/main/SECURITY.md`, label: 'Security' },
      { href: `${REPO}/blob/main/CONTRIBUTING.md`, label: 'Contributing' },
      { href: `${REPO}/blob/main/LICENSE`, label: 'Licence' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__cols">
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h2>{column.title}</h2>
              <ul>
                {column.links.map((link) => (
                  <li key={link.href}>
                    {/^https?:/.test(link.href) ? (
                      <a href={link.href} target="_blank" rel="noopener noreferrer">
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href}>{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="footer__strapline">
          MIT licensed. Made by{' '}
          <a href={MAINTAINER.github} target="_blank" rel="noopener noreferrer">
            {MAINTAINER.name}
          </a>
          {MAINTAINER.city ? ` in ${MAINTAINER.city}` : ''}. No investors, no hosted service,
          nothing to sell you.
        </p>
      </div>
    </footer>
  );
}
