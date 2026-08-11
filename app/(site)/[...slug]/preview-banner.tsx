/**
 * The strip that says "you are not looking at the live site".
 *
 * Preview without a visible marker is how a person ends up convinced they
 * published something they did not. It has to be present on every previewed
 * page, impossible to mistake for content, and it has to offer the way out —
 * "exit preview" being buried in the admin is how people end up sending a
 * preview link to a client.
 *
 * A server component with a plain link: no client JavaScript, and it works
 * before hydration, which matters because it is the one piece of UI whose whole
 * job is to be believed.
 */
export function PreviewBanner({ status, path }: { status: 'draft' | 'published'; path: string }) {
  return (
    <div
      role="status"
      className="sticky top-0 z-50 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-border bg-surface-secondary px-4 py-2 text-center font-body text-sm text-text-secondary"
    >
      <span>
        <strong className="font-medium text-text-primary">Preview.</strong>{' '}
        {status === 'draft'
          ? 'This page is a draft — nobody else can see it yet.'
          : 'You are seeing unpublished changes.'}
      </span>
      {/* A plain anchor, not a Link: prefetching a route whose purpose is to
          clear a cookie would exit preview without anyone clicking anything. */}
      <a
        href={`/api/preview/end?path=${encodeURIComponent(path)}`}
        className="underline underline-offset-2 hover:text-text-primary"
      >
        Exit preview
      </a>
    </div>
  );
}
