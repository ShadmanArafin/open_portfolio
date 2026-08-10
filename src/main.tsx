import React from 'react';
import { initAnalytics } from './utils/analytics';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { CMSProvider } from './cms/context/CMSContext';
import { cmsService } from './cms/services/cmsService';
import App from './App';

/*
 * Astryx design system, used by the admin panel.
 *
 * Safe to load globally: the reset uses :where() for zero specificity inside
 * `@layer reset`, and the theme is scoped to [data-astryx-theme], which only
 * the admin surface sets. Tailwind 3 emits unlayered CSS, so the public site's
 * styles still win everywhere.
 *
 * Layer order: reset -> astryx-base -> astryx-theme -> our own (unlayered).
 */
import './styles/layers.css';
import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';
import '@astryxdesign/theme-neutral/theme.css';

import './styles/index.css';
import './styles/admin-theme.css';

/**
 * Content is hydrated from storage before the first render. Rendering earlier
 * would paint the built-in seed content and then swap it for the real thing,
 * which reads as a flicker on every page load.
 *
 * These are the only providers in the tree — App renders routes only.
 */
async function bootstrap() {
  await cmsService.init();

  // No-op unless a provider is configured, and never on /admin.
  initAnalytics();

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      {/* Opt into the v7 behaviours now: without these, every page load logs two
          upgrade warnings, which buries anything real in the console. */}
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ThemeProvider>
          <CMSProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </CMSProvider>
        </ThemeProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}

void bootstrap();
