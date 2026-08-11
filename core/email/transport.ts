import 'server-only';
import nodemailer, { type Transporter } from 'nodemailer';

/**
 * Which mail transport this instance has, decided by environment alone.
 *
 * Mirrors `core/storage/registry.ts`: the presence of a variable selects the
 * backend, so nobody has to choose one in a settings screen before they have a
 * database to store the choice in.
 *
 * `OPB_`-prefixed because no platform sets `SMTP_HOST` for you. The storage
 * adapters accept vendor names — DATABASE_URL, BLOB_READ_WRITE_TOKEN —
 * precisely because the platform writes those.
 *
 * Precedence, fixed now so a vault is additive later rather than a migration:
 * an environment variable wins if present; otherwise stored config, once
 * stored config exists.
 */

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  password?: string;
  from: string;
}

export type ResolvedTransport =
  { kind: 'none'; reason: string } | { kind: 'smtp'; config: SmtpConfig };

export function resolveTransport(env: NodeJS.ProcessEnv = process.env): ResolvedTransport {
  const host = env.OPB_SMTP_HOST?.trim();
  if (!host) {
    return {
      kind: 'none',
      reason: 'No mail server is configured, so nothing is sent. Set OPB_SMTP_HOST.',
    };
  }

  const parsedPort = Number(env.OPB_SMTP_PORT);
  const port = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 587;

  return {
    kind: 'smtp',
    config: {
      host,
      port,
      // Implicit TLS is port 465 only. Everything else negotiates STARTTLS,
      // which nodemailer does on its own.
      secure: env.OPB_SMTP_SECURE === '1',
      user: env.OPB_SMTP_USER?.trim() || undefined,
      password: env.OPB_SMTP_PASSWORD || undefined,
      from: env.OPB_MAIL_FROM?.trim() || `no-reply@${host}`,
    },
  };
}

let cached: { key: string; transporter: Transporter } | null = null;

/** Built once per configuration, so a connection pool is reused. */
export function getTransporter(config: SmtpConfig): Transporter {
  const key = JSON.stringify(config);
  if (cached?.key === key) return cached.transporter;

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.user ? { user: config.user, pass: config.password ?? '' } : undefined,
    // An SMTP handshake against a wrong host hangs far longer than a person
    // will wait on a contact form.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 10_000,
  });

  cached = { key, transporter };
  return transporter;
}

/** Drops the cached transporter. Tests change the environment between cases. */
export function resetTransport(): void {
  cached = null;
}
