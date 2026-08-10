import { CMSState, ContactMessage, MediaItem, ContentVersion } from '../types/cms';
import { INITIAL_CMS_STATE } from '../data/initialData';
import { ContentStore } from './storage/types';
import { createLocalStore } from './storage/localStore';
import { parsePeriod, parseYearRange } from '../utils/dates';
import {
  makeIdbUrl,
  registerMediaBlob,
  unregisterMediaBlob,
  isIdbUrl,
  mediaIdFromUrl,
} from '../utils/mediaUrls';

const CMS_AUTH_KEY = 'opb.auth';
const AUTH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** How long to wait after the last keystroke before writing to storage. */
const SAVE_DEBOUNCE_MS = 400;

/** Version history is capped so stored content can't grow without bound. */
const MAX_VERSIONS = 20;

/** Written by every new export. */
const BUNDLE_FORMAT = 'open-portfolio-builder';

/**
 * Formats `importBundle` will accept.
 *
 * Import is where people lose content and trust, so an older backup must keep
 * working. `arshan-portfolio-cms` was the pre-rename identifier; drop it at 1.0.
 */
const ACCEPTED_BUNDLE_FORMATS = [BUNDLE_FORMAT, 'arshan-portfolio-cms'] as const;

export interface ContentBundle {
  format: (typeof ACCEPTED_BUNDLE_FORMATS)[number];
  version: 1;
  exportedAt: string;
  published: CMSState;
  draft: CMSState;
  media: { id: string; mimeType: string; dataUrl: string }[];
}

type ErrorListener = (message: string) => void;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

export class CMSService {
  private static instance: CMSService;

  private draftState: CMSState;
  private publishedState: CMSState;
  private store: ContentStore | null = null;
  private ready = false;

  private listeners: (() => void)[] = [];
  private errorListeners: ErrorListener[] = [];

  private draftSaveTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingDraftSave = false;

  private constructor() {
    // Synchronous seed so readers always have a valid state object.
    // `init()` replaces this with stored content before the app renders.
    this.publishedState = clone(INITIAL_CMS_STATE);
    this.draftState = clone(INITIAL_CMS_STATE);
  }

  public static getInstance(): CMSService {
    if (!CMSService.instance) CMSService.instance = new CMSService();
    return CMSService.instance;
  }

  // --- LIFECYCLE ---

