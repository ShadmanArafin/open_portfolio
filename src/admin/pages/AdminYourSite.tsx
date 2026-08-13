'use client';

import React, { useEffect, useState } from 'react';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { Divider } from '@astryxdesign/core/Divider';
import { VStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { AstryxHeader } from '../components/astryx/AstryxComponents';

/**
 * The address to send people to, and how to get a nicer one.
 *
 * The admin never told anybody where their site was. Somebody could design a
 * whole portfolio, press Publish, and still not know what to put on their CV —
 * which is the one thing they came here for. The server knew the URL the whole
 * time and nothing asked it.
 *
 * The domain half is guidance and not a control, deliberately. Adding a domain
 * from here would mean holding a Vercel API token that can modify the person's
 * entire account, stored in this app, to save them four clicks in a dashboard
 * they already have open. That is a bad trade, and the honest version — tell
 * them exactly where to click — costs nothing and cannot leak anything.
 *
 * It is also careful not to congratulate somebody who has not published yet. A
 * live URL showing starter content is not a finished site, and "you are live"
 * would be a lie by omission on the screen most likely to be believed.
 */

interface SiteStatus {
  url: string | null;
  platform: 'vercel' | 'netlify' | 'cloudflare' | 'self-hosted';
  isPlatformSubdomain: boolean;
  hasPublished: boolean;
}

const DOMAIN_STEPS: Record<SiteStatus['platform'], string[]> = {
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

export const AdminYourSite: React.FC = () => {
  const [status, setStatus] = useState<SiteStatus | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch('/api/admin/site');
        const body = (await res.json()) as SiteStatus & { ok: boolean };
        if (!cancelled && body.ok) setStatus(body);
      } catch {
        // Leaves the screen in its "we do not know" state, which is honest.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const copy = async () => {
    if (!status?.url) return;
    try {
      await navigator.clipboard.writeText(status.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be refused. The address is on screen to select.
    }
  };

  return (
    <VStack gap={5}>
      <AstryxHeader
        title="Your site"
        subtitle="The address to put on your CV, and how to swap it for one of your own."
      />

      {status?.url ? (
        <VStack gap={3}>
          <Banner
            status={status.hasPublished ? 'success' : 'info'}
            title={status.hasPublished ? 'Your site is live' : 'Your site is up, but not published'}
            description={
              status.hasPublished
                ? 'Anyone with this address can see it. No sign-in, nothing to install.'
                : 'The address works, but it is still showing the starter content. Press Publish Live when you are ready for people to see your own.'
            }
          />
          <Text as="p" type="code">
            {status.url}
          </Text>
          <VStack gap={2}>
            {/* `clickAction` rather than `onClick`: it takes the promise and
                shows a loading state, which is what a clipboard write is. */}
            <Button
              label={copied ? 'Copied' : 'Copy address'}
              variant="secondary"
              clickAction={copy}
            />
            <Text as="p" type="supporting">
              Opens for anybody, including people with no account here.
            </Text>
          </VStack>
        </VStack>
      ) : (
        <Banner
          status="info"
          title="We cannot tell what address this site is on"
          description="That is normal when running it locally. Once deployed, or once OPB_SITE_URL is set, the address appears here."
        />
      )}

      <Divider />

      {status?.isPlatformSubdomain === false && status?.url ? (
        <Banner
          status="success"
          title="You are already on your own domain"
          description="Nothing further to do. If you ever move it, remember to update OPB_SITE_URL so links inside emails follow."
        />
      ) : (
        <VStack gap={3}>
          <Text as="p">
            <Text weight="semibold">Want your own domain?</Text> The address above is free and
            permanent — you never have to change it. A domain of your own looks better on a CV, and
            it means the address stays yours if you ever move hosts.
          </Text>
          <Banner
            status="warning"
            title="This part is not free, and we do not sell it"
            description="A domain costs roughly £10–15 a year from a registrar, paid to them and not to us. It is the only thing about running this that costs money, and it is optional."
          />
          <VStack gap={1}>
            <Text as="p" weight="semibold">
              How to do it
            </Text>
            {DOMAIN_STEPS[status?.platform ?? 'self-hosted'].map((step, index) => (
              <Text key={step} as="p" type="supporting">
                {index + 1}. {step}
              </Text>
            ))}
          </VStack>
          <Text as="p" type="supporting">
            Nothing you have written is affected. The site keeps working on its current address
            while the new one is set up, and both work afterwards.
          </Text>
        </VStack>
      )}
    </VStack>
  );
};
