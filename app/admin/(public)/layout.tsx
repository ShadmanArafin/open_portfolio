import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s — Admin' },
  robots: { index: false, follow: false },
};

/**
 * The signed-out shell: sign in, reset.
 *
 * Separate from `(protected)` because these two pages are the only admin
 * routes a signed-out visitor may see — the guard-by-existence group cannot
 * contain them. One centered card on the admin tokens; none of the section
 * navigation, which means nothing to someone who is not signed in yet.
 */
export default function PublicAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10 font-body text-text-primary">
      <main className="w-full max-w-[420px] rounded-2xl border border-border bg-surface-primary p-6">
        {children}
      </main>
    </div>
  );
}