  /** Hydrate from storage. Call once, before the first render. */
  public async init(): Promise<void> {
    if (this.ready) return;

    this.store = await createLocalStore();

    try {
      const [published, draft] = await Promise.all([
        this.store.loadPublished(),
        this.store.loadDraft(),
      ]);

      if (published) this.publishedState = this.migrate(published);
      if (draft) this.draftState = this.migrate(draft);
      else this.draftState = clone(this.publishedState);

      await this.hydrateMediaBlobs();
    } catch (err) {
      console.error('[cms] Failed to load stored content, using seed data.', err);
      this.emitError('Could not load saved content — showing the built-in defaults.');
    }

    this.ready = true;

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => void this.flush());
    }

    this.notify();
  }

  /**
   * Stored content may predate fields added later. Fill gaps from the seed so
   * a new field never lands as `undefined` in a live editor.
   */
  private migrate(state: CMSState): CMSState {
    const migrated: CMSState = {
      ...clone(INITIAL_CMS_STATE),
      ...state,
      settings: { ...INITIAL_CMS_STATE.settings, ...(state.settings ?? {}) },
      microcopy: { ...INITIAL_CMS_STATE.microcopy, ...(state.microcopy ?? {}) },
      appearance: { ...INITIAL_CMS_STATE.appearance, ...(state.appearance ?? {}) },
      seo: { ...INITIAL_CMS_STATE.seo, ...(state.seo ?? {}) },
    };

    // Content stored before the structured date fields existed only has the
    // written label. Derive the parts once, so those entries get real date
    // controls too. Never overwrite values that are already set.
    migrated.experience = (migrated.experience ?? []).map((item) => {
      if (item.startDate) return item;
      const parts = parsePeriod(item.period ?? '');
      return {
        ...item,
        startDate: parts.startDate,
        endDate: parts.endDate,
        current: parts.current,
      };
    });

    migrated.projects = (migrated.projects ?? []).map((item) =>
      item.startYear ? item : { ...item, ...parseYearRange(item.year ?? '') }
    );

    migrated.caseStudies = (migrated.caseStudies ?? []).map((item) =>
      item.startYear ? item : { ...item, ...parseYearRange(item.year ?? '') }
    );

    return migrated;
  }

  /** Turn every stored blob into an object URL so `resolveAssetUrl` can find it. */
  private async hydrateMediaBlobs(): Promise<void> {
    if (!this.store) return;
    const ids = await this.store.listMediaIds();
    await Promise.all(
      ids.map(async (id) => {
        const blob = await this.store!.getMedia(id);
        if (blob) registerMediaBlob(id, blob);
      })
    );
  }

  public isReady(): boolean {
    return this.ready;
  }

  public storeName(): string {
    return this.store?.name ?? 'Initialising…';
  }

  public isDurable(): boolean {
    return this.store?.isDurable ?? false;
  }

  // --- SUBSCRIPTIONS ---

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public subscribeErrors(listener: ErrorListener): () => void {
    this.errorListeners.push(listener);
    return () => {
      this.errorListeners = this.errorListeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  private emitError(message: string): void {
    if (this.errorListeners.length === 0) console.error('[cms]', message);
    this.errorListeners.forEach((l) => l(message));
  }

  // --- GETTERS ---

  public getPublishedData(): CMSState {
    return this.publishedState;
  }

  public getDraftData(): CMSState {
    return this.draftState;
  }

  /**
   * True when the draft's *content* differs from what's published.
   *
   * Compares the content itself rather than trusting a status flag, so
   * bookkeeping writes (timestamps, an incoming contact message, a version
   * entry) never light up the Publish button with nothing to publish.
   */
  public hasUnpublishedChanges(): boolean {
    return (
      this.contentFingerprint(this.draftState) !== this.contentFingerprint(this.publishedState)
    );
  }

  /** Serialised content, minus everything that isn't editorial content. */
  private contentFingerprint(state: CMSState): string {
    const {
      status: _status,
      lastSavedAt: _lastSavedAt,
      lastPublishedAt: _lastPublishedAt,
      messages: _messages,
      versions: _versions,
      activityLogs: _activityLogs,
      ...content
    } = state;
    return JSON.stringify(content);
  }

  // --- PERSISTENCE ---

  private scheduleDraftSave(): void {
    this.pendingDraftSave = true;
    if (this.draftSaveTimer) clearTimeout(this.draftSaveTimer);
    this.draftSaveTimer = setTimeout(() => void this.flush(), SAVE_DEBOUNCE_MS);
  }

  /** Write any pending draft immediately. Safe to call at any time. */
  public async flush(): Promise<void> {
    if (this.draftSaveTimer) {
      clearTimeout(this.draftSaveTimer);
      this.draftSaveTimer = null;
    }
    if (!this.pendingDraftSave || !this.store) return;

    this.pendingDraftSave = false;
    try {
      await this.store.saveDraft(this.draftState);
    } catch (err) {
      this.pendingDraftSave = true;
      this.emitError(err instanceof Error ? err.message : 'Failed to save your draft.');
    }
  }

  // --- DRAFT & PUBLISH ---

  public updateDraft(updater: (draft: CMSState) => void): void {
    // A fresh object identity per edit is what makes every bound input update
    // instantly. Storage writes are debounced separately below.
    const nextState = clone(this.draftState);
    updater(nextState);
    nextState.status = 'draft';
    nextState.lastSavedAt = new Date().toISOString();
    this.draftState = nextState;

    this.scheduleDraftSave();
    this.notify();
  }

  public async publishDraft(): Promise<boolean> {
    if (!this.store) return false;

    await this.flush();

    const now = new Date().toISOString();

    const nextPublished = clone(this.draftState);
    nextPublished.status = 'published';
    nextPublished.lastPublishedAt = now;

    // A snapshot holds content only. Excluding history, activity and the
    // message inbox keeps each version small — the previous implementation
    // nested every prior snapshot inside the next one, roughly doubling
    // stored size on every publish.
    const snapshot = clone(nextPublished);
    snapshot.versions = [];
    snapshot.activityLogs = [];
    snapshot.messages = [];

    const version: ContentVersion = {
      id: `v-${Date.now()}`,
      timestamp: now,
      editor: nextPublished.settings.fullName || 'Admin',
      action: 'Published Site Changes',
      summary: this.describeChanges(this.publishedState, nextPublished),
      snapshot,
    };

    const history = [version, ...this.publishedState.versions].slice(0, MAX_VERSIONS);
    const activity = [
      {
        id: `act-${Date.now()}`,
        timestamp: now,
        user: nextPublished.settings.fullName || 'Admin',
        action: 'Published Changes',
        details: version.summary,
      },
      ...this.publishedState.activityLogs,
    ].slice(0, 100);

    nextPublished.versions = history;
    nextPublished.activityLogs = activity;

    this.publishedState = nextPublished;
    this.draftState = clone(nextPublished);

    try {
      await Promise.all([
        this.store.savePublished(this.publishedState),
        this.store.saveDraft(this.draftState),
      ]);
    } catch (err) {
      this.emitError(err instanceof Error ? err.message : 'Failed to publish.');
      this.notify();
      return false;
    }

    this.notify();
    return true;
  }

  /** Plain-language summary of what changed, shown before publishing. */
  public describeChanges(from: CMSState, to: CMSState): string {
    const parts: string[] = [];

    const countDiff = (key: keyof CMSState, label: string) => {
      const a = from[key] as unknown[];
      const b = to[key] as unknown[];
      if (!Array.isArray(a) || !Array.isArray(b)) return;
      if (JSON.stringify(a) !== JSON.stringify(b)) {
        const delta = b.length - a.length;
        const suffix = delta > 0 ? ` (+${delta})` : delta < 0 ? ` (${delta})` : '';
        parts.push(`${label}${suffix}`);
      }
    };

    const objDiff = (key: keyof CMSState, label: string) => {
      if (JSON.stringify(from[key]) !== JSON.stringify(to[key])) parts.push(label);
    };

    objDiff('settings', 'site settings');
    objDiff('microcopy', 'microcopy');
    objDiff('appearance', 'appearance');
    objDiff('seo', 'SEO');
    countDiff('sections', 'sections');
    countDiff('projects', 'projects');
    countDiff('caseStudies', 'case studies');
    countDiff('brands', 'brands');
    countDiff('experience', 'experience');
    countDiff('education', 'education');
    countDiff('processSteps', 'process steps');
    countDiff('capabilityGroups', 'capabilities');
    countDiff('recommendations', 'recommendations');
    countDiff('artifacts', 'visual explorations');
    countDiff('socialLinks', 'social links');
    countDiff('navLinks', 'navigation');
    countDiff('media', 'media');

    if (parts.length === 0) return 'No content changes.';
    return `Changed: ${parts.join(', ')}.`;
  }

  /** Summary of unpublished draft edits, for the Publish button. */
  public pendingChangeSummary(): string {
    return this.describeChanges(this.publishedState, this.draftState);
  }

  public async restoreVersion(versionId: string): Promise<boolean> {
    const target = this.draftState.versions.find((v) => v.id === versionId);
    if (!target?.snapshot) return false;

    const restored = this.migrate(clone(target.snapshot) as CMSState);

    // History, activity and the inbox are not content — carry them forward
    // rather than rolling them back with the page copy.
    restored.versions = this.draftState.versions;
    restored.messages = this.draftState.messages;
    restored.activityLogs = [
      {
        id: `act-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: restored.settings.fullName || 'Admin',
        action: 'Restored Version',
        details: `Restored the snapshot from ${new Date(target.timestamp).toLocaleString()}.`,
      },
      ...this.draftState.activityLogs,
    ].slice(0, 100);
    restored.status = 'draft';
    restored.lastSavedAt = new Date().toISOString();

    this.draftState = restored;
    this.scheduleDraftSave();
    this.notify();
    return true;
  }

  // --- CONTACT MESSAGES ---

  /** Messages live outside the draft/publish cycle — they're inbox data, not content. */
  private async persistBoth(): Promise<void> {
    if (!this.store) return;
    try {
      await Promise.all([
        this.store.savePublished(this.publishedState),
        this.store.saveDraft(this.draftState),
      ]);
    } catch (err) {
      this.emitError(err instanceof Error ? err.message : 'Failed to save.');
    }
  }

  public submitContactMessage(msg: Omit<ContactMessage, 'id' | 'receivedAt' | 'status'>): boolean {
    const newMessage: ContactMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      receivedAt: new Date().toISOString(),
      status: 'unread',
    };

    const nextPublished = clone(this.publishedState);
    const nextDraft = clone(this.draftState);
    nextPublished.messages.unshift(newMessage);
    nextDraft.messages.unshift(newMessage);
    this.publishedState = nextPublished;
    this.draftState = nextDraft;

    void this.persistBoth();
    this.notify();
    return true;
  }

  public updateMessageStatus(
    messageId: string,
    status: 'unread' | 'read' | 'archived' | 'spam'
  ): void {
    const apply = (state: CMSState) => {
      const msg = state.messages.find((m) => m.id === messageId);
      if (msg) msg.status = status;
    };

    const nextPublished = clone(this.publishedState);
    const nextDraft = clone(this.draftState);
    apply(nextPublished);
    apply(nextDraft);
    this.publishedState = nextPublished;
    this.draftState = nextDraft;

    void this.persistBoth();
    this.notify();
  }

  public deleteMessage(messageId: string): void {
    const nextPublished = clone(this.publishedState);
    const nextDraft = clone(this.draftState);
    nextPublished.messages = nextPublished.messages.filter((m) => m.id !== messageId);
    nextDraft.messages = nextDraft.messages.filter((m) => m.id !== messageId);
    this.publishedState = nextPublished;
    this.draftState = nextDraft;

    void this.persistBoth();
    this.notify();
  }

  // --- MEDIA ---

  /**
   * Store an uploaded file as a real Blob and register it in the media library.
   * Content references it as `idb:<id>`; `resolveAssetUrl` turns that back into
   * something an `<img>` can load.
   */
  public async uploadMedia(file: File, meta?: { altText?: string }): Promise<MediaItem | null> {
    if (!this.store) return null;

    const id = `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    try {
      await this.store.putMedia(id, file);
    } catch (err) {
      this.emitError(err instanceof Error ? err.message : 'Upload failed.');
      return null;
    }

    registerMediaBlob(id, file);

    const dimensions = await this.probeDimensions(file);
    const item: MediaItem = {
      id,
      name: file.name,
      url: makeIdbUrl(id),
      type: file.type === 'application/pdf' ? 'pdf' : file.type.includes('svg') ? 'svg' : 'image',
      sizeBytes: file.size,
      dimensions,
      uploadedAt: new Date().toISOString().split('T')[0],
      altText: meta?.altText ?? file.name.replace(/\.[^.]+$/, ''),
      usageCount: 0,
    };

    this.updateDraft((draft) => {
      draft.media.unshift(item);
    });

    return item;
  }

  private probeDimensions(file: File): Promise<string | undefined> {
    if (!file.type.startsWith('image/') || file.type.includes('svg')) {
      return Promise.resolve(undefined);
    }
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(`${img.naturalWidth}x${img.naturalHeight}`);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(undefined);
      };
      img.src = url;
    });
  }

  public async deleteMediaItem(mediaId: string): Promise<void> {
    if (this.store) {
      try {
        await this.store.deleteMedia(mediaId);
      } catch (err) {
        console.warn('[cms] Failed to remove blob', mediaId, err);
      }
    }
    unregisterMediaBlob(mediaId);
    this.updateDraft((draft) => {
      draft.media = draft.media.filter((m) => m.id !== mediaId);
    });
  }

  /** How many places in the content tree reference a given media item. */
  public countMediaUsage(mediaId: string): number {
    const needle = makeIdbUrl(mediaId);
    const haystack = JSON.stringify({ ...this.draftState, media: [], versions: [] });
    return haystack.split(`"${needle}"`).length - 1;
  }

  // --- EXPORT / IMPORT / RESET ---

  public async exportBundle(): Promise<ContentBundle> {
    await this.flush();

    const media: ContentBundle['media'] = [];
    if (this.store) {
      const ids = await this.store.listMediaIds();
      for (const id of ids) {
        const blob = await this.store.getMedia(id);
        if (!blob) continue;
        media.push({ id, mimeType: blob.type, dataUrl: await blobToDataUrl(blob) });
      }
    }

    return {
      format: BUNDLE_FORMAT,
      version: 1,
      exportedAt: new Date().toISOString(),
      published: this.publishedState,
      draft: this.draftState,
      media,
    };
  }

  public async importBundle(bundle: unknown): Promise<{ ok: boolean; error?: string }> {
    if (!this.store) return { ok: false, error: 'Storage is not ready yet.' };

    const b = bundle as Partial<ContentBundle>;
    if (!b || !b.format || !ACCEPTED_BUNDLE_FORMATS.includes(b.format)) {
      return { ok: false, error: 'That file is not a portfolio content bundle.' };
    }
    if (typeof b.version === 'number' && b.version > 1) {
      return {
        ok: false,
        error: `That backup was made by a newer version (bundle format ${b.version}). Update this site, then import again.`,
      };
    }
    if (!b.published) {
      return { ok: false, error: 'That bundle has no published content in it.' };
    }

    try {
      await this.store.clearAll();

      for (const m of b.media ?? []) {
        const blob = await dataUrlToBlob(m.dataUrl);
        await this.store.putMedia(m.id, blob);
        registerMediaBlob(m.id, blob);
      }

      this.publishedState = this.migrate(b.published);
      this.draftState = this.migrate(b.draft ?? b.published);

      await Promise.all([
        this.store.savePublished(this.publishedState),
        this.store.saveDraft(this.draftState),
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Import failed.';
      this.emitError(message);
      return { ok: false, error: message };
    }

    this.notify();
    return { ok: true };
  }

  public async resetToSeed(): Promise<void> {
    if (!this.store) return;
    await this.store.clearAll();
    this.publishedState = clone(INITIAL_CMS_STATE);
    this.draftState = clone(INITIAL_CMS_STATE);
    await Promise.all([
      this.store.savePublished(this.publishedState),
      this.store.saveDraft(this.draftState),
    ]);
    this.notify();
  }

  /** Media blobs with no remaining reference in content. */
  public async findOrphanedMedia(): Promise<string[]> {
    if (!this.store) return [];
    const ids = await this.store.listMediaIds();
    return ids.filter((id) => this.countMediaUsage(id) === 0);
  }

  // --- AUTHENTICATION ---
  //
  // Local gate only. The passcode lives in .env.local and is still bundled
  // into the client build, so this keeps casual visitors out of /admin and
  // nothing more. Real auth arrives with the hosted backend.

  public isAuthenticated(): boolean {
    try {
      const raw = localStorage.getItem(CMS_AUTH_KEY);
      if (!raw) return false;
      const { expiresAt } = JSON.parse(raw) as { expiresAt: number };
      if (Date.now() > expiresAt) {
        localStorage.removeItem(CMS_AUTH_KEY);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  public async login(email: string, pass: string): Promise<{ success: boolean; error?: string }> {
    const expectedEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    const expectedPass = process.env.NEXT_PUBLIC_ADMIN_PASSCODE;

    if (!expectedPass) {
      return {
        success: false,
        error:
          'No admin passcode configured. Set NEXT_PUBLIC_ADMIN_PASSCODE in .env.local and restart the dev server.',
      };
    }

    const emailOk = !expectedEmail || email.trim().toLowerCase() === expectedEmail.toLowerCase();
    if (!emailOk || pass !== expectedPass) {
      return { success: false, error: 'Invalid email or passcode.' };
    }

    localStorage.setItem(CMS_AUTH_KEY, JSON.stringify({ expiresAt: Date.now() + AUTH_TTL_MS }));
    this.notify();
    return { success: true };
  }

  public logout(): void {
    localStorage.removeItem(CMS_AUTH_KEY);
    this.notify();
  }
}

export const cmsService = CMSService.getInstance();

/** Re-exported so callers don't need to reach into utils for the common case. */
export { isIdbUrl, mediaIdFromUrl };
