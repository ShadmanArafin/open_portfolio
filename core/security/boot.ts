import { isPlaceholderSecret } from './secrets';

/**
 * Fail-fast boot checks, run once when the server starts.
 *
 * Pure function so the policy is unit-testable without booting Next: pass a
 * fake env, get back the errors and warnings the real boot would print. The
 * default export wires it into Next's `instrumentation.ts` hook.
 */

export interface BootEnv {
  NODE_ENV?: string;
  VERCEL?: string;
  NETLIFY?: string;
  CF_PAGES?: string;
  OPB_ADAPTER?: string;
  OPB_SETUP_TOKEN?: string;
  OPB_SECRET_KEY?: string;
  OPB_SESSION_SECRET?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  DATABASE_URL?: string;
  POSTGRES_URL?: string;
  NEON_DATABASE_URL?: string;
  OPB_POSTGRES_URL?: string;
  BLOB_READ_WRITE_TOKEN?: string;
}

export interface BootCheck {
  errors: string[];
  warnings: string[];
}

function isEphemeral(env: BootEnv): boolean {
  return Boolean(env.VERCEL || env.NETLIFY || env.CF_PAGES);
}

function hasHostedDb(env: BootEnv): boolean {
  return Boolean(
    (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) ||
    env.DATABASE_URL ||
    env.POSTGRES_URL ||
    env.NEON_DATABASE_URL ||
    env.OPB_POSTGRES_URL
  );
}

export function checkBootConfig(env: BootEnv = process.env): BootCheck {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (env.NODE_ENV !== 'production') return { errors, warnings };

  // Data loss, not a preference: the local adapter on an ephemeral host means
  // content vanishes on the next deploy. The registry refuses this per request;
  // refusing at boot says it once, loudly, instead of once per page view.
  const explicitLocal = env.OPB_ADAPTER === 'local';
  if (isEphemeral(env) && (explicitLocal || !hasHostedDb(env))) {
    errors.push(
      'No hosted database is configured and this host discards the filesystem between ' +
        'deploys, so content would disappear. Configure Supabase, Neon+Blob, or any Postgres ' +
        'before serving production traffic.'
    );
  }

  if (!env.OPB_SETUP_TOKEN) {
    warnings.push(
      'OPB_SETUP_TOKEN is not set. First-run claim is closed until it is; add any long ' +
        'random string in your hosting dashboard and redeploy.'
    );
  }

  if (isPlaceholderSecret(env.OPB_SETUP_TOKEN)) {
    warnings.push(
      'OPB_SETUP_TOKEN is still the example value from the documentation, which anyone can ' +
        'read. Claiming this site is refused until it is changed to a phrase of your own.'
    );
  }

  if (isPlaceholderSecret(env.OPB_SECRET_KEY || env.OPB_SESSION_SECRET)) {
    // A warning, not a fatal error: a live site that has run on this value for
    // months must keep serving after an update. New passwords are refused by
    // the vault instead, and ones already stored stay readable until changed.
    warnings.push(
      'OPB_SECRET_KEY is still the example value from the documentation, so anyone can ' +
        'derive the key that encrypts saved service passwords. New ones are refused until ' +
        'it is changed; changing it means re-entering the ones already saved.'
    );
  }

  if (!env.OPB_SECRET_KEY && !env.OPB_SESSION_SECRET) {
    warnings.push(
      'Neither OPB_SECRET_KEY nor OPB_SESSION_SECRET is set. Saving service passwords ' +
        'from the admin (SMTP, etc.) will fail with 409 until one is configured.'
    );
  }

  return { errors, warnings };
}
