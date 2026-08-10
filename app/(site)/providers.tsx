'use client';

import React, { useEffect } from 'react';
import type { CMSState } from '@/cms/types/cms';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { CMSProvider } from '@/cms/context/CMSContext';
import { initAnalytics, trackPageview } from '@/utils/analytics';
import { usePathname } from 'next/navigation';

/**
 * The single client boundary the public site needs.
 *
 * Everything below it renders on the server first — being a client component
 * means it hydrates, not that it skips server rendering — so the HTML a crawler
 * receives is complete.
 */
export function SiteProviders({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData: CMSState;
}) {
  return (
    <ThemeProvider>
      <CMSProvider initialData={initialData}>
        <ToastProvider>
          <PageviewReporter />
          {children}
        </ToastProvider>
      </CMSProvider>
    </ThemeProvider>
  );
}

/**
 * Client-side navigations never hit the server, so an analytics script left to
 * itself counts the first page and nothing after it. No-ops entirely until a
 * provider is configured, and never fires inside the admin's preview iframe.
 */
function PageviewReporter() {
  const pathname = usePathname();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    trackPageview(pathname);
  }, [pathname]);

  return null;
}
