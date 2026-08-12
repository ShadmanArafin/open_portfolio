import type { Metadata } from 'next';
import { Band, Claim, Cta, Stamp } from '@/components/ui';
import { CLAIMS } from '@/lib/facts';
import { PRODUCT, REPO } from '@/lib/site';

export const metadata: Metadata = {
  title: 'What it costs',
  description:
    'There is no paid tier. What you pay is hosting and a domain — with the real numbers, the catches, and Vercel’s non-commercial clause quoted in full.',
  alternates: { canonical: '/what-it-costs' },
};

/**
 * The page that replaces pricing.
 *
 * When nothing is paid, nobody calls it "Pricing" — six replacements were
 * observed in the research and the two projects with the strongest integrity
 * reputations have no money surface at all. Ours is a cost table rather than a
 * price table, which is a better version of the same move: it answers the
 * question the reader actually has, which is not "what do you charge" but "what
 * will this end up costing me".
 *
 * The Vercel clause is the reason this page exists at the length it does. It is
 * the single most dangerous unstated assumption in our own deployment story,
 * and publishing it before anybody asks converts the biggest liability into the
 * section that proves we are being straight.
 */
export default function WhatItCostsPage() {
  return (
    <>
      <Band rail="Costs" first>
        <div className="stack stack--loose">
          <div className="stack">
            <h1 className="display">What it costs</h1>
            <p className="lede">
              Nothing, to us. There is no paid tier, no hosted plan, no account and nothing to
              cancel. What you pay is whatever your hosting and your domain cost — and everything
              below is the real number with the catch attached.
            </p>
          </div>
        </div>
      </Band>

      <Band rail="Hosting" id="hosting" sunken>
        <div className="stack stack--loose">
          <h2 className="title">Hosting</h2>

          <div className="table-scroll">
            <table className="data">
              <thead>
                <tr>
                  <th scope="col">Where</th>
                  <th scope="col">Cost</th>
                  <th scope="col">The catch</th>
                  <th scope="col">Source</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Vercel Hobby + free Neon</th>
                  <td>$0/month</td>
                  <td>
                    Non-commercial personal use only. Read the clause below before you use it for
                    anything you are paid for.
                  </td>
                  <td>
                    <Stamp fact={CLAIMS.vercelHobbyNonCommercial} />
                  </td>
                </tr>
                <tr>
                  <th scope="row">Netlify free</th>
                  <td>$0/month</td>
                  <td>
                    A 300-credit plan. What one credit buys is not published and the credits
                    documentation URL 404s, so we cannot tell you where the ceiling is.
                  </td>
                  <td>
                    <Stamp fact={CLAIMS.netlifyCredits} />
                  </td>
                </tr>
                <tr>
                  <th scope="row">Supabase free</th>
                  <td>$0/month</td>
                  <td>
                    Projects pause after about a week of low activity, with a year to restore. A
                    portfolio nobody visits for a week is that profile exactly.
                  </td>
                  <td>
                    <Stamp fact={CLAIMS.supabasePausing} />
                  </td>
                </tr>
                <tr>
                  <th scope="row">A machine you already own</th>
                  <td>Electricity</td>
                  <td>You maintain it: updates, backups, a certificate. Small, and not nothing.</td>
                  <td>—</td>
                </tr>
                <tr>
                  <th scope="row">A small VPS</th>
                  <td>A few pounds a month</td>
                  <td>
                    Same as above. We have not price-checked providers; compare them yourself.
                  </td>
                  <td>—</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="small">
            A domain is roughly £10–15 a year from any registrar. We do not sell domains, we take no
            cut, and we have not price-checked registrars.
          </p>
        </div>
      </Band>

      <Band rail="Vercel" id="vercel">
        <div className="stack stack--loose">
          <div className="stack">
            <h2 className="title">Before you use Vercel&rsquo;s free plan</h2>
            <p className="lede">
              This is the one thing on this site we would most regret leaving out. Our own
              recommended deployment is Vercel, and their definition of commercial use is broader
              than most people expect.
            </p>
          </div>

          <Claim id="vercelHobbyNonCommercial" />

          <div className="prose">
            <p>
              A portfolio that exists to get you hired, or that lists services you charge for, may
              well fall inside that. A student&rsquo;s coursework portfolio almost certainly does
              not. We are not going to tell you which side of the line your site is on — that is
              Vercel&rsquo;s call, not ours, and their page says to ask their support team if you
              are unsure.
            </p>
            <p>
              <strong>
                What we will say plainly: if your portfolio advertises work you are paid for, budget
                for Vercel Pro or use one of the other options.
              </strong>{' '}
              Running it on your own server carries no such restriction, and neither does any host
              you pay for in the ordinary way.
            </p>
            <p>
              We have not checked whether Netlify&rsquo;s free tier carries an equivalent clause, so
              do not read its presence in the table above as an endorsement of it for commercial
              sites.
            </p>
          </div>
        </div>
      </Band>

      <Band rail="Permanence" id="permanence" sunken>
        <div className="stack stack--loose">
          <h2 className="title">What happens if this project stops</h2>
          <div className="prose">
            <p>
              <strong>Nothing happens to your site.</strong> It is running on your infrastructure,
              from a copy of the code you already have, against a database you control. No licence
              server checks in, nothing phones home, and there is no key that expires.
            </p>
            <p>
              <strong>The licence cannot be withdrawn from what is already released.</strong> MIT is
              irrevocable for a version already published. Fork it, change it, sell what you build
              with it — that permission is already given and cannot be taken back.
            </p>
            <p>
              <strong>What nobody can honestly promise is the licence on a future version.</strong>{' '}
              Projects have relicensed before and some of them said they never would. What actually
              protects you is not a pledge; it is that you can keep and fork the version you have,
              and that your content is in a database you own in a format you can read.
            </p>
            <p>
              <strong>There is no company here to be acquired.</strong> One person, no investors, no
              hosted service and no revenue — which removes the usual reason a project changes its
              terms, and is also the honest risk: a project with one maintainer can simply stop.
              That is why the export button and the licence matter more than any roadmap.
            </p>
          </div>
          <div className="cta-row">
            <Cta href={`${REPO}/blob/main/LICENSE`} variant="ghost">
              Read the licence
            </Cta>
            <Cta href="/is-this-right-for-you" variant="ghost">
              Should you use this at all?
            </Cta>
          </div>
        </div>
      </Band>

      <Band rail="Sustain" id="sustain">
        <div className="stack stack--loose">
          <h2 className="title">How this is paid for</h2>
          <div className="prose">
            <p>
              It is not. There is no funding, no sponsorship, no paid tier and nothing planned. It
              is one person&rsquo;s project and it costs a domain to run.
            </p>
            <p>
              That is worth saying because &ldquo;free forever&rdquo; from a company usually means a
              paid tier is coming. Here there is no company, so the honest statement is narrower and
              more useful: <strong>nothing about the software is gated today</strong>, and if that
              ever changed you would still have the version you already had, under a licence that
              does not expire.
            </p>
          </div>
        </div>
      </Band>

      <Band rail="CTA" sunken>
        <div className="stack">
          <h2 className="title">Try it before any of this matters</h2>
          <p className="lede">{PRODUCT} is free, and the demo needs no account and no host.</p>
          <div className="cta-row">
            <Cta href="/demo">Open the live demo</Cta>
            <Cta href="/deploy" variant="ghost">
              Deploy your own
            </Cta>
          </div>
        </div>
      </Band>
    </>
  );
}
