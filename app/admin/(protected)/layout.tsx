import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireOwner, UnauthorizedError } from '@/core/auth/guard';
import { getContentForChannel } from '@/core/content/read';
import { isWelcomePlaceholder } from '@/core/content/welcome';
import { AdminNav } from './_components/admin-nav';
import { ADMIN_SECTIONS } from './_components/sections';
import { ErrorCollector } from './error-collector';
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
 * This layout used to be the migrated half of a split admin, with unmigrated
 * screens still serving from the legacy `[...slug]` mount; that mount is
 * deleted, so every admin URL in the nav below is a real route in this group.
 * See `docs/ADMIN-REWRITE.md` for the slices and the kill criteria.
 */

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s — Admin' },
  robots: { index: false, follow: false },
};

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
      <ErrorCollector />
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
          <AdminNav sections={ADMIN_SECTIONS} />
        </div>
      </header>
      <main id="admin-main" className="mx-auto max-w-[1280px] px-6 py-8">
        {children}
      </main>
    </div>
  );
}
