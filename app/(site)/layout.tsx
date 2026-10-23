import { getContentForChannel } from '@/core/content/read';
import { clientView } from '@/core/content/sanitise';
import { siteNow } from '@/core/content/now';
import { currentChannel } from '@/core/pages/read';
import { Navbar, NavbarFrame } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SideSectionIndicator } from '@/components/common/SideSectionIndicator';
import { SiteProviders } from './providers';
import { DemoBanner } from './demo-banner';
import { Suspense, ViewTransition } from 'react';

/*
 * Caching lives with the data now, not here (Cache Components): published
 * content is read through a tagged `use cache` scope in `core/content/read.ts`
 * that a publish expires at once and that revalidates each minute for
 * scheduled pages and writing. This layout used to carry `revalidate = 60`.
 */

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // Channel-aware so preview shows the draft's chrome too — a renamed site or
  // a reordered menu is exactly the kind of change worth previewing, and a
  // preview that only swaps the page body misrepresents the result.
  const content = await getContentForChannel(await currentChannel());

  return (
    // Cut down to what is visible (no drafts) and then to what the client
    // components render (no page blocks, writing or stories, which the
    // server renders). See `clientView`.
    <SiteProviders initialData={clientView(content, await siteNow())}>
      <div className="min-h-screen flex flex-col justify-between relative">
        {/* First focusable element on the page: keyboard users should not have
            to tab through the whole navigation to reach the content. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:rounded-full focus:bg-text-primary focus:text-bg focus:font-body focus:text-sm"
        >
          Skip to content
        </a>
        <DemoBanner />
        {/* Both read the address, which a route with unknown params does not
            have while its shell is prerendered (Cache Components). */}
        <Suspense fallback={<NavbarFrame pathname={null} />}>
          <Navbar />
        </Suspense>
        <Suspense fallback={null}>
          <SideSectionIndicator />
        </Suspense>
        <main id="main" className="flex-grow">
          {/* Page changes crossfade (a navigation is a transition, so React
              runs it through the View Transitions API). Browsers without it
              swap pages as before; reduced motion turns it off in CSS. */}
          <ViewTransition>{children}</ViewTransition>
        </main>
        <Footer />
      </div>
    </SiteProviders>
  );
}
