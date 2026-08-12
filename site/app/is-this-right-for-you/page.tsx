import type { Metadata } from 'next';
import { Band, Cta, Rows } from '@/components/ui';
import { PRODUCT, VERSION } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Is this right for you?',
  description:
    'An honest self-assessment: who should use this today, who should wait, and who should use something else entirely.',
  alternates: { canonical: '/is-this-right-for-you' },
};

/**
 * The page that tells some readers to leave.
 *
 * Borrowed wholesale from the one project in the research whose credibility
 * came from doing exactly this. It works for a reason that is not really about
 * honesty as a virtue: a reader who has already decided you will oversell will
 * discount everything else on the site, and the only way to interrupt that is
 * to say the disqualifying thing before they find it.
 *
 * The rule for this page: **no sentence may end with a clause that takes back
 * the sentence.** "It is alpha, but…" is worth nothing.
 */
export default function RightForYouPage() {
  return (
    <>
      <Band rail="Assess" first>
        <div className="stack stack--loose">
          <div className="stack">
            <h1 className="display">Is this right for you?</h1>
            <p className="lede">
              {PRODUCT} is version {VERSION} and it is alpha. Rather than define that word, here is
              precisely what it means for you, and three groups of people who should do three
              different things.
            </p>
          </div>
        </div>
      </Band>

      <Band rail="Use it" sunken>
        <div className="stack stack--loose">
          <h2 className="title">Use it today if</h2>
          <Rows
            items={[
              {
                label: 'You are a student or early in your career',
                note: 'A portfolio you own, for the price of a domain, that will not be held hostage when money is tight. The risk of an alpha is lowest exactly here.',
              },
              {
                label: 'You are already comfortable with GitHub',
                note: 'Then the deploy is five minutes and rolling back a bad update is one click. Nothing about the rest of it needs code.',
              },
              {
                label: 'Your site is words, pictures and a contact form',
                note: 'That is what this does well. Twenty-two blocks, six themes, real search metadata, an inbox that works.',
              },
              {
                label: 'You have been burned by a subscription',
                note: 'Content in your own database, an export button, an MIT licence. The whole design answers this specific grievance.',
              },
              {
                label: 'You self-host things already',
                note: 'One Docker command, Postgres, no account anywhere, nothing that phones home.',
              },
            ]}
          />
        </div>
      </Band>

      <Band rail="Wait">
        <div className="stack stack--loose">
          <h2 className="title">Wait a version or two if</h2>
          <Rows
            items={[
              {
                label: 'You need to edit from a phone regularly',
                note: 'The admin installs to a home screen and works, but the screens were drawn for a desktop. It is the next substantial piece of work.',
                stamp: <span className="stamp stamp--unverified">Not built</span>,
              },
              {
                label: 'You want a specific visual design',
                note: 'Six themes change colour, type, spacing and radius. None of them rearranges a page — arrangement comes from which blocks you place.',
                stamp: <span className="stamp stamp--plain">Bounded by design</span>,
              },
              {
                label: 'Your work is hundreds of pieces',
                note: 'The whole site is saved as one document on every change. Fine for a portfolio; not the shape for a four-hundred-post archive.',
                stamp: <span className="stamp stamp--plain">Known limit</span>,
              },
              {
                label: 'You need image uploads to a hosted object store, today',
                note: 'Uploads work on the local filesystem and are verified there and in Docker. They have never been run against Vercel Blob or Supabase Storage with live credentials.',
                stamp: <span className="stamp stamp--unverified">Unverified</span>,
              },
            ]}
          />
        </div>
      </Band>

      <Band rail="Don't" sunken>
        <div className="stack stack--loose">
          <h2 className="title">Use something else if</h2>
          <Rows
            items={[
              {
                label: 'You need to sell anything',
                note: 'No shop, no bookings, no memberships, no paid content — and none of it is planned. Squarespace and Wix both do this today.',
              },
              {
                label: 'The visual design is the work',
                note: 'If you are a designer being hired for visual range, Framer, Cargo and Semplice are all better answers to that problem than this is.',
              },
              {
                label: 'You want somebody to phone',
                note: 'There is no support desk, no status page and nobody on call. Questions go to one person on GitHub, answered in their own time.',
              },
              {
                label: 'You will not manage a host',
                note: 'Somebody has to press deploy and own a domain. Wix will publish a site today with an advertising banner on it, and Behance and Contra will give you a profile with no setup at all.',
              },
            ]}
          />
        </div>
      </Band>

      <Band rail="Risk">
        <div className="stack stack--loose">
          <div className="stack">
            <h2 className="title">What &ldquo;alpha&rdquo; actually risks</h2>
            <p className="lede">Separating the part that would hurt from the part that annoys.</p>
          </div>

          <div className="grid">
            <div className="card">
              <h3 className="head">Your content is the safe part</h3>
              <p>
                It is in your database. You can export all of it at any moment as one JSON file. An
                older build quarantines content it does not recognise rather than dropping it, so a
                rollback cannot destroy what a newer version wrote. Concurrent edits are detected
                rather than silently overwriting each other, and the last twenty published snapshots
                can each be restored.
              </p>
            </div>
            <div className="card">
              <h3 className="head">The admin is the unsettled part</h3>
              <p>
                Screens move, get renamed and get rebuilt between versions. If you learn where
                something is, it may be somewhere else in three months. That is the actual cost of
                using this now, and it is an irritation rather than a loss.
              </p>
            </div>
            <div className="card">
              <h3 className="head">One maintainer is the real risk</h3>
              <p>
                Not that the code is bad — that a project with one person behind it can simply stop.
                What makes that survivable is the same thing that makes the rest of it work: your
                site keeps running, your content is exportable, and the licence on what has already
                been released cannot be withdrawn.
              </p>
            </div>
          </div>
        </div>
      </Band>

      <Band rail="CTA" sunken>
        <div className="stack">
          <h2 className="title">Twenty minutes will tell you more than this page</h2>
          <p className="lede">
            The demo gives you a full editor with nothing to sign up for. It forgets you after an
            hour.
          </p>
          <div className="cta-row">
            <Cta href="/demo">Open the live demo</Cta>
            <Cta href="/compare" variant="ghost">
              Compare with what you use now
            </Cta>
          </div>
        </div>
      </Band>
    </>
  );
}
