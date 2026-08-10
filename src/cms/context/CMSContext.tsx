import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { CMSState, MediaItem } from '../types/cms';
import { cmsService } from '../services/cmsService';
import { loadGoogleFonts } from '../../utils/googleFonts';

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
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;

  submitContactMessage: (msg: any) => boolean;
  updateMessageStatus: (id: string, status: any) => void;
  deleteMessage: (id: string) => void;

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

export const CMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [publishedData, setPublishedData] = useState<CMSState>(() => cmsService.getPublishedData());
  const [draftData, setDraftData] = useState<CMSState>(() => cmsService.getDraftData());
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(detectPreviewFlag);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [authStatus, setAuthStatus] = useState<boolean>(() => cmsService.isAuthenticated());
  const [storageError, setStorageError] = useState<string | null>(null);

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

    const root = document.documentElement;
    const vars: [string, string | undefined][] = [
      ['--color-accent-dark', appearance.accentDark],
      ['--color-accent-light', appearance.accentLight],
      ['--color-bg-dark', appearance.backgroundDark],
      ['--color-bg-light', appearance.backgroundLight],
      ['--color-border-dark', appearance.strokeDark],
      ['--color-border-light', appearance.strokeLight],
    ];
    vars.forEach(([name, value]) => {
      if (value) root.style.setProperty(name, value);
    });
  }, [appearance]);

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

  const logout = useCallback(() => {
    cmsService.logout();
    setAuthStatus(false);
  }, []);

  const submitContactMessage = useCallback((msg: any) => cmsService.submitContactMessage(msg), []);
  const updateMessageStatus = useCallback(
    (id: string, status: any) => cmsService.updateMessageStatus(id, status),
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
        login,
        logout,
        submitContactMessage,
        updateMessageStatus,
        deleteMessage,
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
