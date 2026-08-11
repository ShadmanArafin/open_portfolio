import { DEMO_EMAIL, DEMO_PASSPHRASE, isDemoMode } from '@/core/demo/config';

/**
 * The strip that says this is a demo, and hands over the keys.
 *
 * A sandbox nobody realises is a sandbox is worse than none: somebody spends
 * ten minutes on it, closes the tab, and concludes the product loses your work.
 * So it says what this is, what happens to it, and — the part most demos leave
 * out — how to get into the editor, which is the thing worth seeing.
 *
 * Server-rendered with no JavaScript, so it is on the page for anybody who
 * arrives before hydration, including a crawler.
 */
export function DemoBanner() {
  if (!isDemoMode()) return null;

  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-border bg-surface-secondary px-4 py-2 text-center font-body text-sm text-text-secondary"
    >
      <span>
        <strong className="font-medium text-text-primary">This is a live demo.</strong> Change
        anything you like — it is yours alone and it resets in an hour.
      </span>
      <a href="/admin" className="underline underline-offset-2 hover:text-text-primary">
        Open the editor
      </a>
      <span className="text-text-muted">
        {DEMO_EMAIL} · {DEMO_PASSPHRASE}
      </span>
    </div>
  );
}
