import type { Metadata } from 'next';
import { getContentForChannel } from '@/core/content/read';
import { screenToken } from '@/core/content/screen-token';
import { FooterForm } from './footer-form';

export const metadata: Metadata = { title: 'Footer' };

/**
 * The footer and its social cards.
 *
 * One island for both: the copyright line and the giant word are two fields,
 * the social cards are a list of small records, and they all live in the same
 * corner of the content — saving them together is one draft read and one
 * draft write instead of two screens' worth of plumbing.
 */
export default async function FooterPage() {
  const draft = await getContentForChannel('draft');

  return (
    <div className="grid gap-6" style={{ maxWidth: 'var(--measure)' }}>
      <div>
        <p className="m-0 font-mono text-xs uppercase tracking-widest text-text-muted">
          Footer &amp; social
        </p>
        <h1 className="font-display m-0 mt-1 text-3xl">Footer &amp; Social Links</h1>
        <p className="m-0 mt-1 text-text-secondary">
          Copyright line, oversized footer word, and the social cards shown at the bottom of every
          page.
        </p>
      </div>

      <FooterForm
        tokens={{
          footer: screenToken(draft, 'footer'),
          socialLinks: screenToken(draft, 'socialLinks'),
        }}
        initial={{
          copyrightText: draft.settings.copyrightText,
          giantFooterText: draft.appearance.giantFooterText ?? '',
          links: draft.socialLinks ?? [],
        }}
      />
    </div>
  );
}
