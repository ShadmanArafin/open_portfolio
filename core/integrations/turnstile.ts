import 'server-only';
import { readConfig } from './vault';
import { siteverify } from './definitions/turnstile';
import type { TurnstileSettings } from './definitions/turnstile';

/**
 * Reading the Turnstile configuration.
 *
 * Environment wins when both halves are present, exactly like SMTP: a value in
 * the environment is a deliberate act by whoever deployed the site. One half
 * without the other counts as unconfigured rather than broken — a widget
 * cannot render without a site key and a secret cannot verify without one, so
 * failing closed there would turn a half-finished setup into dead forms
 * instead of merely unprotected ones. The admin screen is where half-finished
 * shows up, with a Test button attached.
 */
async function settings(): Promise<TurnstileSettings | null> {
  const secret = process.env.OPB_TURNSTILE_SECRET_KEY?.trim();
  const siteKey = process.env.OPB_TURNSTILE_SITE_KEY?.trim();
  if (secret && siteKey) return { secret, siteKey };
  if (secret || siteKey) return null;

  const stored = (await readConfig('turnstile', ['secret'])) as Partial<TurnstileSettings> | null;
  if (typeof stored?.secret !== 'string' || !stored.secret) return null;
  if (typeof stored?.siteKey !== 'string' || !stored.siteKey) return null;
  return { secret: stored.secret, siteKey: stored.siteKey };
}

/**
 * The site key, for the browser widget. Public by design — Cloudflare's own
 * docs put it in page HTML — so a dedicated endpoint serves it rather than
 * smuggling it through the content snapshot, where it does not belong.
 */
export async function turnstileSiteKey(): Promise<string | null> {
  return (await settings())?.siteKey ?? null;
}

export interface HumanCheck {
  ok: boolean;
  error?: string;
}

/**
 * The gate the public form routes call after the honeypot.
 *
 * Unconfigured means unchallenged, by design rather than by accident: the
 * degradation is written on the integration itself, and refusing submissions
 * on a site whose owner never set this up would punish their visitors for an
 * admin task. A verification outage fails closed — during a Cloudflare blip
 * strangers wait rather than spammers walk in, and the rate limiter bounds
 * the queue that forms.
 */
export async function verifyTurnstileToken(token: unknown): Promise<HumanCheck> {
  const config = await settings();
  if (!config) return { ok: true };

  if (typeof token !== 'string' || token.trim() === '') {
    return { ok: false, error: 'Please complete the human check and try again.' };
  }

  try {
    const { success } = await siteverify(config.secret, token);
    return success
      ? { ok: true }
      : { ok: false, error: 'That check did not pass. Please try again.' };
  } catch {
    return {
      ok: false,
      error: 'The verification service could not be reached. Please try again later.',
    };
  }
}
