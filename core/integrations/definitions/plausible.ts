import 'server-only';
import { z } from 'zod';
import { registerIntegration, type TestResult } from '../registry';

/**
 * Visitor analytics, managed or self-hosted.
 *
 * Plausible's self-hostable edition (AGPL) is the free path here, the same
 * shape as Umami: run it yourself and there is no bill and no third party
 * holding your visitors. The Cloud is the fallback for anyone who would
 * rather pay than host. Cookieless either way, so no consent banner.
 */

export const plausibleSchema = z.object({
  host: z.string().min(1),
  domain: z.string().min(1),
  shareUrl: z.string().optional(),
  apiKey: z.string().optional(),
});

export type PlausibleSettings = z.infer<typeof plausibleSchema>;

/** The tagged-events build is what records the portfolio's custom events. */
export function plausibleScriptSrc(host: string): string {
  return `${host.replace(/\/$/, '')}/js/script.tagged-events.js`;
}

registerIntegration<PlausibleSettings>({
  id: 'plausible',
  name: 'Analytics (Plausible)',
  category: 'analytics',
  summary:
    'Counts visitors and records the portfolio events — which work gets opened, what gets clicked — without cookies.',

  freeTier: {
    summary:
      'Free forever self-hosted (open source). The managed Cloud is a paid subscription, so prefer the self-host here.',
    verifiedOn: '2026-10-18',
  },
  docsUrl: 'https://plausible.io/docs/self-hosting',
  setup: [
    'Run Plausible on your own server with their Docker image.',
    'Add your site domain there.',
    'Paste the address where Plausible lives and your domain below.',
    'Optionally paste a read-only share link (with ?auth=…) to see the charts inside this admin.',
    'Press Test. It checks the tracking script answers.',
  ],

  fields: [
    {
      name: 'host',
      label: 'Plausible address',
      kind: 'text',
      placeholder: 'https://plausible.yourdomain.com',
    },
    {
      name: 'domain',
      label: 'Site domain',
      kind: 'text',
      placeholder: 'yourdomain.com',
      help: 'The domain exactly as you added it in Plausible — no https, no path.',
    },
    {
      name: 'shareUrl',
      label: 'Share link (optional)',
      kind: 'text',
      optional: true,
      help: 'A read-only stats link, to see the charts on the Analytics page here.',
    },
    {
      name: 'apiKey',
      label: 'Stats API key (optional)',
      kind: 'password',
      optional: true,
      help: 'For view counts on the Analytics page. Stats API key from your account settings. Without it, collection still works.',
    },
  ],
  secretFields: ['apiKey'],

  schema: plausibleSchema,

  degradation:
    'Without this, nobody counts visitors: the enquiry inbox still tells you exactly who wrote, but not how many looked.',

  configuredByEnv: (env) =>
    Boolean(env.OPB_ANALYTICS_HOST?.trim() || env.OPB_PLAUSIBLE_HOST?.trim()),

  async test(config): Promise<TestResult> {
    const src = plausibleScriptSrc(config.host);
    try {
      const res = await fetch(src, { method: 'GET' });
      if (!res.ok) {
        return {
          ok: false,
          message: `That address answered with ${res.status} for the tracking script. Check the host — it should look like https://plausible.yourdomain.com.`,
        };
      }
      return {
        ok: true,
        message:
          'The tracking script answers. Page views and portfolio events will record from the next visit.',
      };
    } catch {
      return {
        ok: false,
        message:
          'Nothing answered at that address. Check it for typos, and that the server is running.',
      };
    }
  },
});
