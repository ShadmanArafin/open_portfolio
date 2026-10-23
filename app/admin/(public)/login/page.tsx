import type { Metadata } from 'next';
import { DEMO_EMAIL, DEMO_PASSPHRASE, isDemoMode } from '@/core/demo/config';
import { LoginForm } from './login-form';

// Request-time by nature (Cache Components may block here). Reads the address (`?next=`) and the session per request.
export const instant = false;

export const metadata: Metadata = { title: 'Sign in' };

/**
 * Where to land once this succeeds. The proxy writes `?next=` when it turns a
 * deep link away, but a crafted link could write it too — and "redirect to
 * wherever the query says" is how an open redirect gets born. Only paths
 * inside the admin pass.
 */
function safeNext(next: string | undefined): string | undefined {
  if (!next || next.length > 300) return undefined;
  return /^\/admin(\/|$)/.test(next) ? next : undefined;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <LoginForm
      next={safeNext(next)}
      demoHint={isDemoMode() ? `Demo — sign in with ${DEMO_EMAIL} and ${DEMO_PASSPHRASE}.` : null}
    />
  );
}
