'use client';

import { ThemeContext } from './use-theme';
import React, { useSyncExternalStore } from 'react';
import { THEME_STORAGE_KEY } from './themeConstants';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = THEME_STORAGE_KEY;

function applyTheme(targetTheme: Theme) {
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
}

/*
 * The theme lives on <html>, where the blocking script in the root layout put
 * it before the first paint (from the stored preference). This reads it from
 * there as an external store rather than copying it into state from an effect:
 * the server snapshot is 'dark', matching the server HTML, so hydration agrees,
 * and the client snapshot is whatever is actually on screen.
 */
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Another tab changed the preference: follow it.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    if (event.newValue === 'light' || event.newValue === 'dark') {
      applyTheme(event.newValue);
      notify();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

const getSnapshot = (): Theme =>
  document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
const getServerSnapshot = (): Theme => 'dark';

function storeTheme(theme: Theme) {
  applyTheme(theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Private mode or storage blocked: the choice lasts for this page only.
  }
  notify();
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = (newTheme: Theme) => storeTheme(newTheme);
  const toggleTheme = () => storeTheme(getSnapshot() === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
