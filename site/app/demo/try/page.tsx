import type { Metadata } from 'next';
import Link from 'next/link';
import '../../studio.css';
import { Studio } from '@/components/demo/studio';

export const metadata: Metadata = {
  title: 'Try it',
  description:
    'The admin and the published site, running in your browser with nothing behind them. Seven professions, six themes, no account.',
  alternates: { canonical: '/demo/try' },
};

/**
 * The demo.
 *
 * Deliberately its own page rather than a section on `/demo`: it fills the
 * window, and something that fills the window should have an address somebody
 * can send to a friend.
 */
export default function TryPage() {
  return (
    <>
      <div
        style={{
          padding: '0.75rem var(--gutter)',
          borderBottom: '1px solid var(--rule)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem 1.5rem',
          alignItems: 'baseline',
          justifyContent: 'space-between',
        }}
      >
        <p className="micro" style={{ margin: 0 }}>
          Demo · nothing is saved and nothing is sent
        </p>
        <p className="small" style={{ margin: 0 }}>
          <Link href="/deploy">Deploy your own</Link> · <Link href="/demo">What this is</Link>
        </p>
      </div>

      <Studio />
    </>
  );
}
