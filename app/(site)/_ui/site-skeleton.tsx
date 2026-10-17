/**
 * The site's route-level skeleton, shared by the segments that may load
 * slowly.
 *
 * This used to be `app/(site)/loading.tsx` — one skeleton for every route.
 * That placement was a real bug: a `loading.tsx` boundary streams a `200`
 * shell the moment its segment is entered, before the page below it has run,
 * so every `notFound()` in the group rendered the branded 404 with an HTTP
 * `200`. Crawlers and analytics treated dead addresses as live pages.
 *
 * So the skeleton now sits *below* each segment's existence gate (the
 * `layout.tsx` beside it), which resolves and throws before any fallback can
 * flush. See `core/pages/__tests__/not-found-boundaries.test.ts`, which fails
 * if it is ever hoisted back up.
 *
 * It mirrors the page rhythm (label, headline, bands) in token greys so the
 * swap-in does not reflow the eye, and it is hidden from assistive tech
 * because "loading" is announced by the route change itself, not by
 * placeholder shapes.
 */
export default function SiteSkeleton() {
  return (
    <div
      aria-hidden="true"
      style={{
        paddingBlock: 'var(--section-y)',
        maxWidth: 'var(--container-default)',
        marginInline: 'auto',
        paddingInline: 'var(--gutter)',
        display: 'grid',
        gap: 'var(--space-6)',
      }}
    >
      <div
        style={{
          width: '12rem',
          height: 'var(--text-sm)',
          borderRadius: 'var(--radius-full)',
          background: 'var(--surface-secondary)',
        }}
      />
      <div
        style={{
          width: 'min(32rem, 80%)',
          height: 'var(--text-4xl)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--surface-secondary)',
        }}
      />
      <div
        style={{
          display: 'grid',
          gap: 'var(--space-4)',
          marginTop: 'var(--space-6)',
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              height: '12rem',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--surface-primary)',
              border: 'var(--hairline) solid var(--border-color)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
