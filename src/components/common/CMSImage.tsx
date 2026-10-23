'use client';

import React, { useMemo } from 'react';
import { resolveAssetUrl } from '../../cms/utils/mediaUrls';
import { useCMS } from '../../cms/context/use-cms';
import { buildImageIndex, srcSetFor } from '@/core/media/srcset';

type CMSImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  /**
   * A stored asset reference. Accepts anything the CMS holds:
   * `idb:media-123` (uploaded), `/apex_1.png` (shipped in public/),
   * an absolute URL, or a legacy `data:` URI.
   */
  src: string | undefined | null;
  /** Render nothing when there's no usable source, instead of a broken image. */
  hideWhenEmpty?: boolean;
};

/**
 * Drop-in `<img>` for CMS-managed images.
 *
 * Uploads live in IndexedDB as blobs and are referenced as `idb:<id>`, which a
 * browser can't load directly — this maps the reference to the object URL
 * created at boot.
 */
export const CMSImage: React.FC<CMSImageProps> = ({ src, hideWhenEmpty, alt = '', ...rest }) => {
  const resolved = resolveAssetUrl(src);
  // Smaller copies of uploaded photos, looked up by URL (`clientView` keeps
  // only the media items that have any).
  const media = useCMS().data.media;
  const index = useMemo(() => buildImageIndex(media), [media]);
  const srcSet = srcSetFor(src, index);
  if (!resolved && hideWhenEmpty) return null;
  // Lazy + async decode by default: below-fold CMS images must not block the
  // first paint or shift layout work onto it. Callers rendering above-fold
  // content pass their own loading/decoding through `rest`, which wins.
  // Uploaded photos carry smaller copies made at upload (core/media/variants),
  // so a phone fetches the 640px one. `sizes` defaults to the full width — an
  // overestimate on a multi-column desktop layout, never an underestimate —
  // and callers that know better pass their own.
  return (
    <img
      src={resolved}
      srcSet={srcSet}
      sizes={srcSet ? '100vw' : undefined}
      alt={alt}
      loading="lazy"
      decoding="async"
      {...rest}
    />
  );
};
