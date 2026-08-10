import 'server-only';
import { headers } from 'next/headers';
import { timingSafeEqual } from 'node:crypto';
import { getStorageAdapter } from '@/core/storage/registry';
import { checkPassphraseStrength, hashPassphrase } from './passphrase';
import { createSession } from './session';

/**
 * First-run ownership.
 *
 * The threat is simple and real: a freshly deployed site has a public URL and
 * no owner, so whoever loads it first could claim it. Three proofs of control
 * are accepted, in descending order of preference.
 */

function constantTimeEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

async function isLoopbackRequest(): Promise<boolean> {
  const h = await headers();
  const host = (h.get('host') ?? '').split(':')[0];
  return host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '[::1]';
}

export interface ClaimEligibility {
  allowed: boolean;
  /** True when the deployer must supply OPB_SETUP_TOKEN to continue. */
  requiresToken: boolean;
  reason?: string;
}

export async function getClaimEligibility(): Promise<ClaimEligibility> {
  if (await getStorageAdapter().readOwner()) {
    return { allowed: false, requiresToken: false, reason: 'This site already has an owner.' };
  }

  if (process.env.OPB_SETUP_TOKEN) {
    return { allowed: true, requiresToken: true };
  }

  // Running it on your own machine is proof enough that it is yours.
  if (process.env.NODE_ENV !== 'production' || (await isLoopbackRequest())) {
    return { allowed: true, requiresToken: false };
  }

  // Deliberately closed rather than trust-on-first-use. An open claim form on a
  // public URL is a race the owner can lose.
  return {
    allowed: false,
    requiresToken: true,
    reason:
      'To finish setting up, add an OPB_SETUP_TOKEN environment variable in your hosting ' +
      'dashboard (any long random string), redeploy, then enter it here.',
  };
}

export interface ClaimInput {
  email: string;
  passphrase: string;
  setupToken?: string;
}

export async function claimInstance(
  input: ClaimInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  const adapter = getStorageAdapter();

  const eligibility = await getClaimEligibility();
  if (!eligibility.allowed) {
    return { ok: false, error: eligibility.reason ?? 'This site cannot be claimed.' };
  }

  if (eligibility.requiresToken) {
    const expected = process.env.OPB_SETUP_TOKEN ?? '';
    if (!input.setupToken || !constantTimeEquals(input.setupToken, expected)) {
      return { ok: false, error: 'That setup token does not match.' };
    }
  }

  const email = input.email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, error: 'That does not look like an email address.' };
  }

  const strength = checkPassphraseStrength(input.passphrase);
  if (!strength.ok) return { ok: false, error: strength.reason ?? 'Choose a stronger passphrase.' };

  // Re-checked immediately before the write, so two people submitting at the
  // same moment cannot both come away believing they own the site.
  if (await adapter.readOwner()) {
    return { ok: false, error: 'This site was claimed a moment ago by someone else.' };
  }

  await adapter.provision();
  await adapter.writeOwner({
    email,
    passphraseHash: await hashPassphrase(input.passphrase),
    createdAt: new Date().toISOString(),
    sessionEpoch: 1,
  });

  await createSession(email, 1);
  return { ok: true };
}
