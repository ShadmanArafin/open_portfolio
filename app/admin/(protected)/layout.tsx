import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireOwner, UnauthorizedError } from '@/core/auth/guard';
import { getContentForChannel } from '@/core/content/read';
import { isWelcomePlaceholder } from '@/core/content/welcome';
import { WelcomeGate } from './welcome-gate';

export const dynamic = 'force-dynamic';

/**
 * Guard by existence: the App Router admin's first mechanism.
 *
 * Any page that lands inside this group is owner-only by being here — the
 * layout throws or redirects before a single line of the page renders. This
 * is defence-in-depth and user experience, not the authorization boundary:
 * route handlers and server actions stay publicly callable HTTP endpoints no
 * matter what rendered the button, so each one still calls `requireOwner()`
 * itself (see `core/auth/guard.ts`).
 *
 * Migration is incremental: specific routes win over the legacy
 * `[[...slug]]` catch-all (now required `[...slug]` so the `/admin` root
 * belongs to the migrated dashboard), so migrated screens live here at their unchanged
 * URLs while the rest keep serving from the old client-side mount. The nav
 * below links every section either way, so the split is invisible in use.
 */

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s — Admin' },
  robots: { index: false, follow: false },
};

const SECTIONS: { href: string; label: string }[] = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/pages', label: 'Pages' },
  { href: '/admin/writing', label: 'Writing' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/case-studies', label: 'Case studies' },
  { href: '/admin/media', label: 'Media' },
  { href: '/admin/messages', label: 'Messages' },
  { href: '/admin/newsletter', label: 'Newsletter' },
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/navigation', label: 'Navigation' },
  { href: '/admin/appearance', label: 'Appearance' },
  { href: '/admin/seo', label: 'SEO' },
  { href: '/admin/settings', label: 'Settings' },
  { href: '/admin/services', label: 'Services' },
  { href: '/admin/storage', label: 'Storage' },
  { href: '/admin/your-site', label: 'Your site' },
  { href: '/admin/history', label: 'History' },
  { href: '/admin/help', label: 'Help' },
];

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireOwner();
  } catch (err) {
    if (err instanceof UnauthorizedError) redirect('/admin/login');
    throw err;
  }

  // A fresh install is inferred from the content — the seed's placeholder
  // name is still in the draft — and the client leaf adds "unless this
  // browser has already skipped the wizard".
  const draft = await getContentForChannel('draft');

  return (
    <div className="min-h-screen bg-bg font-body text-text-primary">
      <WelcomeGate looksUnconfigured={isWelcomePlaceholder(draft.settings?.fullName)} />
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:left-4 focus:top-4 focus:rounded-full focus:bg-text-primary focus:px-4 focus:py-2 focus:text-sm focus:text-bg"
      >
        Skip to content
      </a>
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-x-6 gap-y-2 px-6 py-4">
          <Link href="/admin" className="font-display text-lg font-semibold no-underline">
            Admin
          </Link>
          <nav aria-label="Admin sections">
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {SECTIONS.map((section) => (
                <li key={section.href}>
                  <Link
                    href={section.href}
                    className="text-sm text-text-secondary no-underline hover:text-text-primary"
                  >
                    {section.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main id="admin-main" className="mx-auto max-w-[1280px] px-6 py-8">
        {children}
      </main>
    </div>
  );
}
