'use client';

import React, { useRef } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { VStack } from '@astryxdesign/core/Layout';
import { Upload } from 'lucide-react';
import { CMSImage } from '../../components/common/CMSImage';

/**
 * The three preview shapes the editor needs. Fixed sizes, not aspect ratios:
 * an aspect box grows with the column it sits in, which is how brand logos
 * ended up taller than the form beside them.
 */
const BOX = {
  /** Brand logos — wide and short, letterboxed on the muted surface. */
  logo: { height: 72, width: '100%', maxWidth: 180 },
  /** Artifacts and other single-image records. */
  thumb: { height: 96, width: 160 },
  /** Media library grid cells, where the image is the subject. */
  tile: { height: 112, width: '100%' },
} as const;

interface AdminImageFieldProps {
  src: string;
  alt: string;
  size?: keyof typeof BOX;
  /** `contain` letterboxes (logos, artwork); `cover` fills (photos). */
  fit?: 'contain' | 'cover';
  /** Omit to render a read-only preview. */
  onFile?: (file: File) => void | Promise<void>;
  /**
   * Opens a chooser instead of the operating system's file dialog.
   *
   * Takes precedence over `onFile`. A file dialog can only ever add another
   * copy of a picture that is already in the library, so anywhere a library
   * exists this is the better control — and the two must not both be wired at
   * once, or the button does two things depending on which prop was passed
   * last.
   */
  onChoose?: () => void;
  buttonLabel?: string;
}

/**
 * An image preview with an optional replace control.
 *
 * The upload control is a real Button that forwards its click to a hidden
 * file input. The previous version layered an absolutely-positioned `<label>`
 * over the preview instead, which turned into a full-page invisible click
 * target the moment its container lost `position: relative`.
 */
export const AdminImageField: React.FC<AdminImageFieldProps> = ({
  src,
  alt,
  size = 'thumb',
  fit = 'contain',
  onFile,
  onChoose,
  buttonLabel = 'Replace',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <VStack gap={2} align="start">
      <div
        style={{
          ...BOX[size],
          flexShrink: 0,
          borderRadius: 'var(--radius-element)',
          overflow: 'hidden',
          background: 'var(--color-background-muted)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: fit === 'contain' ? 8 : 0,
        }}
      >
        <CMSImage
          src={src}
          alt={alt}
          className={
            fit === 'contain'
              ? 'max-h-full max-w-full object-contain'
              : 'w-full h-full object-cover'
          }
        />
      </div>

      {onChoose ? (
        <Button
          label={buttonLabel}
          variant="secondary"
          size="sm"
          icon={<Upload aria-hidden />}
          onClick={onChoose}
        />
      ) : (
        onFile && (
          <>
            <Button
              label={buttonLabel}
              variant="secondary"
              size="sm"
              icon={<Upload aria-hidden />}
              onClick={() => inputRef.current?.click()}
            />
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onFile(file);
                e.target.value = '';
              }}
            />
          </>
        )
      )}
    </VStack>
  );
};
