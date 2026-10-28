import 'server-only';
import { readConfig } from './vault';
import { classifyReferrer, type ReferrerCategory } from '@/core/analytics/referrer';
import type { UmamiSettings } from './definitions/umami';
import type { PlausibleSettings } from './definitions/plausible';

export interface TopPage {
  path: string;
  views: number;
}

export interface ReferrerTraffic {
  source: string;
  category: ReferrerCategory;
  categoryLabel: string;
  isRecruiterSource: boolean;
  views: number;
}

export interface AudienceSummary {
  provider: 'umami' | 'plausible';
  visitors30d: number | null;
  pageviews30d: number | null;
  topPages: TopPage[];
  topReferrers: ReferrerTraffic[];
}

/**
 * View counts for the dashboard, read live from the analytics provider.
 *
 * Returns null whenever there is nothing useful to say: no provider, no API
 * key, an unreachable host, a rejected key, or an unexpected shape. The admin
 * treats null as "enquiries only" rather than as an error, because every one
 * of those states is ordinary — collection works without any of this, and a
 * red banner for "you never pasted an API key" would punish the default.
 *
 * Results are cached in memory for five minutes. Plausible allows 600 API
 * calls an hour; the dashboard is opened by one person, but there is no
 * reason to spend a single one of them twice within five minutes.
 */

const TTL_MS = 5 * 60 * 1000;
let cached: { at: number; summary: AudienceSummary | null } | null = null;

const DAY_MS = 86_400_000;

async function umamiConfig(): Promise<(UmamiSettings & { host: string }) | null> {
  const host =
    process.env.OPB_UMAMI_HOST?.trim() ||
    process.env.OPB_ANALYTICS_HOST?.trim() ||
    (await readStored('umami'))?.host;
  const websiteId =
    process.env.OPB_ANALYTICS_WEBSITE_ID?.trim() || (await readStored('umami'))?.websiteId;
  const apiKey = process.env.OPB_UMAMI_API_KEY?.trim() || (await readStored('umami'))?.apiKey;
  if (typeof host !== 'string' || !host) return null;
  if (typeof websiteId !== 'string' || !websiteId) return null;
  if (typeof apiKey !== 'string' || !apiKey) return null;
  return { host, websiteId, apiKey };
}

async function plausibleConfig(): Promise<(PlausibleSettings & { host: string }) | null> {
  const host =
    process.env.OPB_PLAUSIBLE_HOST?.trim() ||
    process.env.OPB_ANALYTICS_HOST?.trim() ||
    (await readStored('plausible'))?.host;
  const domain =
    process.env.OPB_ANALYTICS_DOMAIN?.trim() || (await readStored('plausible'))?.domain;
  const apiKey =
    process.env.OPB_PLAUSIBLE_API_KEY?.trim() || (await readStored('plausible'))?.apiKey;
  if (typeof host !== 'string' || !host) return null;
  if (typeof domain !== 'string' || !domain) return null;
  if (typeof apiKey !== 'string' || !apiKey) return null;
  return { host, domain, apiKey };
}

async function readStored(id: 'umami' | 'plausible'): Promise<Record<string, unknown> | null> {
  try {
    return await readConfig(id, ['apiKey']);
  } catch {
    return null;
  }
}

function base(host: string): string {
  return host.replace(/\/$/, '');
}

async function umamiSummary(): Promise<AudienceSummary | null> {
  const config = await umamiConfig();
  if (!config) return null;

  const endAt = Date.now();
  const startAt = endAt - 30 * DAY_MS;
  const headers = { Authorization: `Bearer ${config.apiKey}` };
  const statsRes = await fetch(
    `${base(config.host)}/api/websites/${config.websiteId}/stats?startAt=${startAt}&endAt=${endAt}`,
    { headers }
  );
  if (!statsRes.ok) return null;
  const stats = (await statsRes.json().catch(() => null)) as {
    pageviews?: { value?: number };
    visitors?: { value?: number };
  } | null;
  if (!stats) return null;

  let topPages: TopPage[] = [];
  const metricsRes = await fetch(
    `${base(config.host)}/api/websites/${config.websiteId}/metrics?startAt=${startAt}&endAt=${endAt}&type=url&limit=5`,
    { headers }
  );
  if (metricsRes.ok) {
    const metrics = (await metricsRes.json().catch(() => null)) as
      { x?: string; y?: number }[] | null;
    if (Array.isArray(metrics)) {
      topPages = metrics
        .filter((m) => typeof m?.x === 'string' && typeof m?.y === 'number')
        .slice(0, 5)
        .map((m) => ({ path: m.x as string, views: m.y as number }));
    }
  }

  let topReferrers: ReferrerTraffic[] = [];
  const referrersRes = await fetch(
    `${base(config.host)}/api/websites/${config.websiteId}/metrics?startAt=${startAt}&endAt=${endAt}&type=referrer&limit=5`,
    { headers }
  ).catch(() => null);
  if (referrersRes && referrersRes.ok) {
    const metrics = (await referrersRes.json().catch(() => null)) as
      { x?: string; y?: number }[] | null;
    if (Array.isArray(metrics)) {
      topReferrers = metrics
        .filter((m) => typeof m?.x === 'string' && typeof m?.y === 'number')
        .slice(0, 5)
        .map((m) => {
          const classified = classifyReferrer(m.x);
          return {
            source: classified.source,
            category: classified.category,
            categoryLabel: classified.categoryLabel,
            isRecruiterSource: classified.isRecruiterSource,
            views: m.y as number,
          };
        });
    }
  }

  return {
    provider: 'umami',
    visitors30d: stats.visitors?.value ?? null,
    pageviews30d: stats.pageviews?.value ?? null,
    topPages,
    topReferrers,
  };
}

