import 'server-only';
import { readConfig } from './vault';
import { umamiScriptSrc, type UmamiSettings } from './definitions/umami';
import { plausibleScriptSrc, type PlausibleSettings } from './definitions/plausible';

export type ResolvedAnalyticsProvider = 'umami' | 'plausible' | 'none';

export interface ResolvedAnalytics {
  provider: ResolvedAnalyticsProvider;
  /** Full script URL. Empty when nothing is configured. */
  scriptSrc: string;
  /** Umami only. */
  websiteId: string;
  /** Plausible only. */
  domain: string;
  /** Read-only dashboard link, for the admin embed. */
  shareUrl: string;
}

const NONE: ResolvedAnalytics = {
  provider: 'none',
  scriptSrc: '',
  websiteId: '',
  domain: '',
  shareUrl: '',
};

function legacy(): ResolvedAnalytics {
  // The previous generation: build-time NEXT_PUBLIC_* variables. Still
  // honoured so existing deploys keep working, but the admin screen and the
  // docs now point at the Services integrations instead of env files.
  const provider = (process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER ?? 'none').toLowerCase();
  if (provider !== 'umami' && provider !== 'plausible') return NONE;
  return {
    provider,
    scriptSrc: process.env.NEXT_PUBLIC_ANALYTICS_SRC ?? '',
    websiteId: process.env.NEXT_PUBLIC_ANALYTICS_WEBSITE_ID ?? '',
    domain: process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN ?? '',
    shareUrl: process.env.NEXT_PUBLIC_ANALYTICS_SHARE_URL ?? '',
  };
}

/**
 * Which analytics, if any, the public site loads.
 *
 * Precedence is deliberate: an `OPB_*` variable is a deliberate act by whoever
 * deployed the site and wins; then the vault, which is what the Services
 * screen writes with no redeploy; then the legacy build-time variables, so
 * nobody's existing setup goes dark on update.
 */
export async function resolveAnalytics(): Promise<ResolvedAnalytics> {
  const provider = (
    process.env.OPB_ANALYTICS_PROVIDER ??
    (await configuredProvider()) ??
    process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER ??
    'none'
  ).toLowerCase() as ResolvedAnalyticsProvider;

  if (provider === 'umami') {
    const host =
      process.env.OPB_UMAMI_HOST?.trim() ||
      process.env.OPB_ANALYTICS_HOST?.trim() ||
      (await stored('umami'))?.host;
    const storedWebsiteId = (await stored('umami'))?.websiteId;
    const websiteId =
      process.env.OPB_ANALYTICS_WEBSITE_ID?.trim() ||
      (typeof storedWebsiteId === 'string' ? storedWebsiteId : '') ||
      process.env.NEXT_PUBLIC_ANALYTICS_WEBSITE_ID ||
      '';
    const scriptSrc =
      process.env.OPB_ANALYTICS_SCRIPT_SRC?.trim() ||
      (typeof host === 'string' && host ? umamiScriptSrc(host) : '') ||
      process.env.NEXT_PUBLIC_ANALYTICS_SRC ||
      '';
    if (!scriptSrc || !websiteId) return { ...NONE, shareUrl: await shareUrl('umami') };
    return {
      provider,
      scriptSrc,
      websiteId,
      domain: '',
      shareUrl: await shareUrl('umami'),
    };
  }

  if (provider === 'plausible') {
    const host =
      process.env.OPB_PLAUSIBLE_HOST?.trim() ||
      process.env.OPB_ANALYTICS_HOST?.trim() ||
      (await stored('plausible'))?.host;
    const storedDomain = (await stored('plausible'))?.domain;
    const domain =
      process.env.OPB_ANALYTICS_DOMAIN?.trim() ||
      (typeof storedDomain === 'string' ? storedDomain : '') ||
      process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN ||
      '';
    const scriptSrc =
      process.env.OPB_ANALYTICS_SCRIPT_SRC?.trim() ||
      (typeof host === 'string' && host ? plausibleScriptSrc(host) : '') ||
      process.env.NEXT_PUBLIC_ANALYTICS_SRC ||
      '';
    if (!scriptSrc || !domain) return { ...NONE, shareUrl: await shareUrl('plausible') };
    return {
      provider,
      scriptSrc,
      websiteId: '',
      domain,
      shareUrl: await shareUrl('plausible'),
    };
  }

  return legacy();
}

async function stored(id: 'umami' | 'plausible'): Promise<Record<string, unknown> | null> {
  try {
    return await readConfig(id, []);
  } catch {
    return null;
  }
}

/** Which provider has vault settings, if the env does not already decide. */
async function configuredProvider(): Promise<ResolvedAnalyticsProvider | null> {
  const [umami, plausible] = await Promise.all([stored('umami'), stored('plausible')]);
  if (umami?.host && umami?.websiteId) return 'umami';
  if (plausible?.host && plausible?.domain) return 'plausible';
  if (umami?.host || plausible?.host) return umami?.host ? 'umami' : 'plausible';
  return null;
}

async function shareUrl(id: 'umami' | 'plausible'): Promise<string> {
  const fromEnv = process.env.OPB_ANALYTICS_SHARE_URL?.trim();
  if (fromEnv) return fromEnv;
  const values = await stored(id);
  if (typeof values?.shareUrl === 'string') return values.shareUrl;
  return process.env.NEXT_PUBLIC_ANALYTICS_SHARE_URL ?? '';
}

export type { UmamiSettings, PlausibleSettings };
