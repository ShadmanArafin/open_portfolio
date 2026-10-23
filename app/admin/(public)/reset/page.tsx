import type { Metadata } from 'next';
import { ResetForm } from './reset-form';

// Request-time by nature (Cache Components may block here). A token in the address decides everything here.
export const instant = false;

export const metadata: Metadata = { title: 'Reset your passphrase' };

/**
 * The mailed link lands here with `?token=`; the same page without one is the
 * "ask for the email" form. The proxy exempts this path from the sign-in
 * redirect precisely because the link arrives cold — see `proxy.ts`.
 */
export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <ResetForm token={token && token.length <= 500 ? token : undefined} />;
}
