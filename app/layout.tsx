import type { Metadata } from 'next';
import { buildMetadata } from '@/core/content/metadata';
import { getPublishedContent } from '@/core/content/read';
import { buildThemeStylesheet } from '@/core/theme/tokens';
import { buildLayoutStylesheet } from '@/core/theme/layout-tokens';
import { THEME_STORAGE_KEY } from '@/context/themeConstants';

/*
 * Astryx, used by the admin. Loaded globally because the layer order below
 * keeps it from touching the public site: the reset uses :where() for zero
 * specificity inside @layer reset, and the theme is scoped to
 * [data-astryx-theme], which only the admin surface sets.
 *
 * Layer order: tw-preflight -> reset -> astryx-base -> astryx-theme -> ours.
 */
import '@/styles/layers.css';
import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';
import '@astryxdesign/theme-neutral/theme.css';

import '@/styles/index.css';
import '@/styles/admin-theme.css';

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPublishedContent();
  const meta = await buildMetadata();
  return {
    ...meta,
    icons: { icon: content.seo.favicon || '/favicon.svg' },
  };
}

/**
 * Applies the stored theme before first paint.
 *
 * This has to run as a blocking inline script: React cannot help here, because
 * any decision made after hydration happens a frame too late and the page
 * visibly flashes the wrong background on every load.
 */
const themeScript = `
(function () {
  try {
    var t = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    if (t !== 'dark' && t !== 'light') t = 'dark';
    var el = document.documentElement;
    el.dataset.theme = t;
    el.classList.add(t);
    el.classList.remove(t === 'dark' ? 'light' : 'dark');
    el.style.colorScheme = t;
  } catch (e) {}
})();
`.trim();

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Both palettes, generated from the published appearance settings. Rendered
  // here rather than written from an effect, so the first paint is already the
  // site's own colours instead of the built-in ones.
  const content = await getPublishedContent();
  // Colour changes per mode; spacing, radius and type do not, so the layout
  // half is emitted once on :root rather than duplicated into both blocks.
  const themeTokens = buildLayoutStylesheet() + buildThemeStylesheet(content.appearance);

  return (
    // suppressHydrationWarning: the script above mutates <html> before React
    // sees it, so the server and client markup differ here by design.
    <html lang="en" data-theme="dark" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* Values are all generated from parsed colours — nothing a user typed
            reaches this string verbatim. Covered by a test in
            core/theme/__tests__/tokens.test.ts. */}
        <style dangerouslySetInnerHTML={{ __html: themeTokens }} />
        {/* Default pairing. The appearance editor swaps these at runtime;
            self-hosting them via next/font comes with the token rework. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Instrument+Serif:wght@400&family=Geist+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      {/* No `selection:` utilities here. `accent` resolves to a bare `var()`,
          which Tailwind cannot apply an opacity modifier to, so
          `selection:bg-accent/20` compiled to nothing. Selection colours come
          from the real `::selection` rule in index.css, which uses the
          `--selection-bg` token and has been doing the job all along. */}
      <body className="bg-bg text-text-primary antialiased font-sans">{children}</body>
    </html>
  );
}
