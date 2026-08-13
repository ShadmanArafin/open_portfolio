import type { Metadata } from 'next';
import '../../studio.css';
import { Studio } from '@/components/demo/studio';
import { DemoTopBar } from '@/components/demo/topbar';

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
 *
 * The site's nav and footer are suppressed here — see `ChromeGate` — because
 * this route is not a document. What replaces them is one bar naming the
 * product and offering a way out, which is what an application has.
 */
export default function TryPage() {
  return (
    <>
      <DemoTopBar />
      <Studio />
    </>
  );
}
