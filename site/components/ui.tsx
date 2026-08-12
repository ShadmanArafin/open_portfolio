import React from 'react';
import Link from 'next/link';
import { CLAIMS, type ClaimKey, type Fact } from '@/lib/facts';

/**
 * The pieces every page is assembled from.
 *
 * Small on purpose. The site is a stack of bands, some rows, some cards and the
 * provenance stamp — and the stamp is the only one that carries an idea.
 */

/* ------------------------------------------------------------------ bands */

/**
 * One full-width section.
 *
 * `rail` is the label in the left margin, and it names the **block type** this
 * band would be in the product — `HERO`, `FAQ`, `SERVICES`. Numbering the
 * sections `01 / 02 / 03` would say nothing; naming them says that this page is
 * built out of the same twenty-two pieces the product gives you, which is the
 * quietest possible way to make the argument.
 */
export function Band({
  rail,
  id,
  first,
  sunken,
  children,
}: {
  rail: string;
  id?: string;
  first?: boolean;
  sunken?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={['band', first ? 'band--first' : '', sunken ? 'band--sunken' : '']
        .filter(Boolean)
        .join(' ')}
    >
      <div className="band__inner">
        <p className="band__rail">{rail}</p>
        <div className="band__body">{children}</div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- stamps */

const STATUS_LABEL: Record<Fact['status'], string> = {
  verified: 'Verified',
  'third-party': 'Third party',
  unverified: 'Unverified',
};

/**
 * The provenance chip.
 *
 * A link, always, because a stamp you cannot follow is a sticker. The date is
 * part of the label rather than a tooltip: a claim about a competitor's pricing
 * is worth exactly as much as the day it was read, and hiding that is how
 * comparison pages end up describing a product that changed a year ago.
 */
export function Stamp({ fact }: { fact: Fact }) {
  const tone =
    fact.status === 'verified'
      ? 'stamp--verified'
      : fact.status === 'unverified'
        ? 'stamp--unverified'
        : 'stamp--plain';

  return (
    <a
      className={`stamp ${tone}`}
      href={fact.source}
      target="_blank"
      rel="noopener noreferrer"
      title={`${fact.sourceLabel} — checked ${fact.checked}`}
    >
      {STATUS_LABEL[fact.status]} · {fact.checked}
    </a>
  );
}

/** A sourced claim, set as a pull quote with its stamp underneath. */
export function Claim({ id }: { id: ClaimKey }) {
  const fact = CLAIMS[id] as Fact;
  return (
    <figure className="pullquote">
      <blockquote>{fact.claim}</blockquote>
      <figcaption>
        <Stamp fact={fact} />
        <span>{fact.sourceLabel}</span>
        {fact.caveat && <span className="small">{fact.caveat}</span>}
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------- bits */

export function Rows({
  items,
}: {
  items: { label: string; note: React.ReactNode; stamp?: React.ReactNode }[];
}) {
  return (
    <ul className="rows">
      {items.map((item) => (
        <li key={item.label}>
          <span className="rows__label">{item.label}</span>
          <span className="rows__note">{item.note}</span>
          {item.stamp}
        </li>
      ))}
    </ul>
  );
}

export function Cta({
  href,
  children,
  variant = 'primary',
}: {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'ghost' | 'link';
}) {
  const className =
    variant === 'primary' ? 'btn' : variant === 'ghost' ? 'btn btn--ghost' : 'btn--link';

  // An external link is a plain anchor; `next/link` buys nothing off-site and
  // prefetching somebody else's page is a request they did not ask for.
  if (/^https?:/.test(href)) {
    return (
      <a className={className} href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link className={className} href={href}>
      {children}
    </Link>
  );
}
