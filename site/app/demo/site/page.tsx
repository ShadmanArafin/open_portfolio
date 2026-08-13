import type { Metadata } from 'next';
import '../../studio.css';
import { PoppedPreview } from '@/components/demo/popped-preview';

export const metadata: Metadata = {
  title: 'Your page, full size',
  description: 'The page you built in the demo, on its own with nothing around it.',
  alternates: { canonical: '/demo/site' },
  // The only route on this site that is not worth indexing: it renders whatever
  // is in one visitor's own browser storage, so there is nothing here for
  // anybody who arrives from a search result.
  robots: { index: false, follow: false },
};

/**
 * The demo's page, opened in its own tab.
 *
 * The reason to have it: a preview inside a split pane is scaled down and
 * surrounded by an editor, and "does this actually look right" is a question
 * only a full window answers. The real admin has the same control pointing at
 * the site's own URL.
 */
export default function DemoSitePage() {
  return <PoppedPreview />;
}
