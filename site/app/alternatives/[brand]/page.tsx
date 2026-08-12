import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Band, Claim, Cta } from '@/components/ui';
import { ALTERNATIVES, getAlternative } from '@/lib/alternatives';
import { PRODUCT } from '@/lib/site';

export function generateStaticParams() {
  return ALTERNATIVES.map((entry) => ({ brand: entry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const entry = getAlternative((await params).brand);
  if (!entry) return {};
  return {
    title: entry.title,
    description: entry.description,
    alternates: { canonical: `/alternatives/${entry.slug}` },
  };
}

/**
 * One page per incumbent.
 *
 * The order is the argument. The verdict comes first, before any table — a
 * comparison page that makes the reader assemble the conclusion from twelve
 * rows is one they leave. Then who should stay where they are, *before* who
 * should switch, because a page that cannot name somebody it is wrong for is
 * not being read as information.
 *
 * The concessions are a fixed section rather than a sentence tucked into a row.
 * Every page names at least two things the other product does better, and if
 * two could not be found honestly, the page does not ship.
 */
export default async function AlternativePage({ params }: { params: Promise<{ brand: string }> }) {
  const entry = getAlternative((await params).brand);
  if (!entry) notFound();

  return (
    <>
      <Band rail="Verdict" first>
        <div className="stack stack--loose">
          <div className="stack">
            <p className="micro">{PRODUCT} compared with</p>
            <h1 className="display">{entry.brand}</h1>
            <p className="lede">{entry.verdict}</p>
          </div>
          <div className="cta-row">
            <Cta href="/demo">See ours first</Cta>
            <Cta href="/is-this-right-for-you" variant="ghost">
              Is it right for you?
            </Cta>
          </div>
        </div>
      </Band>

      <Band rail="Who" sunken>
        <div className="grid">
          <div className="card">
            <h2 className="head">Stay with {entry.brand} if</h2>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'grid', gap: '0.5rem' }}>
              {entry.stayIf.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div className="card">
            <h2 className="head">Look at this if</h2>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'grid', gap: '0.5rem' }}>
              {entry.switchIf.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
      </Band>

      <Band rail="Sources">
        <div className="stack stack--loose">
          <div className="stack">
            <h2 className="title">From {entry.brand}&rsquo;s own documentation</h2>
            <p className="lede">
              Every claim below links to the page it came from and says when it was read. Quoting a
              vendor&rsquo;s own support article is the only form of comparison that cannot be
              argued with — and a claim with no date is worth nothing a year later.
            </p>
          </div>
          <div className="stack stack--loose">
            {entry.claims.map((key) => (
              <Claim key={key} id={key} />
            ))}
          </div>
        </div>
      </Band>

      <Band rail="Side by side" sunken>
        <div className="stack stack--loose">
          <h2 className="title">Side by side</h2>
          <div className="table-scroll">
            <table className="data">
              <thead>
                <tr>
                  <th scope="col">Question</th>
                  <th scope="col">{entry.brand}</th>
                  <th scope="col">{PRODUCT}</th>
                </tr>
              </thead>
              <tbody>
                {entry.rows.map((row) => (
                  <tr key={row.question}>
                    <th scope="row" style={{ fontWeight: 600 }}>
                      {row.question}
                    </th>
                    <td>{row.them}</td>
                    <td>{row.us}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Band>

      {/*
       * The section that makes the rest of the page believable. It is not a
       * courtesy: the reader has used the other product and knows what it does
       * well, so a page that never says so is telling them it is not written
       * for somebody who knows anything.
       */}
      <Band rail="Concessions">
        <div className="stack stack--loose">
          <div className="stack">
            <h2 className="title">What {entry.brand} does better</h2>
            <p className="lede">
              Not a formality, and there is no &ldquo;but&rdquo; after any of them.
            </p>
          </div>
          <div className="grid">
            {entry.betterThere.map((item) => (
              <div className="card" key={item.title}>
                <h3 className="head">{item.title}</h3>
                <p>{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </Band>

      <Band rail="CTA" sunken>
        <div className="stack">
          <h2 className="title">Have a look before you decide</h2>
          <p className="lede">
            The demo is the fastest way to know whether this is enough for you. It needs no account
            and forgets you after an hour.
          </p>
          <div className="cta-row">
            <Cta href="/demo">Open the live demo</Cta>
            <Cta href="/compare" variant="ghost">
              Compare all four
            </Cta>
          </div>
        </div>
      </Band>
    </>
  );
}
