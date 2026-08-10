'use client';

import React, { useState } from 'react';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { useCMS } from '../../cms/context/CMSContext';
import { CMSImage } from '../../components/common/CMSImage';
import { AstryxHeader, AstryxCard, AstryxBadge } from '../components/astryx/AstryxComponents';
import { Trash2, FileDown, Upload, Copy, Check, AlertTriangle } from 'lucide-react';

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export const AdminMediaLibrary: React.FC = () => {
  const { draftData, updateDraft, uploadMedia, deleteMediaItem, countMediaUsage } = useCMS();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const media = draftData.media;
  const totalBytes = media.reduce((sum, m) => sum + (m.sizeBytes || 0), 0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;

    setBusy(true);
    try {
      for (const file of files) {
        const item = await uploadMedia(file);
        // A PDF upload is almost always a new résumé — point the site at it.
        if (item && item.type === 'pdf') {
          updateDraft((draft) => {
            draft.settings.resumeUrl = item.url;
            draft.settings.resumeFilename = file.name;
          });
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const handleCopyRef = (url: string, id: string) => {
    void navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string, name: string) => {
    const uses = countMediaUsage(id);
    const warning =
      uses > 0
        ? `"${name}" is used in ${uses} place${uses === 1 ? '' : 's'} on the site. Deleting it will leave those images blank.\n\nDelete anyway?`
        : `Delete "${name}"? This cannot be undone.`;
    if (!window.confirm(warning)) return;
    await deleteMediaItem(id);
  };

  return (
    <VStack gap={6}>
      <AstryxHeader
        badgeText="Assets"
        title={`Media Library (${media.length})`}
        subtitle={`Images and PDFs used across the site. ${formatSize(totalBytes)} stored. Uploading a PDF also sets it as the downloadable résumé.`}
      >
        <label
          className={`h-[42px] px-5 rounded-full bg-accent text-bg text-xs font-medium hover:opacity-90 transition-all flex items-center gap-2 shadow-sm ${
            busy ? 'opacity-60 cursor-wait' : 'cursor-pointer'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>{busy ? 'Uploading…' : 'Upload Assets'}</span>
          <input
            type="file"
            multiple
            onChange={(e) => void handleFileUpload(e)}
            className="hidden"
            accept="image/*,.pdf"
            disabled={busy}
          />
        </label>
      </AstryxHeader>

      {media.length === 0 && (
        <AstryxCard variant="surface">
          <p className="text-sm text-text-secondary">
            Nothing uploaded yet. Files you add here are stored in this browser and can be picked
            from any image field in the admin.
          </p>
        </AstryxCard>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg2:grid-cols-4 gap-4 sm:gap-6">
        {media.map((item) => {
          const isCopied = copiedId === item.id;
          const isPdf = item.type === 'pdf';
          const uses = countMediaUsage(item.id);

          return (
            <AstryxCard key={item.id} variant="default" density="compact" className="space-y-3">
              {/* Fixed height, not an aspect ratio: an aspect box grows with the
                  grid column, so on a wide screen the thumbnail became the page. */}
              <div className="h-28 rounded-[var(--radius-element)] overflow-hidden bg-[var(--color-background-muted)] border border-[var(--color-border)] relative flex items-center justify-center">
                {isPdf ? (
                  <div className="text-center p-4">
                    <FileDown className="w-10 h-10 text-accent mx-auto mb-2" />
                    <span className="text-xs text-text-primary font-medium block truncate max-w-[200px]">
                      {item.name}
                    </span>
                  </div>
                ) : (
                  // Contain, not cover: in a library the point is to recognise
                  // the asset, and a cropped portrait is harder to place.
                  <CMSImage
                    src={item.url}
                    alt={item.altText}
                    className="max-h-full max-w-full object-contain p-2"
                  />
                )}

                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                  {uses === 0 && (
                    <AstryxBadge variant="amber" dot={false}>
                      unused
                    </AstryxBadge>
                  )}
                  <AstryxBadge variant={isPdf ? 'cyan' : 'neutral'}>
                    {item.type.toUpperCase()}
                  </AstryxBadge>
                </div>
              </div>

              <HStack gap={2} justify="between" align="center">
                <div className="min-w-0">
                  <h3 className="text-xs font-medium text-text-primary truncate">{item.name}</h3>
                  <span className="text-[length:var(--font-size-sm)] text-text-muted">
                    {formatSize(item.sizeBytes)}
                    {item.dimensions ? ` • ${item.dimensions}` : ''} • used {uses}×
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleCopyRef(item.url, item.id)}
                    className="p-2 rounded-xl border border-border text-text-muted hover:text-text-primary hover:bg-surface-secondary cursor-pointer"
                    title="Copy the reference to paste into an image field"
                    aria-label="Copy reference"
                  >
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-accent" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={() => void handleDelete(item.id, item.name)}
                    className="p-2 rounded-xl border border-border text-text-muted hover:text-[var(--color-text-red)] hover:bg-surface-secondary cursor-pointer"
                    title="Delete asset"
                    aria-label="Delete asset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </HStack>

              {item.url.startsWith('data:') && (
                <div className="flex items-start gap-1.5 text-[length:var(--font-size-sm)] text-[var(--color-text-yellow)]">
                  <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  <span>Legacy inline copy — re-upload to move it into blob storage.</span>
                </div>
              )}
            </AstryxCard>
          );
        })}
      </div>
    </VStack>
  );
};