async function plausibleSummary(): Promise<AudienceSummary | null> {
  const config = await plausibleConfig();
  if (!config) return null;

  const headers = {
    Authorization: `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json',
  };
  const totalsRes = await fetch(`${base(config.host)}/api/v2/query`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      site_id: config.domain,
      metrics: ['visitors', 'pageviews'],
      date_range: '30d',
    }),
  });
  if (!totalsRes.ok) return null;
  const totals = (await totalsRes.json().catch(() => null)) as {
    results?: { metrics?: number[] }[];
  } | null;
  const row = totals?.results?.[0]?.metrics;
  const visitors = typeof row?.[0] === 'number' ? row[0] : null;
  const pageviews = typeof row?.[1] === 'number' ? row[1] : null;

  let topPages: TopPage[] = [];
  const pagesRes = await fetch(`${base(config.host)}/api/v2/query`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      site_id: config.domain,
      metrics: ['pageviews'],
      dimensions: ['event:page'],
      date_range: '30d',
      order_by: [['pageviews', 'desc']],
      pagination: { limit: 5, offset: 0 },
    }),
  });
  if (pagesRes.ok) {
    const pages = (await pagesRes.json().catch(() => null)) as {
      results?: { dimensions?: string[]; metrics?: number[] }[];
    } | null;
    if (Array.isArray(pages?.results)) {
      topPages = pages
        .results!.filter(
          (r) => typeof r?.dimensions?.[0] === 'string' && typeof r?.metrics?.[0] === 'number'
        )
        .slice(0, 5)
        .map((r) => ({ path: r.dimensions![0], views: r.metrics![0] }));
    }
  }

  let topReferrers: ReferrerTraffic[] = [];
  const sourcesRes = await fetch(`${base(config.host)}/api/v2/query`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      site_id: config.domain,
      metrics: ['pageviews'],
      dimensions: ['visit:source'],
      date_range: '30d',
      order_by: [['pageviews', 'desc']],
      pagination: { limit: 5, offset: 0 },
    }),
  }).catch(() => null);
  if (sourcesRes && sourcesRes.ok) {
    const sources = (await sourcesRes.json().catch(() => null)) as {
      results?: { dimensions?: string[]; metrics?: number[] }[];
    } | null;
    if (Array.isArray(sources?.results)) {
      topReferrers = sources
        .results!.filter(
          (r) => typeof r?.dimensions?.[0] === 'string' && typeof r?.metrics?.[0] === 'number'
        )
        .slice(0, 5)
        .map((r) => {
          const classified = classifyReferrer(r.dimensions![0]);
          return {
            source: classified.source,
            category: classified.category,
            categoryLabel: classified.categoryLabel,
            isRecruiterSource: classified.isRecruiterSource,
            views: r.metrics![0],
          };
        });
    }
  }

  if (
    visitors === null &&
    pageviews === null &&
    topPages.length === 0 &&
    topReferrers.length === 0
  ) {
    return null;
  }
  return {
    provider: 'plausible',
    visitors30d: visitors,
    pageviews30d: pageviews,
    topPages,
    topReferrers,
  };
}

export async function audienceSummary(): Promise<AudienceSummary | null> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.summary;

  let summary: AudienceSummary | null = null;
  try {
    summary = (await umamiSummary()) ?? (await plausibleSummary());
  } catch {
    summary = null;
  }
  cached = { at: Date.now(), summary };
  return summary;
}

/** Test seam: forget the cached summary. */
export function resetAudienceSummary(): void {
  cached = null;
}
