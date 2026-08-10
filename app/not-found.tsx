import Link from 'next/link';
import { getPublishedContent } from '@/core/content/read';

/**
 * A real 404. The previous build redirected every unknown URL to the homepage,
 * which hid broken links from visitors and told search engines the page
 * existed. Copy comes from the microcopy settings, which already had fields for
 * this and had never been wired to anything.
 */
export default async function NotFound() {
  const content = await getPublishedContent();
  const { notFoundTitle, notFoundBody } = content.microcopy;

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-lg text-center space-y-6">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">404</p>
        <h1 className="font-display text-4xl sm:text-5xl font-medium text-text-primary">
          {notFoundTitle || 'Not found'}
        </h1>
        <p className="text-text-secondary font-body">
          {notFoundBody || 'That page may have been renamed or removed.'}
        </p>
        <Link
          href="/"
          className="inline-flex h-[42px] items-center rounded-full bg-text-primary px-6 font-body text-xs font-medium uppercase tracking-wider text-bg transition-opacity hover:opacity-90"
        >
          Back to the homepage
        </Link>
      </div>
    </div>
  );
}
