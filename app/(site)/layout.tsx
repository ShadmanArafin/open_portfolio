import { getPublishedContent } from '@/core/content/read';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SideSectionIndicator } from '@/components/common/SideSectionIndicator';
import { SiteProviders } from './providers';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const content = await getPublishedContent();

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
