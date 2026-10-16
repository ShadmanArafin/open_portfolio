import 'server-only';
import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';
import { getStorageAdapter } from '@/core/storage/registry';

/**
 * Expiring share links: one private URL per page, for eyes that must not have
 * accounts.
 *
 * The photographer showing a client gallery, the designer walking a stakeholder
 * through a draft — neither person should need a login, and neither link
 * should work forever. A token is a random 192-bit bearer credential: the
 * token itself travels only in the link, while storage keeps only its SHA-256,
 * so a database read is not a link read.
 *
 * Stored under a `share` kv namespace with a TTL, so expiry needs no sweeper —
 * the row simply stops existing. One link per page: creating a second one
 * replaces the first, which keeps revocation a single delete and stops old
 * links accumulating silently behind new ones.
 */

export const SHARE_TTL_DAYS_DEFAULT = 7;
const DAY_SECONDS = 86_400;

interface ShareRecord {
  /** SHA-256 of the token, hex. The token itself is never stored. */
  tokenHash: string;
  pageId: string;
  createdAt: string;
  expiresAt: string;
}

function keyForPage(pageId: string): string {
  return `page:${pageId}`;
}

function hashToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export interface ShareLink {
  /** The secret itself. Shown once, at creation; never stored, never listed. */
  token: string;
  pageId: string;
  expiresAt: string;
}

export interface ShareStatus {
  active: boolean;
  expiresAt: string | null;
}

/** Create (or replace) the page's link. Returns the one copy of the token. */
export async function createShareLink(
  pageId: string,
  daysValid = SHARE_TTL_DAYS_DEFAULT
): Promise<ShareLink> {
  const clampedDays = Math.min(Math.max(Math.floor(daysValid), 1), 90);
  const token = randomBytes(24).toString('base64url');
  const expiresAt = new Date(Date.now() + clampedDays * DAY_MS).toISOString();
  const record: ShareRecord = {
    tokenHash: hashToken(token),
    pageId,
    createdAt: new Date().toISOString(),
    expiresAt,
  };
  const adapter = await getStorageAdapter();
  await adapter.kv.set('share', keyForPage(pageId), record, clampedDays * DAY_SECONDS);
  return { token, pageId, expiresAt };
}

const DAY_MS = DAY_SECONDS * 1000;

/** Whether the page currently has a live link, and when it lapses. */
export async function shareLinkStatus(pageId: string): Promise<ShareStatus> {
  const adapter = await getStorageAdapter();
  const record = await adapter.kv.get<ShareRecord>('share', keyForPage(pageId));
  if (!record) return { active: false, expiresAt: null };
  if (Date.parse(record.expiresAt) <= Date.now()) {
    await adapter.kv.del('share', keyForPage(pageId));
    return { active: false, expiresAt: null };
  }
  return { active: true, expiresAt: record.expiresAt };
}

/**
 * Turn a presented token back into a page id, or null.
 *
 * The token arrives in the URL, so it is compared in constant time against the
 * stored hash rather than looked up directly — a hash is not the token, and
 * treating it like one would make timing tell an attacker when they are close.
 * In practice the lookup is by page only through the token: every live link is
 * checked, newest first is meaningless here because there is exactly one per
 * page, so a match is a match.
 */
export async function resolveShareToken(token: string): Promise<{ pageId: string } | null> {
  if (typeof token !== 'string' || token.length < 16) return null;
  const adapter = await getStorageAdapter();
  return resolveShareTokenScan(adapter, token);
}

async function resolveShareTokenScan(
  adapter: Awaited<ReturnType<typeof getStorageAdapter>>,
  token: string
): Promise<{ pageId: string } | null> {
  // kv has no listing, so resolution walks the same read path the admin
  // screens already use — drafts carry the page list, and one link per page
  // bounds the scan by the number of pages, not the number of visitors.
  const { getPages } = await import('../pages/read');
  const pages = await getPages('draft');
  for (const page of pages) {
    const record = await adapter.kv.get<ShareRecord>('share', keyForPage(page.id));
    if (!record) continue;
    if (Date.parse(record.expiresAt) <= Date.now()) {
      await adapter.kv.del('share', keyForPage(page.id));
      continue;
    }
    if (safeEqual(record.tokenHash, hashToken(token))) return { pageId: page.id };
  }
  return null;
}

/** Revoke the page's link now. Idempotent: no link is also "no link". */
export async function revokeShareLink(pageId: string): Promise<void> {
  const adapter = await getStorageAdapter();
  await adapter.kv.del('share', keyForPage(pageId));
}
