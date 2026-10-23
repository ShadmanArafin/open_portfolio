'use client';

import { createContext, useContext } from 'react';
import type { CMSState } from '../types/cms';

/*
 * The context and its hook, apart from `CMSProvider` so that file exports only
 * its component (React Fast Refresh keeps state only for such files).
 */

export interface CMSContextType {
  data: CMSState;
}

export const CMSContext = createContext<CMSContextType | undefined>(undefined);

export const useCMS = () => {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
};
