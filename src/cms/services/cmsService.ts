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

/** What `POST /api/admin/media` returns once the backend has the bytes. */
interface UploadedMedia {
  key: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
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

    await this.adoptServerDraft();

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

    // And to the server, which is what Preview reads.
    //
    // The local copy alone is the original architecture's mistake in miniature:
    // a draft that only exists in the editor's own browser cannot be previewed
    // on a phone, cannot be picked up on another machine, and disappears with
    // the site data. Failing here is reported but not fatal — the local save
    // already succeeded, so the work is not lost.
    await this.pushDraftToServer();
  }

  /**
   * Sends the draft to the server's draft channel.
   *
   * Conditional on the revision we last saw, so two tabs cannot silently
   * overwrite each other. On conflict the server sends back what it has; the
   * work here is kept and the person is told, rather than one side vanishing.
   */
  private async pushDraftToServer(): Promise<void> {
    // Learn where the server is before the first save, so even that one is
    // conditional. Otherwise the first autosave from a second tab overwrites
    // whatever the first tab had done, which is the exact case this is for.
    if (this.draftRevision === undefined) {
      try {
        const res = await fetch('/api/admin/draft');
        const data = (await res.json().catch(() => ({}))) as { revision?: number };
        this.draftRevision = data.revision ?? 0;
      } catch {
        this.draftRevision = 0;
      }
    }

    const snapshot = clone(this.draftState);
    snapshot.versions = [];
    snapshot.activityLogs = [];
    snapshot.messages = [];

    try {
      const res = await fetch('/api/admin/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: snapshot, expectedRevision: this.draftRevision }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        revision?: number;
        error?: string;
        conflict?: { current: number };
      };

      if (res.status === 409) {
        // Adopt the server's revision so the *next* save is a deliberate
        // overwrite rather than an endless loop of rejected autosaves.
        this.draftRevision = data.conflict?.current;
        this.emitError(
          data.error ?? 'This site was changed somewhere else. Your next save will overwrite it.'
        );
        return;
      }

      if (res.ok && data.ok) this.draftRevision = data.revision;
    } catch {
      // Offline, or the server is down. The local draft is already saved.
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

  /**
   * Takes the server's draft when it is the newer one.
   *
   * The browser store used to be the only source, and on a second machine — or
   * after clearing your browser — it holds nothing, so the admin seeded itself
   * from the built-in demo content and showed that as your site. The first
   * autosave then pushed the demo content over your real draft. Silent, and
   * it destroyed work rather than merely displaying the wrong thing.
   *
   * `lastSavedAt` decides rather than "server always wins", because always
   * preferring the server would throw away edits made while offline — the
   * opposite mistake, and just as quiet. Whichever was written last is the one
   * somebody actually made, and the loser is kept in neither place because the
   * winner is written straight back to the local store.
   */
  private async adoptServerDraft(): Promise<void> {
    try {
      const res = await fetch('/api/admin/draft');
      if (!res.ok) return;

      const data = (await res.json()) as { revision?: number; content?: CMSState | null };
      this.draftRevision = data.revision;
      if (!data.content) return;

      const serverAt = Date.parse(data.content.lastSavedAt ?? '') || 0;
      const localAt = Date.parse(this.draftState.lastSavedAt ?? '') || 0;
      if (serverAt <= localAt) return;

      this.draftState = this.migrate(data.content);
      await this.store?.saveDraft(this.draftState);
      this.notify();
    } catch {
      // Offline, or the session has expired. The local copy still works, and
      // the conditional save will refuse to overwrite anything newer.
    }
  }

  /**
   * Sends the published snapshot to the server.
   *
   * Without this the whole publish flow is local theatre: the draft becomes the
   * published copy in this browser and a visitor sees none of it. Returns false
   * on failure so the caller can tell the user rather than showing success.
   */
  /** The draft revision this editor last saw. Undefined until the first save. */
  private draftRevision: number | undefined;

  private async pushToServer(state: CMSState): Promise<{ ok: boolean; error?: string }> {
    try {
      const res = await fetch('/api/admin/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: state }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        return {
          ok: false,
          error: data.error ?? `The server refused the publish (${res.status}).`,
        };
      }
      return { ok: true };
    } catch {
      return { ok: false, error: 'Could not reach the server to publish.' };
    }
  }

  public async publishDraft(): Promise<boolean> {
    if (!this.store) return false;

    await this.flush();

    const now = new Date().toISOString();

    const nextPublished = clone(this.draftState);
    nextPublished.status = 'published';
    nextPublished.lastPublishedAt = now;

    // A snapshot holds content only. Excluding history and activity keeps each
    // version small — the previous implementation nested every prior snapshot
    // inside the next one, roughly doubling stored size on every publish. The
    // inbox goes too, and for a graver reason: the server's enquiries are read
    // into `messages`, versions ride inside the published document, and that
    // document is serialised into the HTML of every public page. A version
    // holding the inbox publishes other people's names and addresses.
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

    // The local copies are saved; now make it real for visitors. A failure here
    // is reported rather than swallowed — the previous behaviour of reporting
    // success while nothing left the browser is the bug this replaces.
    const pushed = await this.pushToServer(this.publishedState);
    if (!pushed.ok) {
      this.emitError(
        `${pushed.error} Your changes are saved in this browser, but the live site has not been updated.`
      );
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
    // rather than rolling them back with the page copy. The inbox especially:
    // it belongs to the server, and rolling it back would resurrect enquiries
    // that were deleted and hide any that arrived since the snapshot, until
    // the next reload quietly disagreed with the screen.
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

  /**
   * Whether this instance can send mail. Answered by the server.
   *
   * Undefined until it has answered, and deliberately not `false`: "we have not
   * asked yet" and "there is no mail server" are different states, and the
   * dashboard warns about the second one.
   */
  public emailConfigured: boolean | undefined = undefined;

  /**
   * Replaces the in-memory inbox with what the server holds.
   *
   * Enquiries are not part of the content document any more, but every screen
   * that shows them still reads `state.messages` — the sidebar badge, the
   * command palette, the analytics page, the dashboard's health checks. Putting
   * the server's list back into that field keeps all of them working without a
   * rewrite, and keeps `exportBundle` complete.
   */
  public setMessages(messages: ContactMessage[], emailConfigured: boolean): void {
    this.emailConfigured = emailConfigured;
    const nextPublished = clone(this.publishedState);
    const nextDraft = clone(this.draftState);
    nextPublished.messages = messages;
    nextDraft.messages = messages;
    this.publishedState = nextPublished;
    this.draftState = nextDraft;
    this.notify();
  }

  public async updateMessageStatus(
    messageId: string,
    status: ContactMessage['status']
  ): Promise<void> {
    await fetch(`/api/admin/messages/${encodeURIComponent(messageId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => undefined);

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
    this.notify();
  }

  public async deleteMessage(messageId: string): Promise<void> {
    await fetch(`/api/admin/messages/${encodeURIComponent(messageId)}`, {
      method: 'DELETE',
    }).catch(() => undefined);

    const nextPublished = clone(this.publishedState);
    const nextDraft = clone(this.draftState);
    nextPublished.messages = nextPublished.messages.filter((m) => m.id !== messageId);
    nextDraft.messages = nextDraft.messages.filter((m) => m.id !== messageId);
    this.publishedState = nextPublished;
    this.draftState = nextDraft;
    this.notify();
  }

  // --- MEDIA ---

  /**
   * Send an uploaded file to the server and register it in the media library.
   *
   * The bytes go to whichever storage backend is configured, and the content
   * records `/api/media/<key>` — a URL that resolves for anyone, not just the
   * browser that did the uploading. The previous design kept uploads in this
   * browser's IndexedDB and wrote an `idb:` reference into the content, which
   * published to visitors as a blank pixel.
   */
  public async uploadMedia(file: File, meta?: { altText?: string }): Promise<MediaItem | null> {
    const body = new FormData();
    body.append('file', file);

    let payload: { ok: boolean; error?: string; media?: UploadedMedia };
    try {
      const res = await fetch('/api/admin/media', { method: 'POST', body });
      payload = await res.json();
    } catch {
      this.emitError('Could not reach the server. Check your connection and try again.');
      return null;
    }

    if (!payload.ok || !payload.media) {
      this.emitError(payload.error ?? 'Upload failed.');
      return null;
    }

    const { key, url, mimeType, sizeBytes } = payload.media;

    // Kept locally as well, so the editor renders the new image immediately
    // rather than waiting on a round trip to the store it was just written to.
    if (this.store) {
      try {
        await this.store.putMedia(key, file);
        registerMediaBlob(key, file);
      } catch {
        // A full quota is not a reason to lose an upload the server accepted.
      }
    }

    const dimensions = await this.probeDimensions(file);
    const item: MediaItem = {
      id: key,
      name: file.name,
      url,
      type: mimeType === 'application/pdf' ? 'pdf' : 'image',
      sizeBytes,
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
    const item = this.draftState.media.find((m) => m.id === mediaId);

    // Legacy items only ever existed in this browser, so there is nothing on
    // the server to remove for them.
    if (item && !isIdbUrl(item.url)) {
      try {
        await fetch(`/api/admin/media?key=${encodeURIComponent(mediaId)}`, { method: 'DELETE' });
      } catch (err) {
        console.warn('[cms] Failed to remove server media', mediaId, err);
      }
    }

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
    // Match on the URL actually written into content. Uploads now carry
    // `/api/media/<key>`; anything from before still carries `idb:<id>`.
    const item = this.draftState.media.find((m) => m.id === mediaId);
    const needle = item?.url ?? makeIdbUrl(mediaId);
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
  // All of it now happens on the server. What used to be here was a passcode
  // compiled into the public bundle, compared in the browser, with the result
  // recorded as an unsigned object in localStorage that anyone could forge.
  //
  // The session is an httpOnly cookie the browser cannot read, so this class
  // holds only a cached yes/no answer, refreshed from /api/auth/session.

  private authState = false;

  public isAuthenticated(): boolean {
    return this.authState;
  }

  /** Asks the server whether this browser currently holds a valid session. */
  public async refreshAuth(): Promise<boolean> {
    try {
      const res = await fetch('/api/auth/session', { cache: 'no-store' });
      const data = (await res.json()) as { signedIn?: boolean };
      this.authState = Boolean(data.signedIn);
    } catch {
      this.authState = false;
    }
    this.notify();
    return this.authState;
  }

  public async login(email: string, pass: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, passphrase: pass }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!data.ok) {
        return { success: false, error: data.error ?? 'That did not work.' };
      }

      this.authState = true;
      this.notify();
      return { success: true };
    } catch {
      return { success: false, error: 'Could not reach the server.' };
    }
  }

  public async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      this.authState = false;
      this.notify();
    }
  }
}

export const cmsService = CMSService.getInstance();

/** Re-exported so callers don't need to reach into utils for the common case. */
export { isIdbUrl, mediaIdFromUrl };
