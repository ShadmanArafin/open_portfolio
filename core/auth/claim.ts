import 'server-only';
import { timingSafeEqual } from 'node:crypto';
import { getStorageAdapter } from '@/core/storage/registry';
import { checkPassphraseStrength, hashPassphrase, isBreachedPassphrase } from './passphrase';
import { createSession } from './session';
import { isPlaceholderSecret } from '@/core/security/secrets';

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

export interface ClaimEligibility {
  allowed: boolean;
  /** True when the deployer must supply OPB_SETUP_TOKEN to continue. */
  requiresToken: boolean;
  reason?: string;
}

export async function getClaimEligibility(): Promise<ClaimEligibility> {
  if (await (await getStorageAdapter()).readOwner()) {
    return { allowed: false, requiresToken: false, reason: 'This site already has an owner.' };
  }

  if (process.env.OPB_SETUP_TOKEN) {
    // The example value is printed in docker-compose.yml and the README, so it
    // proves nothing about who deployed this copy.
    if (process.env.NODE_ENV === 'production' && isPlaceholderSecret(process.env.OPB_SETUP_TOKEN)) {
      return {
        allowed: false,
        requiresToken: true,
        reason:
          'OPB_SETUP_TOKEN is still the example value from the documentation, which anyone can ' +
          'read. Change it to a long phrase of your own, restart, then enter it here.',
      };
    }
    return { allowed: true, requiresToken: true };
  }

  // Development only. There is deliberately no "but the request looked like it
  // came from localhost" exemption here: the only evidence available at this
  // layer is the Host header, which the client sends and can set to anything.
  // A stranger could have posted `Host: localhost` to a deployed site and
  // claimed ownership of it without the token — defeating the entire point of
  // this check. Proof of deploy control has to come from something the
  // attacker cannot write, which is why production requires the environment
  // variable and nothing else.
  if (process.env.NODE_ENV !== 'production') {
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
  const adapter = await getStorageAdapter();

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

  // Refused when it has appeared in a breach (k-anonymity: only a 5-char hash
  // prefix leaves this machine). Fail-open when the check itself is
  // unreachable — the hash and rate limits still hold, and an offline API must
  // not brick first-run setup.
  const { breached } = await isBreachedPassphrase(input.passphrase);
  if (breached) {
    return {
      ok: false,
      error:
        'That passphrase has appeared in a data breach. Choose one you have not used elsewhere.',
    };
  }

  // Re-checked immediately before the write, so two people submitting at the
  // same moment cannot both come away believing they own the site.
  if (await adapter.readOwner()) {
    return { ok: false, error: 'This site was claimed a moment ago by someone else.' };
  }

  // No `provision()` here any more. It used to live in this one place, which
  // meant it only ever ran on a site being claimed for the first time — never
  // on an upgrade. The registry now does it in front of the first use of the
  // backend, including the `getStorageAdapter()` above.
  await adapter.writeOwner({
    email,
    passphraseHash: await hashPassphrase(input.passphrase),
    createdAt: new Date().toISOString(),
    sessionEpoch: 1,
  });

  await createSession(email, 1);
  return { ok: true };
}
