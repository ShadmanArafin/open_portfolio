import 'server-only';
import { INITIAL_CMS_STATE } from '@/cms/data/initialData';
import type { CMSState } from '@/cms/types/cms';
import type { SnapshotRead, StorageAdapter } from '@/core/storage/contract';

/**
 * The draft, for a caller about to change it — including the first time.
 *
 * A freshly claimed site has no draft row: nothing is stored until somebody
 * saves. The legacy client used to write one on its first load; when it was
 * deleted, every editing screen and the welcome wizard were left answering
 * "There is no draft to change yet" on a brand-new install, which is the one
 * moment nobody can work around it.
 *
 * So a missing draft starts from what the screens are already showing — the
 * published site, or the built-in content before anything is published (the
 * same fallback `getContentForChannel` reads through) — at revision 0. Writing
 * with an expected revision of 0 is create-only on every adapter (the
 * conformance suite asserts it), so two first saves racing each other still
 * end in one draft and one honest conflict, not a silent overwrite.
 */
export async function readDraftForWrite(adapter: StorageAdapter): Promise<SnapshotRead> {
  const meta = await adapter.readSnapshotMeta('draft');
  if (meta) return meta;
  const published = await adapter.readSnapshotMeta('published');
  const base = (published?.state ?? INITIAL_CMS_STATE) as CMSState;
  return { state: structuredClone(base), revision: 0 };
}
