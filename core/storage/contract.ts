import 'server-only';
import type { CMSState } from '@/cms/types/cms';

/**
 * The storage contract every backend implements.
 *
 * This is the seam the whole project hangs off: Supabase, Firebase, Convex,
 * Cloudflare D1+R2, PocketBase, Neon and Appwrite each become one file behind
 * this interface, and nothing above it changes. `import 'server-only'` is load
 * bearing — it makes the build fail rather than let a service-role key reach
 * the browser.
 *
 * Two shapes of access, deliberately:
 *
 *   readSnapshot / writeSnapshot  — the public site's path. One read per page
 *   render, identical on every backend, trivially cacheable.
 *
 *   media                          — assets, addressed by key and resolved to a
 *   URL rather than downloaded. The previous design returned a Blob, which
 *   forced every asset to be fetched at boot just to build an object URL.
 */

export type AdapterId =
  'local' | 'supabase' | 'firebase' | 'convex' | 'cloudflare' | 'pocketbase' | 'neon' | 'appwrite';

export type Channel = 'published' | 'draft';

export interface AdapterCapabilities {
  /** False only for stores that cannot survive a restart. */
  durable: boolean;
  /** Whether the adapter can verify an identity itself. */
  auth: 'builtin' | 'none';
  fileStorage: 'presigned' | 'proxy' | 'none';
  maxUploadBytes: number;
  fullTextSearch: boolean;
  realtime: boolean;
  transactions: boolean;
  /**
   * False for stores that only exist on one machine's disk. The registry
   * refuses to select these in production on hosts with an ephemeral or
   * read-only filesystem, rather than letting a user's content vanish on the
   * next deploy.
   */
  worksOnEphemeralHosts: boolean;
}

export interface MediaRecord {
  key: string;
  /** Absolute or same-origin URL. Never a `blob:` or `idb:` reference. */
  url: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface MediaAdapter {
  put(key: string, data: Uint8Array, mimeType: string): Promise<MediaRecord>;
  /** A URL a browser can load. Signed, if the backend needs it to be. */
  resolveUrl(key: string): Promise<string | null>;
  remove(key: string): Promise<void>;
  list(): Promise<MediaRecord[]>;
}

export interface HealthReport {
  ok: boolean;
  detail: string;
  latencyMs: number;
}

export interface StorageAdapter {
  readonly id: AdapterId;
  readonly displayName: string;
  readonly docsUrl: string;
  readonly capabilities: AdapterCapabilities;

  /** Cheap round trip, surfaced in the admin so a broken backend is visible. */
  health(): Promise<HealthReport>;

  /** Idempotent. Creates whatever tables, buckets or folders are needed. */
  provision(): Promise<void>;

  readSnapshot(channel: Channel): Promise<CMSState | null>;
  writeSnapshot(channel: Channel, state: CMSState): Promise<void>;

  readonly media: MediaAdapter;
}

/** Thrown when a backend is named but not usable, with a message for a human. */
export class AdapterConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdapterConfigError';
  }
}
