import React from 'react';
import { resolveAssetUrl } from '../../cms/utils/mediaUrls';

export type CMSImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
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
 * The `<img>` behind `CMSImage`, with no data access of its own: usable from
 * a client island, which gets `srcSet` from its server parent
 * (`srcSetsFor` in `src/cms/server.ts`).
 *
 * Lazy + async decode by default: below-fold CMS images must not block the
 * first paint or shift layout work onto it. Callers rendering above-fold
 * content pass their own loading/decoding through `rest`, which wins.
 * Uploaded photos carry smaller copies made at upload (core/media/variants),
 * so a phone fetches the 640px one. `sizes` defaults to the full width — an
 * overestimate on a multi-column desktop layout, never an underestimate —
 * and callers that know better pass their own.
 */
export function CMSImageBase({ src, srcSet, hideWhenEmpty, alt = '', ...rest }: CMSImageProps) {
  const resolved = resolveAssetUrl(src);
  if (!resolved && hideWhenEmpty) return null;
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
}
