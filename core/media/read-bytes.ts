import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { mediaRoot } from '@/core/storage/adapters/_shared/data-dir';
import type { StorageAdapter } from '@/core/storage/contract';

/**
 * A stored file's bytes, wherever the configured backend keeps them — for the
 * full backup, which has to carry the pictures and not just their names.
 *
 * The same three places the media route serves from, in the same order: the
 * adapter's own byte reader, the public URL it resolves to, the local disk.
 * Null when the file cannot be found; the backup lists those rather than
 * failing as a whole over one missing picture.
 */
export async function readMediaBytes(
  adapter: StorageAdapter,
  key: string
): Promise<Uint8Array | null> {
  if (typeof adapter.media.readBytes === 'function') {
    const stored = await adapter.media.readBytes(key).catch(() => null);
    if (stored) return stored.data;
  }

  const remote = await adapter.media.resolveUrl(key).catch(() => null);
  if (remote && /^https?:\/\//i.test(remote)) {
    try {
      const response = await fetch(remote);
      if (response.ok) return new Uint8Array(await response.arrayBuffer());
    } catch {
      // Fall through to the disk, then to "not found".
    }
  }

  const root = mediaRoot();
  const resolved = path.resolve(root, key);
  if (!resolved.startsWith(root + path.sep)) return null;
  try {
    return new Uint8Array(await readFile(resolved));
  } catch {
    return null;
  }
}

/** Keys this app writes: a flat name, never a path. */
export function isSafeMediaKey(key: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9._-]{0,200}$/.test(key) && !key.includes('..');
}
