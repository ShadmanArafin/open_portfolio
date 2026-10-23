import type { Metadata } from 'next';
import { Band, Claim, Cta } from '@/components/ui';
import { PRODUCT } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Moving off Bento: a link page you keep',
  description:
    'Bento shut down on 13 February 2026. How to rebuild a link-in-bio page on a site you own — and what this cannot do for you.',
  alternates: { canonical: '/moving-off/bento' },
};

const steps = [
  {
    title: 'Gather your links',
    detail:
      'Bento deleted its data after the shutdown, so the list comes from wherever it survives: your Linktree page if you took the migration, an old screenshot, or your bio on each network. You need a label and an address for each.',
  },
  {
    title: 'Deploy your own site',
    detail:
      'One button on Vercel or Netlify, or one Docker command on a server you already have. Free hosting tiers are enough.',
  },
  {
    title: 'Pages → Add a links page',
    detail:
      'It arrives as a draft at /links: who you are, a short line, buttons for your links, and your social profiles underneath. Every part is an ordinary block you can edit, reorder or delete.',
  },
  {
    title: 'Publish, and put /links in your bio',
    detail:
      'It is live as soon as you press Publish. When you want more than links — work, writing, a contact form — it is the same site.',
  },
];

/**
 * A "moving off" page for a service that closed, not a comparison: the reader
 * has already lost their page and needs steps, not a sales argument. The one
 * claim about Bento is sourced and dated like every other in `lib/facts.ts`,
 * and the page says plainly what this product will not do for them.
 */
export default function MovingOffBento() {
  return (
    <>
      <Band rail="Moving off" first>
        <div className="stack stack--loose">
          <div className="stack">
            <p className="micro">Moving off</p>
            <h1 className="display">Bento</h1>
            <p className="lede">
              Bento is gone, and a link page you rent can go the same way. {PRODUCT} puts the same
              page on a site you own: free, open source, and still there whatever happens to anyone
              else.
            </p>
          </div>
          <div className="cta-row">
            <Cta href="/deploy">Deploy yours</Cta>
            <Cta href="/demo" variant="ghost">
              Try the demo first
            </Cta>
          </div>
        </div>
      </Band>

      <Band rail="What happened" sunken>
        <div className="stack stack--loose">
          <Claim id="bentoShutdown" />
        </div>
      </Band>

      <Band rail="Steps">
        <div className="stack stack--loose">
          <h2 className="title">Four steps</h2>
          <ol className="grid" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {steps.map((step, index) => (
              <li className="card" key={step.title}>
                <p className="micro">Step {index + 1}</p>
                <h3 className="head">{step.title}</h3>
                <p>{step.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </Band>

      <Band rail="Honestly" sunken>
        <div className="grid">
          <div className="card">
            <h2 className="head">What this will not do</h2>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'grid', gap: '0.5rem' }}>
              <li>
                Import a Bento export. There is no importer, and Bento&rsquo;s data is deleted.
              </li>
              <li>Recreate Bento&rsquo;s grid of tiles. The links page is a column of buttons.</li>
              <li>Host itself. You choose a free host or a server; we do not run one for you.</li>
            </ul>
          </div>
          <div className="card">
            <h2 className="head">What it will</h2>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'grid', gap: '0.5rem' }}>
              <li>Keep your page on a domain and a host you control.</li>
              <li>Download your whole site, pictures included, in one file, whenever you like.</li>
              <li>Grow into a portfolio when you want one, on the same address.</li>
            </ul>
          </div>
        </div>
      </Band>
    </>
  );
}
