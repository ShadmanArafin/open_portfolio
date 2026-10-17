'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { isWelcomeDismissed } from './_components/welcome-dismissed';

/**
 * The first-run funnel, moved from the legacy shell's layout guard.
 *
 * The server decides whether the site still looks unconfigured (the seed's
 * placeholder name is a content fact); this leaf only adds the one preference
 * the server must not know: whether this browser has already been asked. A
 * dismissal is not site content — it must not travel in an export or reach a
 * visitor — so it lives in localStorage, and it is why the check runs after
 * hydration rather than in a redirect the server could have done.
 */
export function WelcomeGate({ looksUnconfigured }: { looksUnconfigured: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!looksUnconfigured) return;
    if (pathname === '/admin/welcome') return;
    if (isWelcomeDismissed()) return;
    router.replace('/admin/welcome');
  }, [looksUnconfigured, pathname, router]);

  return null;
}
