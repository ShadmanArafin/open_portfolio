/**
 * Media stored in IndexedDB is referenced in content as `idb:<mediaId>`.
 * Blobs can't go in an `<img src>` directly, so at boot every stored blob is
 * turned into an object URL once and cached here. `resolveAssetUrl` maps a
 * stored reference to something the browser can actually load.
 */

export const IDB_URL_PREFIX = 'idb:';

/** 1x1 transparent GIF — avoids a broken-image icon while a blob resolves. */
const BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

const objectUrls = new Map<string, string>();

export function isIdbUrl(url: string | undefined | null): boolean {
  return typeof url === 'string' && url.startsWith(IDB_URL_PREFIX);
}

export function mediaIdFromUrl(url: string): string {
  return url.slice(IDB_URL_PREFIX.length);
}

export function makeIdbUrl(id: string): string {
  return `${IDB_URL_PREFIX}${id}`;
}

/** Cache an object URL for a stored blob, replacing any previous one. */
export function registerMediaBlob(id: string, blob: Blob): string {
  const existing = objectUrls.get(id);
  if (existing) URL.revokeObjectURL(existing);

  const objectUrl = URL.createObjectURL(blob);
  objectUrls.set(id, objectUrl);
  return objectUrl;
}

export function unregisterMediaBlob(id: string): void {
  const existing = objectUrls.get(id);
  if (existing) {
    URL.revokeObjectURL(existing);
    objectUrls.delete(id);
  }
}

/**
 * Turn a stored asset reference into a loadable URL.
 *
 * Handles all four shapes that appear in content:
 *   `idb:media-123`        → blob object URL (uploaded through the admin)
 *   `/demo/avatar.svg`     → passthrough (files shipped in public/)
 *   `https://…`            → passthrough (external)
 *   `data:…`               → passthrough (legacy base64 from the old build)
 */
export function resolveAssetUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (!isIdbUrl(url)) return url;
  return objectUrls.get(mediaIdFromUrl(url)) ?? BLANK;
}

export { BLANK as BLANK_IMAGE };
