'use client';

import { CMSContext } from './use-cms';
import React, { useMemo } from 'react';
import type { CMSState } from '../types/cms';

/**
 * The site's content, as the theme's client components see it.
 *
 * This used to be the whole legacy editor: an IndexedDB store, a session
 * check, publishing, uploads and the inbox, loaded into every visitor's
 * browser behind a branch that only ran when no server content was passed in.
 * The admin moved to the server on 2026-10-18 and passes nothing through here,
 * and the public site always passes its content — so that branch could never
 * run, and some 1,300 lines of it (plus the 22 KB demo seed) were shipped to
 * every visitor regardless. What is left is what the 18 consumers use: `data`.
 *
 * The value is whatever the server rendered with (`clientView` in the site
 * layout), draft or published according to the channel. Theme colours and
 * typefaces come from the root layout's stylesheet, also channel-aware, so
 * there is nothing to apply from here.
 */

export const CMSProvider: React.FC<{ children: React.ReactNode; initialData: CMSState }> = ({
  children,
  initialData,
}) => {
  const value = useMemo(() => ({ data: initialData }), [initialData]);
  return <CMSContext.Provider value={value}>{children}</CMSContext.Provider>;
};
