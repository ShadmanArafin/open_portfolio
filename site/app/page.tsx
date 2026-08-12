import React from 'react';
import type { Metadata } from 'next';
import { Band, Claim, Cta, Rows, Stamp } from '@/components/ui';
import { CLAIMS } from '@/lib/facts';
import { MAINTAINER, PRODUCT, REPO, VERSION } from '@/lib/site';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

/**
 * The homepage.
 *
 * Its job is to classify the product in five seconds for two audiences whose
 * vocabularies never meet — someone who wants a portfolio and does not want to
 * think about a database, and someone who will only take it seriously if it
 * self-hosts. The research settled how: the outcome goes in the headline, and
 * "open source" and "self-hosted" go in the line directly beneath it. Twelve of
 * twenty-four sub-headlines in the surveyed corpus carry those words; only
 * three of twenty-four headlines do.
 *
 * Every feature claim here was checked against the shipped product on the date
 * in `CHECKED_ON`, not against the plan. Where the plan and the product
 * disagree, the product wins and the sentence gets rewritten.
 */
export default function Home() {
  return (
    <>
      <Band rail="Hero" first>
        <div className="stack stack--loose">
          <div className="stack">
            <h1 className="display">
              Build a portfolio site
              <br />
              you own outright.
            </h1>
            <p className="lede">
              {PRODUCT} is a free, open-source website builder for portfolios — a self-hosted
              alternative to Adobe Portfolio, Squarespace, Wix and Framer. Edit every word, image
              and colour from an admin panel. Your content lives in your database, on your domain,
              and it stays there when you stop paying anybody.
            </p>
          </div>

          <div className="stack stack--tight">
            <div className="cta-row">
              <Cta href="/demo">Open the live demo</Cta>
              <Cta href="/deploy" variant="ghost">
                Deploy your own — free
              </Cta>
            </div>
            {/* Three objections killed in eight words. The most imitable
                detail in the whole research corpus. */}
            <p className="micro">MIT licensed · no account needed to try it · nothing to cancel</p>
          </div>
        </div>
      </Band>

      {/*
       * The slot directly below a hero is where a customer logo wall goes. We
       * have no customers, and leaving the most conventional position on the
       * page visibly empty is worse than filling it honestly.
       */}
      <Band rail="Verify" sunken>
        <div className="stack stack--loose">
          <div className="stack">
            <h2 className="title">What you can check right now</h2>
            <p className="lede">
              Nobody is using this yet. There are no customer logos on this page and no
              testimonials, because there are no customers and no users. Here is everything you can
              verify for yourself instead, one click each.
            </p>
          </div>

          <Rows
            items={[
              {
                label: 'MIT licence',
                note: 'Already released, and not revocable for anything already released.',
                stamp: (
                  <a className="stamp stamp--verified" href={`${REPO}/blob/main/LICENSE`}>
                    Read it
                  </a>
                ),
              },
              {
                label: 'One repository',
                note: 'Every commit, every issue, every decision and every reversal.',
                stamp: (
                  <a className="stamp stamp--verified" href={REPO}>
                    Open it
                  </a>
                ),
              },
              {
                label: `Version ${VERSION}, alpha`,
                note: 'The version is on this page because it is alpha, and you should know that before you type in a portfolio.',
                stamp: (
                  <a className="stamp stamp--verified" href={`${REPO}/blob/main/CHANGELOG.md`}>
                    Changelog
                  </a>
                ),
              },
              {
                label: 'docker compose up',
                note: 'One command, app and database together. The container was destroyed and rebuilt against the same volume and every piece of content survived.',
                stamp: <span className="stamp stamp--plain">Tested</span>,
              },
              {
                label: 'Export everything, any time',
                note: 'One JSON file with every word, setting and link. The button exists today; it is not on a roadmap.',
                stamp: <span className="stamp stamp--plain">Shipped</span>,
              },
              {
                label: '676 tests',
                note: 'Including a conformance suite every storage backend must pass before it ships — and the rule that authentication state never travels inside a content export.',
                stamp: (
                  <a className="stamp stamp--verified" href={`${REPO}/actions`}>
                    CI
                  </a>
                ),
              },
            ]}
          />
        </div>
      </Band>

      <Band rail="Steps">
        <div className="stack stack--loose">
          <h2 className="title">Three steps, and none of them is a terminal</h2>

          <div className="grid">
            <div className="card">
              <p className="micro">Step one</p>
              <h3 className="head">Deploy it</h3>
              <p>
                Press the button. Your own copy is created in your own GitHub account with a free
                database attached, and you invent one setup phrase — the only thing you have to
                remember. Or run one Docker command on a machine you already have.
              </p>
            </div>
            <div className="card">
              <p className="micro">Step two</p>
              <h3 className="head">Claim it, answer four questions</h3>
              <p>
                Your name and what you do, the kind of work you show, a colour, then publish. The
                second question renames sections to language that fits your field — a photographer
                gets <em>Portfolio</em> and <em>Brands I&rsquo;ve shot for</em> where a developer
                gets <em>Projects</em> and <em>Stack</em>. Every step is skippable and nothing is
                permanent.
              </p>
            </div>
            <div className="card">
              <p className="micro">Step three</p>
              <h3 className="head">Edit anything, any time</h3>
              <p>
                Click a heading and change it. Swap an image from your library. Add a page, stack
                blocks, set that page&rsquo;s own search description, preview it, publish when you
                are ready. Drafts stay private until you press publish.
              </p>
            </div>
          </div>
        </div>
      </Band>

      <Band rail="Features" sunken>
        <div className="stack stack--loose">
          <h2 className="title">What it does today</h2>

          <div className="grid">
            <div className="card">
              <h3 className="head">Everything on the page is editable</h3>
              <p>
                Work, case studies, clients, experience, education, process, capabilities,
                testimonials, writing, navigation, the footer, the microcopy, the typography, the
                colours and the search metadata all live in a content store rather than in the code.
                If you can see it, you can change it without opening a file.
              </p>
            </div>
            <div className="card">
              <h3 className="head">Pages built from twenty-four blocks</h3>
              <p>
                A hero, text, images, a gallery, figures, cards, a call to action, a contact form,
                questions and answers, a video, a picture beside text, a quote, a newsletter box,
                your social links, what you offer, a file to download, and space. Seven more place
                your own records — including your writing — so updating a project updates every page
                showing it. Your home page is built the same way.
              </p>
            </div>
            <div className="card">
              <h3 className="head">Draft, preview, publish</h3>
              <p>
                Edits save as you type, into a draft. Visitors keep seeing the published version
                until you decide otherwise. Preview a draft at its real address with a banner so you
                never mistake it for the live site. Every publish snapshots the whole site and any
                snapshot can be restored.
              </p>
            </div>
            <div className="card">
              <h3 className="head">It answers the post</h3>
              <p>
                A contact form that actually delivers, an inbox inside the admin so a message is
                never lost if email is misconfigured, and optional SMTP so you are notified. A
                dashboard that runs sixteen checks over your published site, each linking to the
                screen that fixes it.
              </p>
            </div>
            <div className="card">
              <h3 className="head">Six themes, and writing</h3>
              <p>
                Editorial, Terminal, Gallery, Warm, Bold and Minimal — each changing palette,
                typeface, spacing and corner radius together, in light and dark, and each checked
                against the same contrast rules that block publishing. Essays or notes or posts,
                called whatever fits what you do, with RSS.
              </p>
            </div>
            <div className="card">
              <h3 className="head">A mailing list, without a mailing-list account</h3>
              <p>
                Visitors can ask to hear from you. Everyone confirms by email before they are on the
                list, leaving takes one press from the mail client itself, and the list downloads as
                a CSV that Buttondown and Mailchimp import directly. Nothing sends from here — the
                export is the exit.
              </p>
            </div>
          </div>
        </div>
      </Band>

      <Band rail="Costs" id="costs">
        <div className="stack stack--loose">
          <div className="stack">
            <h2 className="title">What it costs to run</h2>
            <p className="lede">
              Nothing, to us. There is no paid tier, no account and nothing to cancel. What you pay
              is whatever your hosting and your domain cost, and these are the real numbers.
            </p>
          </div>

          <div className="table-scroll">
            <table className="data">
              <thead>
                <tr>
                  <th scope="col">Where you run it</th>
                  <th scope="col">Cost</th>
                  <th scope="col">The catch, stated plainly</th>
                  <th scope="col">Source</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Vercel Hobby + a free Neon database</td>
                  <td>$0/month</td>
                  <td>
                    Hobby is for <strong>non-commercial personal use only</strong>. If your
                    portfolio advertises services for sale, read the clause before you use it.
                  </td>
                  <td>
                    <Stamp fact={CLAIMS.vercelHobbyNonCommercial} />
                  </td>
                </tr>
                <tr>
                  <td>Netlify free</td>
                  <td>$0/month</td>
                  <td>
                    Netlify moved to a credit model, and what one credit buys is not published
                    anywhere we could find.
                  </td>
                  <td>
                    <Stamp fact={CLAIMS.netlifyCredits} />
                  </td>
                </tr>
                <tr>
                  <td>Supabase free</td>
                  <td>$0/month</td>
                  <td>
                    Projects pause after about a week of low activity. A portfolio nobody visits for
                    seven days is exactly that profile.
                  </td>
                  <td>
                    <Stamp fact={CLAIMS.supabasePausing} />
                  </td>
                </tr>
                <tr>
                  <td>A server you already have, with Docker</td>
                  <td>Your electricity</td>
                  <td>You maintain it. That is a real commitment, not a formality.</td>
                  <td>—</td>
                </tr>
                <tr>
                  <td>A small VPS</td>
                  <td>A few pounds a month</td>
                  <td>
                    Same as above. We have not price-checked providers, so compare them yourself.
                  </td>
                  <td>—</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="small">
            A domain is roughly £10–15 a year from a registrar of your choosing. We have not
            price-checked registrars, we do not sell domains and we do not take a cut.
          </p>

          <div className="cta-row">
            <Cta href="/what-it-costs" variant="link">
              The whole cost and permanence page →
            </Cta>
          </div>
        </div>
      </Band>

      <Band rail="Ownership" sunken>
        <div className="stack stack--loose">
          <div className="stack">
            <h2 className="title">The part everyone finds out too late</h2>
            <p className="lede">
              Three facts, each from the vendor&rsquo;s own documentation, each with the date we
              read it. Quoting somebody&rsquo;s own support article is the only form of comparison
              that cannot be argued with.
            </p>
          </div>

          <div className="stack stack--loose">
            <Claim id="wixNoExport" />
            <Claim id="squarespacePartialExport" />
            <Claim id="adobeGracePeriod" />
          </div>

          <div className="prose">
            <p>
              Here there is nothing to get out, because it was never in. The database is yours, on
              infrastructure you chose. An export button hands you every word, every setting and
              every link in one JSON file. The code is MIT, so you can fork it, change it, sell what
              you build with it, and keep running the version you have for as long as you like —
              whatever happens to this project.
            </p>
          </div>

          <div className="cta-row">
            <Cta href="/compare" variant="link">
              Compare it properly →
            </Cta>
          </div>
        </div>
      </Band>

      <Band rail="Deploy">
        <div className="stack stack--loose">
          <h2 className="title">Somewhere you chose</h2>

          <div className="grid">
            <div className="card">
              <p className="micro">One click</p>
              <p>
                Vercel copies the repository into your own GitHub account, provisions a free Neon
                database and a blob store for your images, and asks you to invent one setup phrase.
                No keys to find, nothing to install.
              </p>
            </div>
            <div className="card">
              <p className="micro">One command</p>
              <pre
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--t-small)',
                  margin: 0,
                  overflowX: 'auto',
                }}
              >
                docker compose up
              </pre>
              <p>
                On any machine with Docker — a rented server, an old laptop, a Raspberry Pi. App and
                database together. No account anywhere and nothing that phones home.
              </p>
            </div>
            <div className="card">
              <p className="micro">Or a database you already run</p>
              <p>
                Postgres anywhere, Supabase, Neon, or the local filesystem. Whichever
                backend&rsquo;s environment variables are present is the one that gets used, so
                provisioning a database is the only step.
              </p>
            </div>
          </div>

          <div className="cta-row">
            <Cta href="/deploy" variant="link">
              All three, in full →
            </Cta>
          </div>
        </div>
      </Band>

      {/*
       * On the homepage, not on a subpage nobody reads. PocketBase opens its
       * own getting-started page with a red warning and it has not stopped
       * them; Coolify runs a section titled "What Coolify Is Not". Trust at
       * this stage comes from under-promising, not from a pledge.
       */}
      <Band rail="Gaps" id="gaps" sunken>
        <div className="stack stack--loose">
          <div className="stack">
            <h2 className="title">What does not work yet</h2>
            <p className="lede">
              Being direct about this, because the gaps are structural and you should not find them
              after typing in a portfolio.
            </p>
          </div>

          <Rows
            items={[
              {
                label: 'Uploads on hosted object stores',
                note: 'Never run against Vercel Blob or Supabase Storage with real credentials. The code path is the one the local filesystem backend uses and the conformance suite covers the interface — which is not the same as having done it.',
                stamp: <span className="stamp stamp--unverified">Unverified</span>,
              },
              {
                label: 'The admin on a phone',
                note: 'It installs to a home screen and works, but the editing screens were drawn for a desktop. No notifications.',
                stamp: <span className="stamp stamp--unverified">Not built</span>,
              },
              {
                label: 'Five of nine backends',
                note: 'Firebase, Convex, Cloudflare, PocketBase and Appwrite are planned and unbuilt. The four that exist are the four we offer.',
                stamp: <span className="stamp stamp--unverified">Not built</span>,
              },
              {
                label: 'Themes change tokens, not layout',
                note: 'Six of them change colour, type, spacing and radius together. None of them rearranges a page — that comes from the blocks you choose, not the theme.',
                stamp: <span className="stamp stamp--plain">By design, for now</span>,
              },
              {
                label: 'Sign-in',
                note: 'An email and a passphrase. No passkeys, no one-time codes.',
                stamp: <span className="stamp stamp--unverified">Not built</span>,
              },
              {
                label: 'Sending a newsletter',
                note: 'It collects addresses, confirms them and exports them. It does not send. Broadcasting is a different product with different obligations.',
                stamp: <span className="stamp stamp--plain">Deliberate</span>,
              },
            ]}
          />

          <div className="cta-row">
            <Cta href="/is-this-right-for-you" variant="link">
              The honest version, at length →
            </Cta>
          </div>
        </div>
      </Band>

      <Band rail="Maker">
        <div className="stack">
          <h2 className="title">Who is behind this</h2>
          <div className="prose">
            <p>
              One person, {MAINTAINER.name}. This is not a company. There are no investors, no
              staff, no hosted service and nothing to sell you.
            </p>
            <p>
              It exists because a portfolio should not be a subscription, and because every
              open-source option that already existed stopped at the point where somebody
              non-technical needed to write a config file.
            </p>
            <p>
              Bug reports from actually using the admin are the most useful thing anybody can send —
              and you can send one <strong>from inside your own admin</strong>, without visiting
              GitHub. It checks first whether somebody already reported it, and whether it is
              already fixed in a newer version.
            </p>
          </div>
          <div className="cta-row">
            <Cta href={`${REPO}/issues`} variant="ghost">
              Open an issue
            </Cta>
            <Cta href={MAINTAINER.github} variant="ghost">
              {MAINTAINER.name} on GitHub
            </Cta>
          </div>
        </div>
      </Band>

      <Band rail="FAQ" id="faq" sunken>
        <div className="stack stack--loose">
          <h2 className="title">Questions people actually ask</h2>
          <div>
            {FAQ.map((entry) => (
              <details
                key={entry.q}
                style={{ borderTop: '1px solid var(--rule)', paddingBlock: '0.9rem' }}
              >
                <summary
                  style={{
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 'var(--t-sub)',
                    listStyle: 'none',
                    minHeight: '2.75rem',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {entry.q}
                </summary>
                <div className="prose" style={{ paddingTop: '0.5rem' }}>
                  {entry.a}
                </div>
              </details>
            ))}
          </div>
          {/*
           * Visible FAQs, no FAQPage structured data. Google restricted the
           * rich result in August 2023 and removed the documentation in June
           * 2024 because it is no longer shown. Marking it up buys nothing.
           */}
        </div>
      </Band>

      <Band rail="CTA">
        <div className="stack">
          <h2 className="display">A portfolio site you own outright.</h2>
          <p className="lede">
            Try the live demo first. Nothing to sign up for, and it forgets you after an hour.
          </p>
          <div className="cta-row">
            <Cta href="/demo">Open the live demo</Cta>
            <Cta href="/deploy" variant="ghost">
              Deploy your own — free
            </Cta>
          </div>
        </div>
      </Band>
    </>
  );
}

