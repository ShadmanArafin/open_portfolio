import type { Metadata } from 'next';
import { Band, Claim, Cta } from '@/components/ui';
import { REPO } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Deploy your own',
  description:
    'Three ways to get it running: a one-click deploy, one Docker command, or from source. Ordered easiest first.',
  alternates: { canonical: '/deploy' },
};

const DEPLOY_URL =
  'https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FShadmanArafin%2Fopen_portfolio_builder&project-name=my-portfolio&repository-name=my-portfolio&env=OPB_SETUP_TOKEN&envDescription=Invent+any+long+phrase.+You+will+be+asked+for+it+once%2C+to+prove+the+site+is+yours.&stores=%5B%7B%22type%22%3A%22integration%22%2C%22integrationSlug%22%3A%22neon%22%2C%22productSlug%22%3A%22neon%22%2C%22protocol%22%3A%22storage%22%7D%2C%7B%22type%22%3A%22blob%22%2C%22access%22%3A%22public%22%7D%5D';

/**
 * The install fork, and the one page where the two audiences genuinely split.
 *
 * Easiest first, and the warning before the options rather than after them.
 * The counter-example in the research leads its getting-started page with a
 * source build, so step one for a non-developer is installing a package
 * manager. Do not be that.
 */
export default function DeployPage() {
  return (
    <>
      <Band rail="Deploy" first>
        <div className="stack stack--loose">
          <div className="stack">
            <h1 className="display">Deploy your own</h1>
            <p className="lede">
              Three ways, easiest first. The first two need no terminal and take about five minutes.
            </p>
          </div>
        </div>
      </Band>

      <Band rail="One click" id="one-click" sunken>
        <div className="stack stack--loose">
          <div className="stack">
            <p className="micro">Option one · nothing to install</p>
            <h2 className="title">One click</h2>
            <p className="lede">
              Vercel copies this repository into your own GitHub account, provisions a free Neon
              Postgres database and a blob store for your images, and asks you to invent one setup
              phrase. You never see a key.
            </p>
          </div>

          <div className="cta-row">
            <Cta href={DEPLOY_URL}>Deploy with Vercel</Cta>
          </div>

          <div className="prose">
            <p>
              Then open the address it gives you, claim the site with your setup phrase, and answer
              four questions. You can point your own domain at it whenever you like, and nothing you
              have written is affected when you do.
            </p>
            <p>
              If the button ever stops provisioning the database, deploy anyway and add{' '}
              <strong>Neon</strong> and <strong>Blob</strong> from your project&rsquo;s Storage tab.
              The backend is chosen from whichever environment variables are present, so nothing
              else changes.
            </p>
          </div>

          <div className="stack">
            <h3 className="head">Read this before using the free plan for paid work</h3>
            <Claim id="vercelHobbyNonCommercial" />
            <p className="prose">
              If your portfolio advertises work you are paid for, budget for Vercel Pro or use one
              of the options below. The full discussion is on{' '}
              <a href="/what-it-costs#vercel">what it costs</a>.
            </p>
          </div>
        </div>
      </Band>

      <Band rail="One command" id="docker">
        <div className="stack stack--loose">
          <div className="stack">
            <p className="micro">Option two · any machine with Docker</p>
            <h2 className="title">One command</h2>
            <p className="lede">
              A rented server, an old laptop, a Raspberry Pi. App and database together, no account
              anywhere, nothing that phones home.
            </p>
          </div>

          <pre className="md">
            <code>
              {`git clone ${REPO.replace('https://github.com', 'https://github.com')}.git
cd open_portfolio_builder
docker compose up`}
            </code>
          </pre>

          <div className="prose">
            <p>
              Open <code>http://localhost:3000</code> and follow the setup. Change{' '}
              <code>OPB_SETUP_TOKEN</code> and <code>OPB_SECRET_KEY</code> in{' '}
              <code>docker-compose.yml</code> first.
            </p>
            <p>
              <strong>Keep the volume.</strong> <code>/data</code> is where your uploads live — and
              your content too, if you are not using a database. Without it, replacing the container
              deletes your site. With it, you can throw the container away and rebuild it as often
              as you like, which is exactly what updating does.
            </p>
          </div>

          <div className="cta-row">
            <Cta href="/docs/self-hosting" variant="link">
              Volumes, updates, backups and reverse proxies →
            </Cta>
          </div>
        </div>
      </Band>

      <Band rail="From source" id="source" sunken>
        <div className="stack stack--loose">
          <div className="stack">
            <p className="micro">Option three · to work on it</p>
            <h2 className="title">From source</h2>
            <p className="lede">
              Node 20.9 or newer. No database needed and no account anywhere — the filesystem
              backend is the default.
            </p>
          </div>

          <pre className="md">
            <code>{`git clone ${REPO}.git
cd open_portfolio_builder
npm ci
npm run dev`}</code>
          </pre>

          <div className="prose">
            <p>
              <code>http://localhost:3000</code> sends you to <code>/setup</code>. Content lands in{' '}
              <code>.opb/</code> — delete that folder to start over.
            </p>
          </div>

          <div className="cta-row">
            <Cta href="/docs/get-started" variant="link">
              Running the tests, and what the containers are for →
            </Cta>
          </div>
        </div>
      </Band>

      <Band rail="Backends">
        <div className="stack stack--loose">
          <div className="stack">
            <h2 className="title">Where your content ends up</h2>
            <p className="lede">
              There is no setting for this. Whichever backend&rsquo;s environment variables are
              present is the one used, so provisioning a database is the whole of the configuration.
            </p>
          </div>

          <div className="table-scroll">
            <table className="data">
              <thead>
                <tr>
                  <th scope="col">Backend</th>
                  <th scope="col">Good for</th>
                  <th scope="col">Files go to</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Local filesystem</th>
                  <td>
                    Trying it, and a real choice on a VPS or a Pi. Refused in production on hosts
                    that discard the disk, because the failure otherwise is a site that works for a
                    day.
                  </td>
                  <td>A folder</td>
                </tr>
                <tr>
                  <th scope="row">Postgres</th>
                  <td>Docker Compose, or any Postgres you already run.</td>
                  <td>A mounted volume</td>
                </tr>
                <tr>
                  <th scope="row">Neon + Vercel Blob</th>
                  <td>What the one-click deploy sets up.</td>
                  <td>Vercel Blob</td>
                </tr>
                <tr>
                  <th scope="row">Supabase</th>
                  <td>If you are already there. Note the free-tier pausing.</td>
                  <td>Supabase Storage</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="small">
            Firebase, Convex, Cloudflare D1 + R2, PocketBase and Appwrite are planned and not built.
            Each has to pass the same conformance suite against a real instance before it ships, so
            none of them is offered until it has.
          </p>
        </div>
      </Band>
    </>
  );
}
