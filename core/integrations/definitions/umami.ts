import 'server-only';
import { z } from 'zod';
import { registerIntegration, type TestResult } from '../registry';

/**
 * Visitor analytics, self-hosted first.
 *
 * Umami is an MIT-licensed analytics platform you run on your own server, and
 * that is the shape this definition recommends: the setup steps describe the
 * self-host, and the Cloud option is the fallback for anyone who would rather
 * not run one more thing. Either way there are no cookies and no consent
 * banner, which is why cookieless analytics is the default suggestion rather
 * than anything from Google.
 */

export const umamiSchema = z.object({
  host: z.string().min(1),
  websiteId: z.string().min(1),
  shareUrl: z.string().optional(),
  apiKey: z.string().optional(),
});

export type UmamiSettings = z.infer<typeof umamiSchema>;

export function umamiScriptSrc(host: string): string {
  return `${host.replace(/\/$/, '')}/script.js`;
}

registerIntegration<UmamiSettings>({
  id: 'umami',
  name: 'Analytics (Umami)',
  category: 'analytics',
  summary:
    'Counts visitors and records the portfolio events — which work gets opened, what gets clicked — without cookies.',

  freeTier: {
    summary:
      'Free forever when you self-host it (MIT licensed, one Docker command). The managed Cloud has a free trial if you would rather not.',
    verifiedOn: '2026-10-18',
  },
  docsUrl: 'https://umami.is/docs/install',
  setup: [
    'Run Umami on your own server with their Docker image, or make a free Cloud account instead.',
    'Add your site there. You will get a website ID back.',
    'Paste the address where Umami lives and the website ID below. The tracking script address is derived from the host.',
    'Optionally paste a read-only share URL to see the charts inside this admin.',
    'Press Test. It checks the tracking script answers.',
  ],

  fields: [
    {
      name: 'host',
      label: 'Umami address',
      kind: 'text',
      placeholder: 'https://analytics.yourdomain.com',
      help: 'Where your Umami runs. Use https://cloud.umami.is only if you chose the Cloud.',
    },
    {
      name: 'websiteId',
      label: 'Website ID',
      kind: 'text',
      help: 'Shown in your Umami dashboard under site settings.',
    },
    {
      name: 'apiKey',
      label: 'API key (optional)',
      kind: 'password',
      optional: true,
      help: 'For view counts on the Analytics page. Create one under your profile → Settings → API keys. Without it, collection still works.',
    },
    {
      name: 'shareUrl',
      label: 'Share URL (optional)',
      kind: 'text',
      optional: true,
      help: 'A read-only dashboard link, to see the charts on the Analytics page here.',
    },
  ],
  secretFields: ['apiKey'],

  schema: umamiSchema,

  degradation:
    'Without this, nobody counts visitors: the enquiry inbox still tells you exactly who wrote, but not how many looked.',

  configuredByEnv: (env) => Boolean(env.OPB_ANALYTICS_HOST?.trim() || env.OPB_UMAMI_HOST?.trim()),

  async test(config): Promise<TestResult> {
    const src = umamiScriptSrc(config.host);
    try {
      const res = await fetch(src, { method: 'GET' });
      if (!res.ok) {
        return {
          ok: false,
          message: `That address answered with ${res.status} for the tracking script. Check the host — it should look like https://analytics.yourdomain.com.`,
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
