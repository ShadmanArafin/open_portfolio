'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';

/**
 * The typeface used by the admin panel itself.
 *
 * This is an editor preference, not site content: it is never published,
 * never exported, and has no effect on the public site or on the draft
 * preview (which renders in its own iframe using the site's typography).
 * It lives in localStorage alongside the theme choice.
 */
export type AdminFont = 'figtree' | 'jakarta';

interface AdminFontOption {
  id: AdminFont;
  label: string;
  note: string;
}

export const ADMIN_FONTS: AdminFontOption[] = [
  {
    id: 'figtree',
    label: 'Figtree',
    note: 'Astryx neutral default',
  },
  {
    id: 'jakarta',
    label: 'Plus Jakarta Sans',
    note: 'Slightly wider, rounder',
  },
];

const STORAGE_KEY = 'opb.admin.font';
const DEFAULT_FONT: AdminFont = 'figtree';

/**
 * Both faces ship with the build as self-hosted next/font variables on the
 * root element (see core/theme/fonts.ts), so the family names in
 * admin-theme.css resolve without any stylesheet injection. There is
 * deliberately no loader here anymore: the previous one fetched Google CSS at
 * admin mount, leaking the owner's IP on every sign-in.
 */

function readStored(): AdminFont {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === 'figtree' || raw === 'jakarta' ? raw : DEFAULT_FONT;
  } catch {
    return DEFAULT_FONT;
  }
}

interface AdminFontContextValue {
  font: AdminFont;
  setFont: (font: AdminFont) => void;
  options: AdminFontOption[];
}

const AdminFontContext = createContext<AdminFontContextValue | undefined>(undefined);

export const AdminFontProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [font, setFontState] = useState<AdminFont>(readStored);

  const setFont = useCallback((next: AdminFont) => {
    setFontState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* A blocked localStorage shouldn't break the editor; the choice just
         won't survive a reload. */
    }
  }, []);

  return (
    <AdminFontContext.Provider value={{ font, setFont, options: ADMIN_FONTS }}>
      {children}
    </AdminFontContext.Provider>
  );
};

export const useAdminFont = (): AdminFontContextValue => {
  const context = useContext(AdminFontContext);
  if (!context) throw new Error('useAdminFont must be used within an AdminFontProvider');
  return context;
};
