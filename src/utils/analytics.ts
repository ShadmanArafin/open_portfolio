/**
 * Visitor analytics.
 *
 * A static site cannot count its own visitors. Nothing runs on a server, so a
 * page view has nowhere to be recorded that the site owner could later read —
 * IndexedDB only ever holds what happened in *this* browser, which is the
 * owner's. Collecting real numbers needs something that outlives the visit,
 * which means a hosted analytics service.
 *
 * So this module does the half that has to exist either way: it names the
 * events worth measuring and fires them at the right moments. Connect a
 * provider and the data is real from that moment on; connect nothing and every
 * call is a no-op that costs a function call.
 *
 * Configure in Services (no redeploy), in `OPB_ANALYTICS_*` environment
 * variables, or — for setups predating both — the legacy build-time
 * `NEXT_PUBLIC_ANALYTICS_*` variables:
 *   OPB_ANALYTICS_PROVIDER    umami | plausible
 *   OPB_ANALYTICS_HOST        where it lives (Umami) / Plausible address
 *   OPB_ANALYTICS_WEBSITE_ID  Umami website ID
 *   OPB_ANALYTICS_DOMAIN      Plausible domain
 *   OPB_ANALYTICS_SCRIPT_SRC  override for the tracking script URL
 *   OPB_ANALYTICS_SHARE_URL   read-only dashboard URL, embedded under /admin/analytics
 *
 * The server layout resolves all three sources and embeds the answer as JSON,
 * which is what `getAnalyticsConfig` reads. Both supported providers are
 * cookieless and need no consent banner in the EU/UK, which is why they are
 * the default suggestion rather than GA.
 */

export type AnalyticsProvider = 'plausible' | 'umami' | 'none';

export interface AnalyticsConfig {
  provider: AnalyticsProvider;
  domain: string;
  scriptSrc: string;
  websiteId: string;
  shareUrl: string;
}

const DEFAULT_SRC: Record<Exclude<AnalyticsProvider, 'none'>, string> = {
  plausible: 'https://plausible.io/js/script.tagged-events.js',
  umami: 'https://cloud.umami.is/script.js',
};

export function getAnalyticsConfig(): AnalyticsConfig {
  // The server layout embeds the resolved answer (env, then vault, then
  // legacy variables) as JSON, so the client reads one source with no extra
  // request. The build-time variables remain as the fallback for contexts
  // without the embedded block. Read as whole property accesses, never
  // `env[name]`: Next inlines NEXT_PUBLIC_* at build time by static
  // substitution, so a computed lookup silently resolves to undefined in a
  // production build.
  const embedded = readEmbeddedConfig();
  const provider = (
    embedded?.provider ??
    process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER ??
    'none'
  ).toLowerCase() as AnalyticsProvider;

  return {
    provider: provider === 'plausible' || provider === 'umami' ? provider : 'none',
    domain: embedded?.domain ?? process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN ?? '',
    scriptSrc:
      embedded?.scriptSrc ??
      process.env.NEXT_PUBLIC_ANALYTICS_SRC ??
      (provider !== 'none' ? (DEFAULT_SRC[provider as 'plausible'] ?? '') : ''),
    websiteId: embedded?.websiteId ?? process.env.NEXT_PUBLIC_ANALYTICS_WEBSITE_ID ?? '',
    shareUrl: embedded?.shareUrl ?? process.env.NEXT_PUBLIC_ANALYTICS_SHARE_URL ?? '',
  };
}

function readEmbeddedConfig(): Partial<AnalyticsConfig> | null {
  if (typeof document === 'undefined') return null;
  const el = document.getElementById('opb-analytics-config');
  if (!el?.textContent) return null;
  try {
    return JSON.parse(el.textContent) as Partial<AnalyticsConfig>;
  } catch {
    return null;
  }
}

export function isAnalyticsConfigured(): boolean {
  const c = getAnalyticsConfig();
  if (c.provider === 'plausible') return Boolean(c.domain);
  if (c.provider === 'umami') return Boolean(c.websiteId);
  return false;
}

/**
 * The events worth measuring on a portfolio, and why each one earns its place.
 * The admin lists these so the instrumentation is visible without reading code.
 */
export const TRACKED_EVENTS: { name: string; when: string; tells: string }[] = [
  {
    name: 'Project viewed',
    when: 'Someone opens a project page',
    tells: 'Which work actually gets read, so you know what to lead with.',
  },
  {
    name: 'Case study viewed',
    when: 'Someone opens a case study',
    tells: 'Whether the long-form writing is worth the effort it takes.',
  },
  {
    name: 'Live site clicked',
    when: 'A "Visit site" link is followed',
    tells: 'Which projects are convincing enough to go and look at.',
  },
  {
    name: 'Social clicked',
    when: 'A footer social card is clicked',
    tells: 'Which platform your visitors want to continue on.',
  },
  {
    name: 'Resume downloaded',
    when: 'The résumé PDF is downloaded',
    tells: 'The strongest hiring signal the site produces.',
  },
  {
    name: 'Email copied',
    when: 'The email address is copied',
    tells: 'Intent to contact that never reaches the form.',
  },
  {
    name: 'Contact submitted',
    when: 'The contact form is sent',
    tells: 'The one number that matters. Compare against page views for a rate.',
  },
];

declare global {
  interface Window {
    plausible?: (event: string, opts?: { props?: Record<string, unknown> }) => void;
    umami?: { track: (event: string, data?: Record<string, unknown>) => void };
  }
}

/** The admin is the owner's own traffic and would pollute every number. */
function isMeasurablePage(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.location.pathname.startsWith('/admin')) return false;
  // The draft preview renders the site inside an iframe in the admin.
  if (window.self !== window.top) return false;
  return true;
}

let injected = false;

/** Adds the provider script once, on the public site only. */
export function initAnalytics(): void {
  if (injected || !isMeasurablePage()) return;

  const config = getAnalyticsConfig();
  if (config.provider === 'none' || !isAnalyticsConfigured()) return;

  const script = document.createElement('script');
  script.defer = true;
  script.src = config.scriptSrc;

  if (config.provider === 'plausible') {
    script.setAttribute('data-domain', config.domain);
  } else {
    script.setAttribute('data-website-id', config.websiteId);
  }

  document.head.appendChild(script);
  injected = true;
}

export function trackEvent(name: string, props?: Record<string, unknown>): void {
  if (!isMeasurablePage()) return;

  const { provider } = getAnalyticsConfig();
  if (provider === 'plausible') window.plausible?.(name, props ? { props } : undefined);
  else if (provider === 'umami') window.umami?.track(name, props);
}

/**
 * Plausible and Umami both count the initial load themselves, but this is a
 * single-page app: every route change after that is invisible to them unless
 * it is announced.
 */
export function trackPageview(path: string): void {
  if (!isMeasurablePage()) return;

  const { provider } = getAnalyticsConfig();
  if (provider === 'plausible') window.plausible?.('pageview');
  else if (provider === 'umami') window.umami?.track('pageview', { url: path });
}
