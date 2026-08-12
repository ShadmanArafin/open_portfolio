import type { Metadata } from 'next';
import Link from 'next/link';
import { Band, Cta } from '@/components/ui';
import { ALTERNATIVES } from '@/lib/alternatives';
import { CHECKED_ON, PRODUCT } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Compare',
  description:
    'How this compares with Adobe Portfolio, Squarespace, Wix and Framer — with every competitor claim sourced, dated, and a section on each page for what they do better.',
  alternates: { canonical: '/compare' },
};

/**
 * The comparison index.
 *
 * "Compare" as a top-level navigation item is unusual — one site in the
 * twenty-four surveyed does it — and it is right here, because comparison is
 * the frame this audience arrives with. Nobody wakes up wanting an open-source
 * portfolio builder; they wake up annoyed with the one they have.
 */
export default function ComparePage() {
  return (
    <>
      <Band rail="Compare" first>
        <div className="stack stack--loose">
          <div className="stack">
            <h1 className="display">Compare</h1>
            <p className="lede">
              Four products people leave to come here, and the honest version of each. Every claim
              about somebody else&rsquo;s product links to their own page and carries the date we
              read it, and every page has a section on what they do better than this.
            </p>
          </div>
          <p className="micro">All claims re-checked {CHECKED_ON}</p>
        </div>
      </Band>

      <Band rail="Pages" sunken>
        <div className="grid">
          {ALTERNATIVES.map((entry) => (
            <div className="card" key={entry.slug}>
              <h2 className="head">
                <Link href={`/alternatives/${entry.slug}`}>{entry.brand}</Link>
              </h2>
              <p>{entry.verdict}</p>
              <p>
                <Link className="btn--link" href={`/alternatives/${entry.slug}`}>
                  Read the comparison →
                </Link>
              </p>
            </div>
          ))}
        </div>
      </Band>

      <Band rail="Method">
        <div className="stack stack--loose">
          <h2 className="title">How these pages are written</h2>
          <div className="prose">
            <p>
              <strong>Nothing about another product appears without a source and a date.</strong>{' '}
              Pricing changes, features are added and support articles are rewritten. A comparison
              page with no dates on it is describing a product as it was on some unknown day, and
              most of them are describing one that no longer exists.
            </p>
            <p>
              <strong>Where we could not verify something, it says so.</strong> Netlify&rsquo;s
              credit model is on the cost page marked unverified, because what one credit buys is
              not published and the documentation URL for it returns a 404. Wix&rsquo;s prices come
              from two named third parties, because their own page is rendered in JavaScript and
              could not be read. Neither is rounded up into a fact.
            </p>
            <p>
              <strong>Every page names at least two things the other product does better</strong>,
              specifically, with no hedging clause afterwards. If two could not be found honestly,
              the page would not exist. You have used these products; a page that pretends they have
              no advantages is telling you it was not written for somebody who knows anything.
            </p>
            <p>
              <strong>No logos and no screenshots of anybody else&rsquo;s product.</strong> Naming a
              product in text to describe what it does is ordinary and fair; reproducing a mark is a
              different thing and buys nothing.
            </p>
          </div>
        </div>
      </Band>

      <Band rail="CTA" sunken>
        <div className="stack">
          <h2 className="title">Or skip all of it</h2>
          <p className="lede">
            {PRODUCT} is free and the demo needs no account. Twenty minutes with it will tell you
            more than any of these pages.
          </p>
          <div className="cta-row">
            <Cta href="/demo">Open the live demo</Cta>
            <Cta href="/is-this-right-for-you" variant="ghost">
              Is this right for you?
            </Cta>
          </div>
        </div>
      </Band>
    </>
  );
}
