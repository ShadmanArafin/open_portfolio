import type { Metadata } from 'next';
import { buildMetadata } from '@/core/content/metadata';
import { getPublishedContent } from '@/core/content/read';
import { buildThemeStylesheet } from '@/core/theme/tokens';
import { buildLayoutStylesheet } from '@/core/theme/layout-tokens';
import { flattenAppearance, resolveAppearance } from '@/core/theme/resolve';
import { ALL_FONT_VARIABLES, SELF_HOSTED_FONTS } from '@/core/theme/fonts';
import { resolveAnalytics } from '@/core/integrations/analytics';
import { THEME_STORAGE_KEY } from '@/context/themeConstants';

/*
 * Stylesheets, in this order.
 *
 * `layers.css` declares the cascade layer order and must come first, so that
 * Tailwind's Preflight registers inside `tw-preflight` rather than winning
 * against everything that follows. `index.css` then emits Preflight into that
 * layer and carries the rest of the site's CSS.
 *
 * Three Astryx stylesheets used to sit between them, for the last component on
 * that kit — the push-notifications island on /admin/messages. Ported to plain
 * Tailwind on 2026-10-18, so both they and the `@astryxdesign` packages are
 * gone. See `docs/ADMIN-REWRITE.md`.
 */
import '@/styles/layers.css';

import '@/styles/index.css';

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
  // The chosen theme supplies anything the owner has not overridden, and its
  // layout half — density, radius, type scale — is what makes two themes feel
  // different rather than merely differently coloured.
  const appearance = resolveAppearance(content.appearance);
  const themeTokens =
    buildLayoutStylesheet(appearance.layout) +
    buildThemeStylesheet(flattenAppearance(content.appearance));

  // The typefaces, self-hosted. Every catalogue family ships its files with
  // the build (see core/theme/fonts.ts), so no request leaves for Google —
  // remote font CSS leaks visitor IPs. Only catalogue names resolve: anything
  // else falls back to a generic stack, which also closes the door on a
  // crafted family name reaching this stylesheet verbatim.
  const pickFont = (name: string | undefined, fallback: string): string =>
    name && SELF_HOSTED_FONTS[name] ? name : fallback;
  const displayFont = pickFont(content.appearance.displayFontFamily, appearance.fonts.display);
  const bodyFont = pickFont(content.appearance.bodyFontFamily, appearance.fonts.body);
  const monoFont = content.appearance.monoFontFamily
    ? pickFont(content.appearance.monoFontFamily, '')
    : '';
  const fontStack = (name: string, generic: string): string => {
    const known = SELF_HOSTED_FONTS[name];
    return known ? `var(${known.variable}), '${name}', ${known.generic}` : generic;
  };
  const fontStyles = [
    `--font-display:${fontStack(displayFont, 'Georgia, serif')}`,
    `--font-sans:${fontStack(bodyFont, 'system-ui, sans-serif')}`,
    `--font-body:${fontStack(bodyFont, 'system-ui, sans-serif')}`,
    monoFont
      ? `--font-mono:${fontStack(monoFont, 'monospace')}`
      : `--font-mono:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace`,
  ].join(';');

  // Audience counting, resolved at request time rather than at build time:
  // an OPB_* variable wins, then the Services screen vault, then the legacy
  // NEXT_PUBLIC_* variables. Embedded as JSON (escaped against </script>)
  // so the client tracker reads the same answer with no extra request — and
  // every value here is public by design (script URL, site id, share link).
  const analytics = await resolveAnalytics();
  const analyticsJson = JSON.stringify({
    provider: analytics.provider,
    scriptSrc: analytics.scriptSrc,
    websiteId: analytics.websiteId,
    domain: analytics.domain,
    shareUrl: analytics.shareUrl,
  }).replace(/</g, '\\u003c');

  return (
    // suppressHydrationWarning: the script above mutates <html> before React
    // sees it, so the server and client markup differ here by design.
    <html
      lang="en"
      data-theme="dark"
      className={`dark ${ALL_FONT_VARIABLES}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* Colours are generated from parsed values and family names resolve
            through the self-hosted catalogue — nothing a user typed reaches
            either string verbatim. Covered by a test in
            core/theme/__tests__/tokens.test.ts. */}
        <style dangerouslySetInnerHTML={{ __html: themeTokens }} />
        {/* The family's own name follows its variable so an unknown future
            value still names a real family before falling back to generic. */}
        <style dangerouslySetInnerHTML={{ __html: `:root{${fontStyles}}` }} />
        <script
          id="opb-analytics-config"
          type="application/json"
          dangerouslySetInnerHTML={{ __html: analyticsJson }}
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
