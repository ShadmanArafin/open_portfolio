import { isDemoMode } from '@/core/demo/config';
import { demoAdapter } from './adapters/demo';
import 'server-only';
import { AdapterConfigError, type AdapterId, type StorageAdapter } from './contract';
import { localAdapter } from './adapters/local';
import { neonAdapter } from './adapters/neon';
import { postgresAdapter } from './adapters/postgres';
import { supabaseAdapter } from './adapters/supabase';

/**
 * Picks the storage backend for this deployment.
 *
 * Configuration lives in environment variables and never in the database,
 * because the configuration is what tells you how to reach the database. That
 * resolves the chicken-and-egg completely.
 *
 * When `OPB_ADAPTER` is unset the backend is inferred from which provider's
 * variables are present. That is what lets a one-click deploy work with no
 * choice at all: whatever the platform provisions *is* the configuration.
 */

const REGISTERED: Partial<Record<AdapterId, () => StorageAdapter>> = {
  local: () => localAdapter,
  supabase: () => supabaseAdapter,
  neon: () => neonAdapter,
  postgres: () => postgresAdapter,
  // cloudflare, firebase, convex, pocketbase and appwrite register here as they
  // land. Each is one file plus one line — that is the point of the contract.
};

/** Hosts where the filesystem is read-only or discarded between requests. */
function isEphemeralHost(): boolean {
  return Boolean(process.env.VERCEL || process.env.NETLIFY || process.env.CF_PAGES);
}

function inferAdapterId(): AdapterId {
  const candidates: AdapterId[] = [];
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    candidates.push('supabase');
  }
  // Neon needs a database and somewhere for uploads to go. Checking both means
  // a half-configured project is caught here rather than at the first upload.
  if (
    (process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL) &&
    process.env.BLOB_READ_WRITE_TOKEN
  ) {
    candidates.push('neon');
  }
  if (process.env.CONVEX_DEPLOYMENT) candidates.push('convex');
  if (process.env.FIREBASE_SERVICE_ACCOUNT) candidates.push('firebase');
  if (process.env.CLOUDFLARE_ACCOUNT_ID && process.env.D1_DATABASE_ID)
    candidates.push('cloudflare');
  if (process.env.POCKETBASE_URL) candidates.push('pocketbase');
  if (process.env.APPWRITE_ENDPOINT) candidates.push('appwrite');

  // A bare connection string with no blob store attached means a plain
  // Postgres. Checked last, so a more specific match always wins.
  if (
    !candidates.length &&
    (process.env.OPB_POSTGRES_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL)
  ) {
    candidates.push('postgres');
  }

  // Ambiguity is an error, never a guess. Silently picking one of two
  // configured databases is how content ends up split across both.
  if (candidates.length > 1) {
    throw new AdapterConfigError(
      `More than one storage backend is configured (${candidates.join(', ')}). ` +
        'Set OPB_ADAPTER to the one you want.'
    );
  }
  if (candidates.length === 1) return candidates[0];

  return 'local';
}

function selectAdapter(): StorageAdapter {
  /*
   * Demo mode wins over everything, including an explicitly named backend.
   *
   * Deliberately not a value of `OPB_ADAPTER`: a demo deployment usually has a
   * real `DATABASE_URL` sitting in its environment from the deploy template,
   * and the failure mode of getting this precedence wrong is a public sandbox
   * writing strangers' vandalism into a real database.
   */
  if (isDemoMode()) return demoAdapter;

  const id = (process.env.OPB_ADAPTER as AdapterId | undefined) ?? inferAdapterId();
  const factory = REGISTERED[id];

  if (!factory) {
    throw new AdapterConfigError(
      `Storage backend "${id}" is not available in this build. ` +
        `Available right now: ${Object.keys(REGISTERED).join(', ')}.`
    );
  }

  const adapter = factory();

  if (
    !adapter.capabilities.worksOnEphemeralHosts &&
    isEphemeralHost() &&
    process.env.NODE_ENV === 'production'
  ) {
    throw new AdapterConfigError(
      `The "${adapter.displayName}" backend stores content on the server's disk, and this host ` +
        'discards that disk between deploys — your content would disappear. Configure a hosted ' +
        'backend instead. See the setup guide for the options.'
    );
  }

  return adapter;
}

let ready: Promise<StorageAdapter> | null = null;

/**
 * The adapter, provisioned and ready to use.
 *
 * Provisioning used to run from the claim flow alone, which is gated on there
 * being no owner yet — so on every instance that was already claimed, meaning
 * every real upgrade, it never ran again. New tables were never created and
 * enquiries left in an old snapshot were never migrated out of it before the
 * next publish overwrote them.
 *
 * So it happens here instead: lazily, once per process, in front of the first
 * use of the backend. Every consumer goes through this one function, so there
 * is no path to an unprovisioned adapter. The promise is memoised rather than
 * the act of provisioning, which is what makes concurrent callers on a cold
 * start share one attempt instead of racing several — and what makes the
 * caller *wait* for it, rather than reaching a table that is still being
 * created.
 *
 * `provision()` is idempotent and cheap on an already-provisioned store, so
 * paying it once per cold start costs a round trip and buys the guarantee.
 */
export function getStorageAdapter(): Promise<StorageAdapter> {
  if (ready) return ready;

  const attempt = (async () => {
    const adapter = selectAdapter();
    await adapter.provision();
    return adapter;
  })();

  ready = attempt;

  // A backend that was asleep or briefly unreachable must not poison the
  // process for as long as it lives. Forgetting a failed attempt lets the next
  // request try again; the identity check means a retry already under way is
  // not discarded by a straggler from the failed one.
  attempt.catch(() => {
    if (ready === attempt) ready = null;
  });

  return attempt;
}

/** Test seam: forces the next call to re-resolve and re-provision. */
export function resetStorageAdapter(): void {
  ready = null;
}
