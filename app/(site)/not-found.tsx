import Link from 'next/link';
import { SearchForm } from './search/search-form';

/**
 * The branded dead end, inside the site chrome.
 *
 * `notFound()` in the catch-all and the disabled-writing index lands here
 * rather than on Next's generic page, so a wrong address still looks like
 * this site — and still offers a way back. Rendered inside `(site)/layout`,
 * so the nav and footer persist around it.
 */
export default function NotFound() {
  return (
    <div
      style={{
        paddingBlock: 'var(--section-y)',
        maxWidth: 'var(--container-default)',
        marginInline: 'auto',
        paddingInline: 'var(--gutter)',
        textAlign: 'center',
        display: 'grid',
        gap: 'var(--space-4)',
        justifyItems: 'center',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-muted)',
          margin: 0,
        }}
      >
        404
      </p>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-3xl)',
          lineHeight: 'var(--leading-tight)',
          color: 'var(--text-primary)',
          margin: 0,
        }}
      >
        Nothing lives here.
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          color: 'var(--text-secondary)',
          maxWidth: 'var(--measure-narrow)',
          margin: 0,
        }}
      >
        The address changed, the page was removed, or it was never written. The rest of the site is
        one press away.
      </p>
      <div style={{ width: '100%', maxWidth: 'var(--measure-narrow)', textAlign: 'start' }}>
        <SearchForm />
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
        <Link
          href="/"
          style={{
            minHeight: 'var(--control-height)',
            display: 'inline-flex',
            alignItems: 'center',
            paddingInline: 'var(--space-6)',
            borderRadius: 'var(--radius-full)',
            background: 'var(--btn-primary-bg)',
            color: 'var(--btn-primary-text)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            textDecoration: 'none',
          }}
        >
          Home
        </Link>
        <Link
          href="/work"
          style={{
            minHeight: 'var(--control-height)',
            display: 'inline-flex',
            alignItems: 'center',
            paddingInline: 'var(--space-6)',
            borderRadius: 'var(--radius-full)',
            border: 'var(--hairline) solid var(--btn-secondary-border)',
            color: 'var(--btn-secondary-text)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            textDecoration: 'none',
          }}
        >
          Work
        </Link>
      </div>
    </div>
  );
}
