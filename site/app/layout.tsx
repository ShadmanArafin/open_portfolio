import type { Metadata } from 'next';
import './globals.css';
import { Footer, Nav } from '@/components/chrome';
import { DESCRIPTION, PRODUCT, SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${PRODUCT} — build a portfolio site you own outright`,
    template: `%s · ${PRODUCT}`,
  },
  description: DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: PRODUCT,
    title: `${PRODUCT} — build a portfolio site you own outright`,
    description: DESCRIPTION,
    url: SITE_URL,
  },
  twitter: { card: 'summary_large_image' },
  // No robots block: everything here is meant to be indexed. The pages that
  // are not — there are none today — would say so themselves.
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
