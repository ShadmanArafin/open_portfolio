import type { Metadata } from 'next';
import { Band, Cta } from '@/components/ui';
import { PRODUCT, REPO } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Live demo',
  description:
    'A full editor with nothing to sign up for. Every visitor gets their own copy of the site, in memory, discarded after an hour.',
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
              Not a sales call and not a video. A real editor, with your own copy of a real site in
              it. Every visitor gets a separate sandbox held in memory and thrown away after an
              hour, so you can change anything, publish it, and break it, and nobody else sees any
              of it.
            </p>
          </div>

          <div className="cta-row">
            {/*
             * Deliberately not linked yet. A dead "Open the editor" button is
             * worse than an honest note — and this page ships before the demo
             * instance is deployed, because the pages that link here need it to
             * exist.
             */}
            <Cta href="/deploy">Deploy your own instead — free</Cta>
            <Cta href={REPO} variant="ghost">
              Read the code
            </Cta>
          </div>

          <p className="micro">
            The hosted demo is not up yet — see below for running it in one command
          </p>
        </div>
      </Band>

      <Band rail="Run it" sunken>
        <div className="stack stack--loose">
          <div className="stack">
            <h2 className="title">Run the demo yourself, in one command</h2>
            <p className="lede">
              The demo mode is part of the product rather than a hosted sandbox somebody maintains —
              which is the only version of this that stays alive. Every hand-maintained demo
              instance in the research was dead or retired.
            </p>
          </div>

          <pre className="md">
            <code>docker compose -f docker-compose.demo.yml up</code>
          </pre>

          <div className="prose">
            <p>
              Open <code>http://localhost:3000</code>. Sign in with the details printed on the page.
              Every browser that visits gets its own copy.
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
              <h3 className="head">Add a page and stack blocks on it</h3>
              <p>
                Add a hero, then &ldquo;Your work&rdquo;, then a contact form. Reorder them. Hide
                one. This is the part that decides whether the tool is for you.
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
              <h3 className="head">Try to break the colours</h3>
              <p>
                Set a pale accent on a pale background and press publish. It is refused, and the
                message names the two colours.
              </p>
            </div>
          </div>
        </div>
      </Band>

      <Band rail="Limits" sunken>
        <div className="stack stack--loose">
          <div className="stack">
            <h2 className="title">What the demo will not let you do</h2>
            <p className="lede">
              Three things are switched off, and they are the three that turn a public sandbox into
              somebody else&rsquo;s problem within a day of being noticed.
            </p>
          </div>
          <div className="prose">
            <p>
              <strong>Uploading files.</strong> A public editor with file upload is a free file
              host. Images are picked from a library that is already there.
            </p>
            <p>
              <strong>Sending email.</strong> A public contact form that sends from a real domain is
              a spam relay. Messages still arrive in the demo inbox, which is where you would read
              them anyway.
            </p>
            <p>
              <strong>Saving service credentials.</strong> Nothing that would be encrypted and
              stored can be entered.
            </p>
            <p>
              Everything else is the real product, running the real code, from the same repository.
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
