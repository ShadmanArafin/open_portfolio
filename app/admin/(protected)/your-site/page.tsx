import type { Metadata } from 'next';
import { getPublishedContentFresh } from '@/core/content/read';
import { resolveSiteUrl } from '@/core/content/metadata';
import { CopyAddress } from './copy-address';

export const metadata: Metadata = {
  title: 'Your site',
  robots: { index: false, follow: false },
};

/**
 * The address to send people to, and how to get a nicer one.
 *
 * Server-rendered: the URL, the platform and the published state are all
 * known on the server, so the old version's loading flash and its "we do
 * not know" limbo were never necessary — only the copy button needs a
 * browser, and that is one client island.
 *
 * The domain half is guidance and not a control, deliberately. Adding a
 * domain from here would mean holding a hosting API token that can modify
 * the person's entire account, to save four clicks in a dashboard they
 * already have open.
 */

type Platform = 'vercel' | 'netlify' | 'cloudflare' | 'self-hosted';

const DOMAIN_STEPS: Record<Platform, string[]> = {
  vercel: [
    'Buy a domain from any registrar — Namecheap, Cloudflare, Porkbun and the rest are all about £10–15 a year. We do not sell them and take nothing from this.',
    'In Vercel, open your project, then Settings, then Domains.',
    'Type the domain you bought and press Add.',
    'Vercel shows you one or two DNS records. Copy them into your registrar’s DNS settings.',
    'Wait. It is usually minutes, occasionally a few hours. The certificate is issued for you.',
  ],
  netlify: [
    'Buy a domain from any registrar — about £10–15 a year.',
    'In Netlify, open your site, then Domain management, then Add a domain.',
    'Follow the DNS records it gives you at your registrar.',
    'Netlify issues the certificate once the records resolve.',
  ],
  cloudflare: [
    'Buy a domain — Cloudflare sells them at cost, which is usually the cheapest option.',
    'In the Cloudflare dashboard, open your Pages project, then Custom domains.',
    'Add the domain. If it is registered with Cloudflare the DNS is filled in for you.',
  ],
  'self-hosted': [
    'Buy a domain from any registrar — about £10–15 a year.',
    'Point an A record at your server’s IP address, or a CNAME at its hostname.',
    'Get a certificate. Caddy does it automatically; with nginx, certbot does it in one command.',
    'Set OPB_SITE_URL to the new address so links in emails point at it.',
  ],
};

function Notice({
  kind,
  title,
  children,
}: {
  kind: 'error' | 'success' | 'info' | 'warning';
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      className="rounded-2xl border border-border bg-surface-secondary p-4"
    >
      <p className="m-0 font-semibold">{title}</p>
      <div className="mt-1 text-sm text-text-secondary">{children}</div>
    </div>
  );
}

export default async function YourSitePage() {
  const content = await getPublishedContentFresh();
  const url = resolveSiteUrl(content) ?? null;
  const platform: Platform = process.env.VERCEL
    ? 'vercel'
    : process.env.NETLIFY
      ? 'netlify'
      : process.env.CF_PAGES
        ? 'cloudflare'
        : 'self-hosted';
  const isPlatformSubdomain = Boolean(
    url && /\.(vercel\.app|netlify\.app|pages\.dev)$/i.test(new URL(url).hostname)
  );
  const hasPublished = Boolean(content.lastPublishedAt);

  return (
    <div className="grid gap-5" style={{ maxWidth: 'var(--measure)' }}>
      <div>
        <h1 className="font-display m-0 text-3xl">Your site</h1>
        <p className="m-0 mt-1 text-text-secondary">
          The address to put on your CV, and how to swap it for one of your own.
        </p>
      </div>

      {url ? (
        <div className="grid gap-3">
          <Notice
            kind={hasPublished ? 'success' : 'info'}
            title={hasPublished ? 'Your site is live' : 'Your site is up, but not published'}
          >
            {hasPublished
              ? 'Anyone with this address can see it. No sign-in, nothing to install.'
              : 'The address works, but it is still showing the starter content. Press Publish Live when you are ready for people to see your own.'}
          </Notice>
          <p className="m-0 font-mono text-sm">{url}</p>
          <CopyAddress url={url} />
          <p className="m-0 text-sm text-text-secondary">
            Opens for anybody, including people with no account here.
          </p>
        </div>
      ) : (
        <Notice kind="info" title="We cannot tell what address this site is on">
          That is normal when running it locally. Once deployed, or once OPB_SITE_URL is set, the
          address appears here.
        </Notice>
      )}

      <hr className="border-border" />

      {isPlatformSubdomain === false && url ? (
        <Notice kind="success" title="You are already on your own domain">
          Nothing further to do. If you ever move it, remember to update OPB_SITE_URL so links
          inside emails follow.
        </Notice>
      ) : (
        <div className="grid gap-3">
          <p className="m-0">
            <strong>Want your own domain?</strong> The address above is free and permanent — you
            never have to change it. A domain of your own looks better on a CV, and it means the
            address stays yours if you ever move hosts.
          </p>
          <Notice kind="warning" title="This part is not free, and we do not sell it">
            A domain costs roughly £10–15 a year from a registrar, paid to them and not to us. It is
            the only thing about running this that costs money, and it is optional.
          </Notice>
          <div>
            <p className="m-0 font-semibold">How to do it</p>
            <ol className="m-0 mt-1 grid gap-1 pl-5 text-sm text-text-secondary">
              {DOMAIN_STEPS[platform].map((step, index) => (
                <li key={step}>
                  {index + 1}. {step}
                </li>
              ))}
            </ol>
          </div>
          <p className="m-0 text-sm text-text-secondary">
            Nothing you have written is affected. The site keeps working on its current address
            while the new one is set up, and both work afterwards.
          </p>
        </div>
      )}
    </div>
  );
}