const FAQ: { q: string; a: React.ReactNode }[] = [
  {
    q: 'Is it really free? What is the catch?',
    a: (
      <p>
        No paid tier, no account, nothing gated, and no plan to add any. The catch is that you host
        it, and hosting a thing is a real job — small, but real. The{' '}
        <a href="/what-it-costs">cost page</a> is the honest version.
      </p>
    ),
  },
  {
    q: 'What happens to my site if you stop working on this?',
    a: (
      <p>
        Nothing. It is running on your infrastructure, from a version you already have, under a
        licence that cannot be withdrawn from anything already released. You can fork it. That is
        the whole point of the arrangement and it is not a promise — it is what the licence already
        does.
      </p>
    ),
  },
  {
    q: 'Will you go closed source later?',
    a: (
      <p>
        Everything released so far is MIT and stays MIT — a licence cannot be revoked from a version
        already published. What nobody can honestly promise is what a future version is licensed
        under, and any project telling you otherwise is telling you something it cannot enforce.
        What protects you is that you can keep and fork the version you have.
      </p>
    ),
  },
  {
    q: 'Do I need to know how to code?',
    a: (
      <p>
        No, to use it. Two of the three install paths are a button and one command; the third is for
        people who want to run it from source. After that everything is the admin, and there is a
        separate <a href="/help">help centre</a> that never shows you a terminal.
      </p>
    ),
  },
  {
    q: 'Can I move my existing Squarespace or Wix site over?',
    a: (
      <p>
        Not automatically, and be careful of anyone who says otherwise — Wix has no export at all
        and Squarespace&rsquo;s omits exactly the portfolio and gallery pages you would want. In
        practice you copy your text and re-upload your images. For a portfolio that is an evening,
        not a project.
      </p>
    ),
  },
  {
    q: 'Is it ready to put my actual work on?',
    a: (
      <p>
        It is alpha, and <a href="/is-this-right-for-you">this page</a> says precisely what that
        means and who should wait. The short version: your content is safe — it is in your database,
        exportable at any moment, and an older build quarantines content it does not understand
        rather than dropping it. What is not settled is the admin.
      </p>
    ),
  },
  {
    q: 'What does it look like? Can I change the design?',
    a: (
      <p>
        Six themes, each changing palette, typeface, spacing and radius together in light and dark,
        and you can override any part of one. What a theme cannot yet do is rearrange the page —
        that comes from which blocks you place. The <a href="/demo">demo</a> is the fastest answer.
      </p>
    ),
  },
  {
    q: 'Can I sell websites built with this?',
    a: (
      <p>
        Yes. MIT — use it, fork it, charge for what you build with it. One caution: if you deploy
        client sites on Vercel&rsquo;s Hobby plan, read their non-commercial clause first. It is
        quoted in full on the <a href="/what-it-costs">cost page</a>.
      </p>
    ),
  },
];
