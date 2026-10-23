import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireOwner, UnauthorizedError } from '@/core/auth/guard';
import { getContentForChannel } from '@/core/content/read';
import { isWelcomePlaceholder } from '@/core/content/welcome';
import { AdminNav } from './_components/admin-nav';
import { OfflineNotice } from './_components/offline-notice';
import { CommandPalette, type PaletteRecord } from './_components/command-palette';
import { withLegacyCaseStudies } from './_components/sections';
import { ErrorCollector } from './error-collector';
import { WelcomeGate } from './welcome-gate';
import { AssistProvider } from './_components/assist';
import { assistCapabilities } from '@/core/ai/assist';

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

/*
 * Every admin screen is per-request by nature: it checks the session cookie
 * before anything renders. `instant = false` says so to Cache Components —
 * this segment is allowed to block — instead of wrapping the whole admin in a
 * Suspense fallback that would flash before the guard decides.
 */
export const instant = false;

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

  // Whether the owner connected their own model; the Suggest buttons hide
  // themselves otherwise.
  const assist = await assistCapabilities();

  const sections = withLegacyCaseStudies((draft.caseStudies ?? []).length > 0);

  // What the command palette can jump to besides the sections: the owner's own
  // pages, writing and work, each opening its editor on that record.
  const records: PaletteRecord[] = [
    ...(draft.pages ?? []).map((page) => ({
      label: page.title || `/${page.slug}`,
      kind: 'Page',
      href: `/admin/pages?open=${encodeURIComponent(page.id)}`,
    })),
    ...(draft.writing ?? []).map((entry) => ({
      label: entry.title || 'Untitled',
      kind: 'Writing',
      href: `/admin/writing?open=${encodeURIComponent(entry.id)}`,
    })),
    ...(draft.projects ?? []).map((project) => ({
      label: project.title || project.name || 'Untitled',
      kind: 'Project',
      href: `/admin/projects?open=${encodeURIComponent(project.id)}`,
    })),
  ];

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
          <AdminNav sections={sections} />
          <CommandPalette sections={sections} records={records} />
          <OfflineNotice />
        </div>
      </header>
      <main id="admin-main" className="mx-auto max-w-[1280px] px-6 py-8">
        <AssistProvider value={assist}>{children}</AssistProvider>
      </main>
    </div>
  );
}
