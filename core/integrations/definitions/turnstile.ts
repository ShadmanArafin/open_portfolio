import 'server-only';
import { z } from 'zod';
import { registerIntegration, type TestResult } from '../registry';

/**
 * Bot protection for the public forms.
 *
 * The second integration, and the one that proves the registry was not shaped
 * around email alone: no mail sending, a public site key plus a secret, a
 * browser widget the server then validates, and a test that works without
 * solving anything. Without it the contact form, the newsletter sign-up and
 * the public demo sandbox are defended by a honeypot alone — enough for dumb
 * bots, nothing against a bored human with curl.
 */

export const turnstileSchema = z.object({
  siteKey: z.string().min(1),
  secret: z.string().min(1),
});

export type TurnstileSettings = z.infer<typeof turnstileSchema>;

/** What Cloudflare answers when the secret is wrong. Everything else means it heard us. */
const INVALID_SECRET = 'invalid-input-secret';

async function siteverify(
  secret: string,
  response: string
): Promise<{ success: boolean; codes: string[] }> {
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response }),
  });
  const body = (await res.json().catch(() => null)) as {
    success?: boolean;
    'error-codes'?: string[];
  } | null;
  return { success: body?.success === true, codes: body?.['error-codes'] ?? [] };
}

registerIntegration<TurnstileSettings>({
  id: 'turnstile',
  name: 'Bot protection (Turnstile)',
  category: 'spam',
  summary:
    'Asks visitors to prove they are human before the contact form or newsletter sign-up accepts anything.',

  freeTier: {
    summary: 'Free with unlimited checks. Needs a Cloudflare account, which is also free.',
    verifiedOn: '2026-10-17',
  },
  docsUrl: 'https://developers.cloudflare.com/turnstile/get-started/',
  setup: [
    'Make a free Cloudflare account and open Turnstile.',
    'Add a widget for your site. Use "Managed" mode unless you enjoy tuning things.',
    'For trying it locally, Cloudflare publishes test keys that always pass — the docs call them out by name.',
    'Paste the site key and the secret key below.',
    'Press Test. It checks the secret against Cloudflare without solving anything.',
  ],

  fields: [
    { name: 'siteKey', label: 'Site key', kind: 'text', help: 'Public. It appears in your pages.' },
    { name: 'secret', label: 'Secret key', kind: 'password', help: 'Never leaves the server.' },
  ],
  secretFields: ['secret'],

  schema: turnstileSchema,

  degradation:
    'Without this, the forms fall back to the honeypot alone: automated sign-ups are still caught quietly, but a person submitting by hand is never challenged.',

  cspScript: ['https://challenges.cloudflare.com'],
  cspFrame: ['https://challenges.cloudflare.com'],

  configuredByEnv: (env) => Boolean(env.OPB_TURNSTILE_SECRET_KEY?.trim()),

  async test(config): Promise<TestResult> {
    // A deliberately useless token. Cloudflare answers "invalid response"
    // when the secret is fine and "invalid secret" when it is not — which is
    // exactly the distinction a Test button needs, with nothing to solve.
    try {
      const { success, codes } = await siteverify(config.secret, 'XXXXDUMMYTOKENXXX');
      if (success) {
        return {
          ok: true,
          message: 'Cloudflare accepted the secret. The forms will challenge visitors.',
        };
      }
      if (codes.includes(INVALID_SECRET)) {
        return { ok: false, message: 'Cloudflare rejected that secret key. Check it for typos.' };
      }
      return {
        ok: true,
        message:
          'Cloudflare answered and the secret was accepted. The forms will challenge visitors.',
      };
    } catch {
      return {
        ok: false,
        message: 'Could not reach Cloudflare. Check the server can reach the internet.',
      };
    }
  },
});

export { siteverify };
