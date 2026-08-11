'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { CMSState, ContactMessage, MediaItem } from '../types/cms';
import { cmsService } from '../services/cmsService';
import { loadGoogleFonts } from '../../utils/googleFonts';
import { buildThemeStylesheet } from '@/core/theme/tokens';

interface CMSContextType {
  /** What the site should render: published content, or the draft in preview mode. */
  data: CMSState;
  draftData: CMSState;
  publishedData: CMSState;

  /** True when this window is rendering unpublished content (`?preview=true`). */
  isPreviewMode: boolean;
  setIsPreviewMode: (val: boolean) => void;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  setPreviewDevice: (device: 'desktop' | 'tablet' | 'mobile') => void;

  updateDraft: (updater: (draft: CMSState) => void) => void;
  publishDraft: () => Promise<boolean>;
  restoreVersion: (versionId: string) => Promise<boolean>;

  hasUnpublishedChanges: boolean;
  pendingChangeSummary: string;

  isAuthenticated: boolean;
  /** False until the server has answered. Guards must wait for it. */
  authReady: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;

  updateMessageStatus: (id: string, status: ContactMessage['status']) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  /** Whether this instance can send mail. Read by the dashboard's health checks. */
  emailConfigured: boolean;

  uploadMedia: (file: File, meta?: { altText?: string }) => Promise<MediaItem | null>;
  deleteMediaItem: (id: string) => Promise<void>;
  countMediaUsage: (id: string) => number;

