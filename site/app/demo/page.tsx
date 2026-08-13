import type { Metadata } from 'next';
import { Band, Cta } from '@/components/ui';
import { PRODUCT, REPO } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Live demo',
  description:
    'The admin and the published site, running in your browser with nothing behind them. Seven professions, six themes, no account and nothing saved.',
  alternates: { canonical: '/demo' },
};

/**
 * The demo page.
 *
 * "Demo" is a captured word — six of twenty-four projects in the research use
 * it to mean "talk to a salesperson", and one vendor's `/demo` literally
 * redirects to a sales page. So this page says what it is in the first line and
 * the button says **Open the editor**, not "Request a demo".
 *
 * At zero users the demo *is* the proof, which is why it takes the primary
 * call-to-action slot on the homepage rather than sitting below the fold.
 */
export default function DemoPage() {
  return (
    <>
      <Band rail="Demo" first>
        <div className="stack stack--loose">
          <div className="stack">
            <h1 className="display">Try it, with nothing to sign up for.</h1>
            <p className="lede">
              Not a sales call and not a video. The admin and the published site, running in your
              browser tab with nothing behind them — so you can change anything, publish it and
              break it, and there is no account to make and nothing for anybody else to see.
            </p>
            <p className="lede">
              It is not a mock-up either: the blocks, the block renderer, the theme tokens and the
              editor&rsquo;s own forms are all the product&rsquo;s, imported. What is simulated is
              persistence, sign-in, uploads and email.
            </p>
          </div>

          <div className="cta-row">
            <Cta href="/demo/try">Open the editor</Cta>
            <Cta href={REPO} variant="ghost">
              Read the code
            </Cta>
          </div>

          <p className="micro">No account · nothing saved · seven professions and six themes</p>
        </div>
      </Band>

      <Band rail="Run it" sunken>
        <div className="stack stack--loose">
          <div className="stack">
            <h2 className="title">Or run the whole thing, in one command</h2>
            <p className="lede">
              The browser demo simulates sign-in, saving, uploads and email. If you want those
              working — a real database, a real inbox, a real publish — the product ships a demo
              mode of its own, and it is one command.
            </p>
          </div>

          <pre className="md">
            <code>docker compose -f docker-compose.demo.yml up</code>
          </pre>

          <div className="prose">
            <p>
              Open <code>http://localhost:3000</code> and sign in with the details printed on the
              page. Every browser that visits gets its own copy of the site, held in memory and
              discarded after an hour.
            </p>
            <p>
              That mode is part of the product rather than a sandbox somebody maintains, which is
              the only version of this that stays alive. Every hand-maintained demo instance in the
              research was dead or retired.
            </p>
          </div>
        </div>
      </Band>

      <Band rail="What to try">
        <div className="stack stack--loose">
          <h2 className="title">What to try in the first five minutes</h2>
          <div className="grid">
            <div className="card">
              <h3 className="head">Change a headline and publish</h3>
              <p>
                The loop the whole product is built around. Edit, see the draft, press publish, look
                at the public site.
              </p>
            </div>
            <div className="card">
              <h3 className="head">Reorder the blocks on the page</h3>
              <p>
                Move the contact form above the work, hide the numbers, watch the preview follow.
                This is the part that decides whether the tool is for you.
              </p>
            </div>
            <div className="card">
              <h3 className="head">Add a block, and delete one</h3>
              <p>
                All twenty-four, grouped as your own install groups them. Each arrives empty, which
                is what adding a block actually looks like — including the warning telling you it
                will render nothing until you fill it in.
              </p>
            </div>
            <div className="card">
              <h3 className="head">Switch theme</h3>
              <p>
                Six of them, changing palette, typeface, spacing and radius together. Then change a
                colour on top and switch again — your change survives.
              </p>
            </div>
            <div className="card">
              <h3 className="head">Try to make it unreadable</h3>
              <p>
                Open Appearance and pick a terrible accent. Every text, border and link colour is
                derived from your background and clamped before it is drawn, so it is harder than
                you expect — and a publish-time check catches what clamping cannot.
              </p>
            </div>
          </div>
        </div>
      </Band>

      <Band rail="Limits" sunken>
        <div className="stack stack--loose">
          <div className="stack">
            <h2 className="title">What is real, and what is not</h2>
            <p className="lede">
              Worth being precise about, because a demo that overstates itself is worse than no
              demo.
            </p>
          </div>
          <div className="prose">
            <p>
              <strong>Real, and imported from the product:</strong> every block and the renderer
              that draws them, the theme token generator, the profession vocabulary that renames
              your sections, the editor&rsquo;s forms — which are generated from each block&rsquo;s
              own field metadata — and the content warnings, including the one telling you a block
              will render nothing.
            </p>
            <p>
              <strong>Simulated:</strong> signing in, saving, uploading and email. There is no
              server, so pressing Publish moves one array in your browser to another — and signing
              out drops your edits rather than ending a session, because there is none.
            </p>
            <p>
              <strong>Absent:</strong> three screens that cannot exist without a server, and each
              says so when you open it — uploading a file, saving a service password, and reporting
              a bug through GitHub under your own account.
            </p>
          </div>
          <div className="cta-row">
            <Cta href="/deploy">Deploy your own — free</Cta>
            <Cta href="/is-this-right-for-you" variant="ghost">
              Should you, though?
            </Cta>
          </div>
        </div>
      </Band>
    </>
  );
}
