import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getClaimEligibility } from '@/core/auth/claim';
import { ClaimForm } from './claim-form';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Set up',
  robots: { index: false, follow: false },
};

export default async function SetupPage() {
  const eligibility = await getClaimEligibility();

  // Once claimed there is nothing here, and leaving a live claim form on a
  // public URL is exactly the mistake this page exists to avoid.
  if (!eligibility.allowed && !eligibility.requiresToken) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Set up</p>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl font-medium">Claim this site</h1>
        <p className="mt-3 font-body text-sm text-text-secondary">
          This creates the one account that can edit the site. Nobody else can claim it afterwards.
        </p>

        <ClaimForm
          requiresToken={eligibility.requiresToken}
          blockedReason={eligibility.allowed ? null : (eligibility.reason ?? null)}
        />
      </div>
    </div>
  );
}
