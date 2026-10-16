/**
 * Route-level loading state for the public site.
 *
 * Without this, a slow content read leaves a blank `<main>` — the Doherty
 * complaint made concrete. The skeleton mirrors the page rhythm (label,
 * headline, bands) in token greys so the swap-in does not reflow the eye,
 * and it is hidden from assistive tech because "loading" is announced by
 * the route change itself, not by placeholder shapes.
 */
export default function Loading() {
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
