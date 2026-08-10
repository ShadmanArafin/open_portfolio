import React from 'react';
import { resolveAssetUrl } from '../../cms/utils/mediaUrls';

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
  if (!resolved && hideWhenEmpty) return null;
  return <img src={resolved} alt={alt} {...rest} />;
};