  /** Last storage error, if any. Cleared once shown. */
  storageError: string | null;
  clearStorageError: () => void;
  storeName: string;
  isDurable: boolean;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

/**
 * The admin's preview iframe loads the site with `?preview=true`. Read it once
 * at module load — it can't change without a navigation, and reading it here
 * keeps the check out of every render.
 */
function detectPreviewFlag(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('preview') === 'true';
}

interface CMSProviderProps {
  children: React.ReactNode;
  /**
   * Content rendered on the server for the first paint.
   *
   * Without it the server and the browser disagree about what to draw and React
   * discards the server HTML. Stored content still wins — `cmsService.init()`
   * replaces this the moment IndexedDB has loaded.
   */
  initialData?: CMSState;
}

export const CMSProvider: React.FC<CMSProviderProps> = ({ children, initialData }) => {
  const [publishedData, setPublishedData] = useState<CMSState>(
    () => initialData ?? cmsService.getPublishedData()
  );
  const [draftData, setDraftData] = useState<CMSState>(
    () => initialData ?? cmsService.getDraftData()
  );
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(detectPreviewFlag);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [authStatus, setAuthStatus] = useState<boolean>(() => cmsService.isAuthenticated());
  const [storageError, setStorageError] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [emailConfigured, setEmailConfigured] = useState(false);

  // Storage is browser-only, so the server cannot read it. Load it on mount and
  // swap: the HTML ships with the server's content, then the editor's own
  // stored content takes over. This bridge disappears once content lives in a
  // backend the server can query.
  useEffect(() => {
    let cancelled = false;
    void cmsService.init().then(async () => {
      if (cancelled) return;
      setPublishedData(cmsService.getPublishedData());
      setDraftData(cmsService.getDraftData());
      // The session lives in an httpOnly cookie, so the only way to know
      // whether we are signed in is to ask the server.
      const signedIn = await cmsService.refreshAuth();
      if (cancelled) return;
      setAuthStatus(signedIn);
      setAuthReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = cmsService.subscribe(() => {
      setPublishedData(cmsService.getPublishedData());
      setDraftData(cmsService.getDraftData());
      setAuthStatus(cmsService.isAuthenticated());
    });
    const unsubscribeErrors = cmsService.subscribeErrors((message) => setStorageError(message));
    return () => {
      unsubscribe();
      unsubscribeErrors();
    };
  }, []);

  // Enquiries live on the server now. Fetch them once the admin is signed in,
  // and put them where every existing consumer already looks.
  useEffect(() => {
    if (!authStatus) return;
    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch('/api/admin/messages');
        if (!res.ok) return;
        const body = (await res.json()) as {
          ok: boolean;
          messages: ContactMessage[];
          emailConfigured: boolean;
        };
        if (!cancelled && body.ok) {
          cmsService.setMessages(body.messages, body.emailConfigured);
          setEmailConfigured(body.emailConfigured);
        }
      } catch {
        // The inbox stays empty; the dashboard's storage check reports the fault.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authStatus]);

  // Preview windows render the draft; everything else renders published content.
  const activeData = isPreviewMode ? draftData : publishedData;

  // Appearance follows whatever is being rendered, so the preview iframe shows
  // draft colours and fonts while the live site keeps the published ones.
  const appearance = activeData.appearance;
  useEffect(() => {
    if (!appearance) return;

    loadGoogleFonts(
      appearance.displayFontFamily || 'Instrument Serif',
      appearance.bodyFontFamily || 'Geist',
      appearance.monoFontFamily || undefined
    );

    // Colours are server-rendered from the published appearance, so a visitor
    // is painted the right palette immediately and there is nothing to do here.
    // The draft preview is the exception: it is showing colours the server has
    // not been told about yet.
    if (!isPreviewMode) return;

    // A stylesheet rather than inline properties on the root, so both palettes
    // are present and switching between light and dark inside the preview still
    // works. Inline values would pin whichever mode was current when they were
    // written.
    const id = 'opb-draft-theme';
    let el = document.getElementById(id) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement('style');
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = buildThemeStylesheet(appearance);
  }, [appearance, isPreviewMode]);

  const updateDraft = useCallback((updater: (draft: CMSState) => void) => {
    cmsService.updateDraft(updater);
  }, []);

  const publishDraft = useCallback(() => cmsService.publishDraft(), []);
  const restoreVersion = useCallback(
    (versionId: string) => cmsService.restoreVersion(versionId),
    []
  );

  const login = useCallback(async (email: string, pass: string) => {
    const res = await cmsService.login(email, pass);
    if (res.success) setAuthStatus(true);
    return res;
  }, []);

  const logout = useCallback(async () => {
    await cmsService.logout();
    setAuthStatus(false);
  }, []);

  const updateMessageStatus = useCallback(
    (id: string, status: ContactMessage['status']) => cmsService.updateMessageStatus(id, status),
    []
  );
  const deleteMessage = useCallback((id: string) => cmsService.deleteMessage(id), []);

  const uploadMedia = useCallback(
    (file: File, meta?: { altText?: string }) => cmsService.uploadMedia(file, meta),
    []
  );
  const deleteMediaItem = useCallback((id: string) => cmsService.deleteMediaItem(id), []);
  const countMediaUsage = useCallback((id: string) => cmsService.countMediaUsage(id), []);
  const clearStorageError = useCallback(() => setStorageError(null), []);

  // Derived from the content itself, so a timestamp-only write doesn't offer
  // a publish with nothing in it.
  const hasUnpublishedChanges = useMemo(
    () => cmsService.hasUnpublishedChanges(),
    [publishedData, draftData]
  );
  const pendingChangeSummary = useMemo(
    () =>
      hasUnpublishedChanges ? cmsService.describeChanges(publishedData, draftData) : 'No changes.',
    [hasUnpublishedChanges, publishedData, draftData]
  );

  return (
    <CMSContext.Provider
      value={{
        data: activeData,
        draftData,
        publishedData,
        isPreviewMode,
        setIsPreviewMode,
        previewDevice,
        setPreviewDevice,
        updateDraft,
        publishDraft,
        restoreVersion,
        hasUnpublishedChanges,
        pendingChangeSummary,
        isAuthenticated: authStatus,
        authReady,
        login,
        logout,
        updateMessageStatus,
        deleteMessage,
        emailConfigured,
        uploadMedia,
        deleteMediaItem,
        countMediaUsage,
        storageError,
        clearStorageError,
        storeName: cmsService.storeName(),
        isDurable: cmsService.isDurable(),
      }}
    >
      {children}
    </CMSContext.Provider>
  );
};

export const useCMS = () => {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
};
