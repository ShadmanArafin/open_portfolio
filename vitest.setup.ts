import { vi } from 'vitest';

/*
 * `'use cache'` is a compiler directive; Vitest does not compile it, so the
 * functions behind it run as ordinary functions — which is what a unit test
 * wants. `cacheTag` and `cacheLife` refuse to run outside a cache scope, so
 * here they record nothing. Everything else in `next/cache` stays real.
 */
vi.mock('next/cache', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/cache')>()),
  cacheLife: () => {},
  cacheTag: () => {},
}));

/* `connection()` marks a route as request-time; a unit test has no request. */
vi.mock('next/server', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/server')>()),
  connection: async () => {},
}));
