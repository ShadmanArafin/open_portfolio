import type { Metadata } from 'next';
import { getNewsletterSettings } from '@/core/newsletter/read';
import { TokenAction } from '../token-action';

/** Never indexed: a page that only means anything with a token in it. */
export const metadata: Metadata = {
  title: 'Confirm your subscription',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const [{ token }, settings] = await Promise.all([
    searchParams,
    getNewsletterSettings('published'),
  ]);

  return (
    <div style={{ paddingBlock: 'var(--section-y)' }}>
      <div
        style={{
          maxWidth: 'var(--container-narrow, var(--container-default))',
          marginInline: 'auto',
          paddingInline: 'var(--gutter)',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-3xl)',
            lineHeight: 'var(--leading-tight)',
            margin: 0,
            marginBottom: 'var(--space-4)',
          }}
        >
          One last step
        </h1>
        <TokenAction
          endpoint="/api/newsletter/confirm"
          token={token ?? ''}
          prompt={
            settings.pitch
              ? `${settings.pitch} Press the button and you are on the list.`
              : 'Press the button and you are on the list. Nothing has been added yet.'
          }
          action="Yes, subscribe me"
        />
      </div>
    </div>
  );
}
