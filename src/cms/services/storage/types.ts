import { CMSState } from '../../types/cms';

/**
 * The persistence boundary for the CMS.
 *
 * Everything above this interface (cmsService, the admin UI, the public site)
 * is storage-agnostic. Swapping browser storage for a hosted backend means
 * writing one new implementation of `ContentStore` and changing the single
 * line in `cmsService` that picks the store — nothing else.
 *
 * The interface is async on purpose. Browser storage could be synchronous,
 * but a network backend cannot, and retrofitting async later would mean
 * touching every call site.
 */
export interface ContentStore {
  /** Human-readable name, surfaced in the admin so you can see which store is live. */
  readonly name: string;

  /** True when the store persists across page loads. False for the in-memory fallback. */
  readonly isDurable: boolean;

  loadPublished(): Promise<CMSState | null>;
  loadDraft(): Promise<CMSState | null>;
  savePublished(state: CMSState): Promise<void>;
  saveDraft(state: CMSState): Promise<void>;

  putMedia(id: string, blob: Blob): Promise<void>;
  getMedia(id: string): Promise<Blob | null>;
  deleteMedia(id: string): Promise<void>;
  listMediaIds(): Promise<string[]>;

  /** Wipe content and media. Used by "Reset to seed data". */
  clearAll(): Promise<void>;
}

/**
 * Thrown when a write fails because storage is full.
 * Callers surface this to the user rather than swallowing it — a CMS that
 * silently fails to save is worse than one that refuses to.
 */
export class StorageQuotaError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'StorageQuotaError';
  }
}

export function isQuotaError(err: unknown): boolean {
  if (!err) return false;
  const name = (err as { name?: string }).name;
  return (
    err instanceof StorageQuotaError ||
    name === 'QuotaExceededError' ||
    name === 'NS_ERROR_DOM_QUOTA_REACHED'
  );
}
