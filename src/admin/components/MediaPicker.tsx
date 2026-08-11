'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Grid } from '@astryxdesign/core/Grid';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { useCMS } from '../../cms/context/CMSContext';
import { CMSImage } from '../../components/common/CMSImage';
import { TextInput } from './AdminFields';
import type { MediaItem } from '../../cms/types/cms';

/**
 * Choosing a picture.
 *
 * Until this existed, every image field could only upload a new file — so using
 * the same photo twice meant uploading it twice, and reusing one already in the
 * library meant copying its URL out of another screen by hand. That is the
 * single largest piece of bookkeeping the builder was still asking a
 * non-technical person to do.
 *
 * **Alt text is asked for here, not left to a field somewhere else.** Every
 * accessibility guide says to write alt text and almost nobody does, because
 * the box is always somewhere other than where the picture is chosen. Asking at
 * the moment of choosing — with the picture on screen, when the person knows
 * exactly what it shows — is the only version of this that works. It is still
 * skippable, deliberately: a hard requirement here would be answered with a
 * space bar.
 */

export interface MediaChoice {
  url: string;
  altText: string;
}

interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onChoose: (choice: MediaChoice) => void;
  /** Pre-filled when replacing an image that already has a description. */
  initialAlt?: string;
}

export const MediaPicker: React.FC<MediaPickerProps> = ({
  isOpen,
  onClose,
  onChoose,
  initialAlt = '',
}) => {
  const { draftData, uploadMedia } = useCMS();
  const fileInput = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [alt, setAlt] = useState(initialAlt);
  const [busy, setBusy] = useState(false);

  const images = useMemo(() => {
    const all = (draftData.media ?? []).filter(
      (item) => item.type === 'image' || item.type === 'svg'
    );
    const needle = query.trim().toLowerCase();
    if (!needle) return all;
    return all.filter(
      (item) =>
        item.name.toLowerCase().includes(needle) ||
        (item.altText ?? '').toLowerCase().includes(needle)
    );
  }, [draftData.media, query]);

  const pick = (item: MediaItem) => {
    setSelected(item);
    // The library's own description is the best first guess, and usually the
    // right answer — it was written about this same picture.
    if (item.altText) setAlt(item.altText);
  };

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const item = await uploadMedia(file, { altText: alt });
      if (item) pick(item);
    } finally {
      setBusy(false);
    }
  };

  const confirm = () => {
    if (!selected) return;
    onChoose({ url: selected.url, altText: alt });
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onOpenChange={(open) => !open && onClose()} width={720} purpose="form">
      <DialogHeader title="Choose an image" />

      <VStack gap={4} padding={4}>
        <HStack gap={2} align="end">
          <TextInput
            label="Search"
            placeholder="Search by name or description"
            value={query}
            onChange={setQuery}
            width="100%"
          />
          <Button
            variant="secondary"
            label={busy ? 'Uploading…' : 'Upload a new one'}
            isDisabled={busy}
            onClick={() => fileInput.current?.click()}
          />
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              // Cleared so choosing the same file twice in a row still fires.
              event.target.value = '';
              if (file) void upload(file);
            }}
          />
        </HStack>

        {images.length === 0 ? (
          <EmptyState
            title={query ? 'Nothing matches that' : 'No images yet'}
            description={
              query
                ? 'Try a different word, or upload a new picture.'
                : 'Upload one and it will be here next time you need it.'
            }
          />
        ) : (
          <Grid columns={{ minWidth: 140, repeat: 'fit' }} gap={3}>
            {images.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => pick(item)}
                aria-pressed={selected?.id === item.id}
                title={item.name}
                style={{
                  padding: 0,
                  border:
                    selected?.id === item.id
                      ? '2px solid var(--color-border-selected, var(--color-content-accent))'
                      : '1px solid var(--color-border-subtle)',
                  borderRadius: 'var(--radius-element)',
                  overflow: 'hidden',
                  background: 'var(--color-background-muted)',
                  cursor: 'pointer',
                  aspectRatio: '4 / 3',
                }}
              >
                <CMSImage
                  src={item.url}
                  alt={item.altText || item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </button>
            ))}
          </Grid>
        )}

        {selected && (
          <TextInput
            label="Describe this image"
            value={alt}
            onChange={setAlt}
            width="100%"
            description="What someone who cannot see it would need to know. Leave it blank if the picture is purely decorative."
          />
        )}

        <HStack gap={2} justify="end">
          <Button variant="ghost" label="Cancel" onClick={onClose} />
          <Button
            variant="primary"
            label="Use this image"
            isDisabled={!selected}
            onClick={confirm}
          />
        </HStack>
      </VStack>
    </Dialog>
  );
};
