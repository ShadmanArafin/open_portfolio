import React from 'react';
import { imageIndex } from '../../cms/server';
import { srcSetFor } from '@/core/media/srcset';
import { CMSImageBase, type CMSImageProps } from './cms-image-base';

/**
 * Drop-in `<img>` for CMS-managed images, rendered on the server.
 *
 * It looks up the smaller copies of an uploaded photo itself, from the
 * request's content, so the browser is never sent the media library to do
 * it — before this, every page carried the whole library in its content
 * copy. Client islands use `CMSImageBase` with a `srcSet` from their server
 * parent instead.
 */
export async function CMSImage(props: CMSImageProps) {
  const srcSet = props.srcSet ?? srcSetFor(props.src, await imageIndex());
  return <CMSImageBase {...props} srcSet={srcSet} />;
}
