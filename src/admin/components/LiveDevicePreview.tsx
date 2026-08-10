import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Monitor, Tablet, Smartphone, ExternalLink, X, RefreshCw } from 'lucide-react';
import { useCMS } from '../../cms/context/CMSContext';
import { cmsService } from '../../cms/services/cmsService';

interface LiveDevicePreviewProps {
  onClose?: () => void;
}

/** Wait for typing to settle before reloading the frame. */
const REFRESH_DEBOUNCE_MS = 1200;

export const LiveDevicePreview: React.FC<LiveDevicePreviewProps> = ({ onClose }) => {
  const { previewDevice, setPreviewDevice, draftData } = useCMS();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * The preview runs in its own document with its own copy of the CMS, reading
   * from storage at load. So a refresh means: flush the pending draft write,
   * then reload the frame.
   */
  const refresh = useCallback(async () => {
    setRefreshing(true);
    await cmsService.flush();
    const frame = iframeRef.current;
    if (frame) {
      // Reassigning src reloads without adding browser history entries.
      frame.src = `/?preview=true&t=${Date.now()}`;
    }
    setTimeout(() => setRefreshing(false), 400);
  }, []);

  // Follow edits automatically, debounced so it doesn't reload per keystroke.
  const lastSavedAt = draftData.lastSavedAt;
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    const timer = setTimeout(() => void refresh(), REFRESH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [lastSavedAt, refresh]);

  const frameClass =
    previewDevice === 'mobile'
      ? 'w-[390px] h-[720px] rounded-[36px] border-[6px] border-border shadow-2xl'
      : previewDevice === 'tablet'
        ? 'w-[768px] h-[840px] rounded-[24px] border-[4px] border-border shadow-xl'
        : 'w-full h-full rounded-2xl border border-border shadow-md';

  const deviceButton = (
    device: 'desktop' | 'tablet' | 'mobile',
    Icon: typeof Monitor,
    title: string
  ) => (
    <button
      onClick={() => setPreviewDevice(device)}
      title={title}
      aria-label={title}
      aria-pressed={previewDevice === device}
      className={`p-1.5 rounded-lg transition-colors ${
        previewDevice === device
          ? 'bg-accent text-bg font-medium'
          : 'text-text-muted hover:text-text-primary'
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div className="h-full flex flex-col bg-surface-primary border-l border-border select-none overflow-hidden">
      <div className="p-3 border-b border-border bg-[var(--color-background-muted)] flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-[var(--color-icon-yellow)] animate-pulse flex-shrink-0" />
          <span className="text-xs font-medium text-text-primary truncate">Draft preview</span>
        </div>

        <div className="flex items-center gap-1 bg-surface-primary border border-border p-1 rounded-xl flex-shrink-0">
          {deviceButton('desktop', Monitor, 'Desktop view')}
          {deviceButton('tablet', Tablet, 'Tablet view (768px)')}
          {deviceButton('mobile', Smartphone, 'Mobile view (390px)')}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => void refresh()}
            title="Refresh preview"
            aria-label="Refresh preview"
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary border border-border hover:bg-surface-secondary transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-accent' : ''}`} />
          </button>

          <a
            href="/?preview=true"
            target="_blank"
            rel="noopener noreferrer"
            title="Open draft in a new tab"
            aria-label="Open draft in a new tab"
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary border border-border hover:bg-surface-secondary transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          {onClose && (
            <button
              onClick={onClose}
              title="Close preview"
              aria-label="Close preview"
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary border border-border hover:bg-surface-secondary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-grow p-4 bg-[var(--color-background-body)] flex items-center justify-center overflow-auto relative">
        <div className={`transition-all duration-300 overflow-hidden bg-bg relative ${frameClass}`}>
          <iframe
            ref={iframeRef}
            src="/?preview=true"
            title="Draft preview of the portfolio"
            className="w-full h-full border-none"
          />
        </div>
      </div>

      <div className="px-3 py-2 border-t border-border bg-[var(--color-background-muted)]">
        <p className="text-[length:var(--font-size-sm)] text-text-muted leading-relaxed">
          Shows unpublished draft content. Visitors see the published version until you publish.
        </p>
      </div>
    </div>
  );
};
