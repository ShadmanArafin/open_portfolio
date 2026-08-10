import 'server-only';
import { AdapterConfigError, type AdapterId, type StorageAdapter } from './contract';
import { localAdapter } from './adapters/local';
import { neonAdapter } from './adapters/neon';
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

let cached: StorageAdapter | null = null;

export function getStorageAdapter(): StorageAdapter {
  if (cached) return cached;

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

  cached = adapter;
  return adapter;
}

/** Test seam: forces the next call to re-resolve. */
export function resetStorageAdapter(): void {
  cached = null;
}
