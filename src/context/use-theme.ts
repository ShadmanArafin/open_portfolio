'use client';

import { createContext, useContext } from 'react';
import type { Theme } from './ThemeContext';

/*
 * The context and its hook, apart from `ThemeProvider` so that file exports only
 * its component (React Fast Refresh keeps state only for such files).
 */

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
