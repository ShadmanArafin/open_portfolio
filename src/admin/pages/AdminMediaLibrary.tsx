'use client';

import React, { useState } from 'react';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { useCMS } from '../../cms/context/CMSContext';
import { CMSImage } from '../../components/common/CMSImage';
import { AstryxHeader, AstryxCard, AstryxBadge } from '../components/astryx/AstryxComponents';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Trash2, FileDown, Upload, Copy, Check, AlertTriangle } from 'lucide-react';

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export const AdminMediaLibrary: React.FC = () => {
  const { draftData, updateDraft, uploadMedia, deleteMediaItem, countMediaUsage } = useCMS();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // A PDF upload is almost always a new résumé — but a case-study attachment
  // must never hijack the CV link silently, so the choice is asked here.
  const [pdfChoice, setPdfChoice] = useState<{ url: string; name: string } | null>(null);
  const [assetToDelete, setAssetToDelete] = useState<{ id: string; name: string } | null>(null);

  const media = draftData.media;
  const totalBytes = media.reduce((sum, m) => sum + (m.sizeBytes || 0), 0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;

    setBusy(true);
    try {
      const uploaded: { url: string; name: string }[] = [];
      for (const file of files) {
        const item = await uploadMedia(file);
        if (item && item.type === 'pdf') uploaded.push({ url: item.url, name: file.name });
      }
      // One question for the batch, naming the newest: per-file interrogation
      // turns a five-PDF upload into five modals.
      if (uploaded.length > 0) setPdfChoice(uploaded[uploaded.length - 1]);
    } finally {
      setBusy(false);
    }
  };

  const usePdfAsResume = () => {
    if (!pdfChoice) return;
    const { url, name } = pdfChoice;
    updateDraft((draft) => {
      draft.settings.resumeUrl = url;
      draft.settings.resumeFilename = name;
    });
    setPdfChoice(null);
  };

  const handleCopyRef = (url: string, id: string) => {
    void navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async () => {
    if (!assetToDelete) return;
    await deleteMediaItem(assetToDelete.id);
    setAssetToDelete(null);
  };

  const deleteWarning = (id: string, name: string) => {
    const uses = countMediaUsage(id);
    return uses > 0
      ? `"${name}" is used in ${uses} place${uses === 1 ? '' : 's'} on the site. Deleting it will leave those images blank.`
      : `Delete "${name}"? This cannot be undone.`;
  };

  return (
    <VStack gap={6}>
      <ConfirmDialog
        isOpen={pdfChoice !== null}
        title={
          pdfChoice ? `Use "${pdfChoice.name}" as your downloadable résumé?` : 'Use as résumé?'
        }
        description="Choosing No keeps it in the library without changing the current link."
        confirmLabel="Use as résumé"
        cancelLabel="Keep in library"
        onConfirm={usePdfAsResume}
        onClose={() => setPdfChoice(null)}
      />
      <ConfirmDialog
        isOpen={assetToDelete !== null}
        title={assetToDelete ? `Delete "${assetToDelete.name}"?` : 'Delete asset?'}
        description={
          assetToDelete ? deleteWarning(assetToDelete.id, assetToDelete.name) : undefined
        }
        confirmLabel="Delete asset"
        tone="danger"
        onConfirm={() => void handleDelete()}
        onClose={() => setAssetToDelete(null)}
      />
      <AstryxHeader
        badgeText="Assets"
        title={`Media Library (${media.length})`}
        subtitle={`Images and PDFs used across the site. ${formatSize(totalBytes)} stored. You can set an uploaded PDF as the downloadable résumé when you upload it.`}
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
                    onClick={() => setAssetToDelete({ id: item.id, name: item.name })}
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
