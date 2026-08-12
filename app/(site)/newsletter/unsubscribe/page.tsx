import type { Metadata } from 'next';
import { TokenAction } from '../token-action';

export const metadata: Metadata = {
  title: 'Unsubscribe',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

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
          Unsubscribe
        </h1>
        <TokenAction
          endpoint="/api/newsletter/unsubscribe"
          token={token ?? ''}
          prompt="One press and you will not hear from this site again. No questions, no survey, no sign-in."
          action="Unsubscribe me"
        />
      </div>
    </div>
  );
}
