import { getContentForChannel } from '@/core/content/read';
import { currentChannel } from '@/core/pages/read';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SideSectionIndicator } from '@/components/common/SideSectionIndicator';
import { SiteProviders } from './providers';
import { DemoBanner } from './demo-banner';

/**
 * Content lives in storage and can change without a rebuild, so pages cannot be
 * frozen at build time. Sixty seconds is a placeholder: once publishing runs
 * through the server it will call `revalidateTag`, updates will be immediate,
 * and this can go back up to an hour.
 */
export const revalidate = 60;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // Channel-aware so preview shows the draft's chrome too — a renamed site or
  // a reordered menu is exactly the kind of change worth previewing, and a
  // preview that only swaps the page body misrepresents the result.
  const content = await getContentForChannel(await currentChannel());

  return (
    <SiteProviders initialData={content}>
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
        <Navbar />
        <SideSectionIndicator />
        <main id="main" className="flex-grow">
          {children}
        </main>
        <Footer />
      </div>
    </SiteProviders>
  );
}
