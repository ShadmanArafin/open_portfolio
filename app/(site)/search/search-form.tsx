/**
 * A plain GET form to /search: works before any JavaScript loads, and the
 * results page is an ordinary address that can be bookmarked or shared.
 */
export function SearchForm({ query = '' }: { query?: string }) {
  return (
    <form
      role="search"
      action="/search"
      method="get"
      style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', alignItems: 'end' }}
    >
      <label style={{ display: 'grid', gap: 'var(--space-1)', flex: '1 1 16rem' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Search this site
        </span>
        <input
          type="search"
          name="q"
          defaultValue={query}
          maxLength={100}
          style={{
            minHeight: 44,
            paddingInline: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            border: 'var(--hairline) solid var(--border-color)',
            background: 'var(--surface-primary)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
          }}
        />
      </label>
      <button
        type="submit"
        style={{
          minHeight: 44,
          paddingInline: 'var(--space-5)',
          borderRadius: 999,
          border: 'var(--hairline) solid var(--border-color)',
          background: 'transparent',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-body)',
          cursor: 'pointer',
        }}
      >
        Search
      </button>
    </form>
  );
}
