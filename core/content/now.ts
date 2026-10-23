import 'server-only';
import { cacheLife } from 'next/cache';

/**
 * "Now", for deciding what is live: scheduled pages and writing.
 *
 * Under Cache Components a render may not read the clock directly — a
 * prerendered page would freeze whatever time it was built at, and Next
 * refuses the build rather than ship that. So the time is itself a cached
 * value, refreshed each minute: the same one-minute promise the site made for
 * scheduled content when pages revalidated every sixty seconds.
 */
async function cachedNow(): Promise<number> {
  'use cache';
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 });
  return Date.now();
}

export async function siteNow(): Promise<Date> {
  return new Date(await cachedNow());
}
