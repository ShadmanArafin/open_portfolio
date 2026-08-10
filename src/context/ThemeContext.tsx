'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { THEME_STORAGE_KEY } from './themeConstants';

export type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const STORAGE_KEY = THEME_STORAGE_KEY;

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  /*
   * Starts as 'dark' — the same value the server rendered with — and only then
   * adopts the stored preference.
   *
   * Reading localStorage in the initialiser instead would run during hydration,
   * where the client would render a light-themed toggle against server HTML
   * that says dark, and React would throw out the server markup for the whole
   * tree. The visible colours are not affected either way: the blocking script
   * in the root layout has already painted the correct theme before this runs.
   */
  const [theme, setThemeState] = useState<Theme>('dark');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    // Fall back to whatever the anti-flash script decided, so the two can never
    // disagree about what is currently on screen.
    const fromDom = document.documentElement.dataset.theme as Theme | undefined;
    const initial: Theme = stored === 'light' || stored === 'dark' ? stored : (fromDom ?? 'dark');

    setThemeState(initial);
    setHydrated(true);
  }, []);

  const applyTheme = (targetTheme: Theme) => {
    const root = document.documentElement;
    root.dataset.theme = targetTheme;
    if (targetTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  };

  // Guarded on `hydrated`: without it, the initial 'dark' placeholder would be
  // written to storage on mount and overwrite a stored light preference before
  // the effect above ever gets to read it.
  useEffect(() => {
    if (!hydrated) return;
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme, hydrated]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
