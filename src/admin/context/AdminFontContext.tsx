import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

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
  /** Google Fonts family segment, e.g. `Figtree:wght@400;500;600;700`. */
  query: string;
  note: string;
}

export const ADMIN_FONTS: AdminFontOption[] = [
  {
    id: 'figtree',
    label: 'Figtree',
    query: 'Figtree:wght@400;500;600;700',
    note: 'Astryx neutral default',
  },
  {
    id: 'jakarta',
    label: 'Plus Jakarta Sans',
    query: 'Plus+Jakarta+Sans:wght@400;500;600;700',
    note: 'Slightly wider, rounder',
  },
];

const STORAGE_KEY = 'opb.admin.font';
const DEFAULT_FONT: AdminFont = 'figtree';

/**
 * Both faces are fetched once when the admin mounts, so switching is instant
 * and never flashes an unstyled swap mid-session.
 */
function loadAdminFonts(): void {
  const linkId = 'admin-font-loader';
  if (document.getElementById(linkId)) return;

  const families = ADMIN_FONTS.map((f) => `family=${f.query}`).join('&');
  const link = document.createElement('link');
  link.id = linkId;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
  document.head.appendChild(link);
}

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

  useEffect(() => {
    loadAdminFonts();
  }, []);

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
