import 'server-only';
import { UPSTREAM } from '@/core/version';
import { readConfig, writeConfig, clearConfig } from '@/core/integrations/vault';

/**
 * Connecting a GitHub account, once, so reports can be sent from the admin.
 *
 * This replaces opening a pre-filled issue page in a new tab. The earlier
 * design was chosen because it needed no token and no service; the requirement
 * that nobody should have to visit GitHub to file a report ruled it out.
 *
 * **Why the device flow and not a service we host.** The alternative was an
 * intake endpoint holding our own credentials, which would have meant zero
 * GitHub visits — and would have made us the publisher of whatever strangers
 * typed into it, filing under a bot account with a self-reported name that
 * anybody could set to anybody. Here the person authenticates with GitHub, the
 * issue is authored by their own account, GitHub's terms and abuse handling
 * apply, and nothing about them is ever stored anywhere we control. The token
 * lives encrypted in *their* database, not ours.
 *
 * The device flow specifically, rather than the ordinary web flow, because it
 * needs **no client secret** — so the client id can ship in the open, and a
 * self-hosted install does not have to be trusted with a credential that would
 * let it act as the project.
 *
 * The cost is one sign-in, ever. After that every report is sent without
 * leaving the admin.
 */

const DEVICE_CODE_URL = 'https://github.com/login/device/code';
const TOKEN_URL = 'https://github.com/login/oauth/access_token';
const API = 'https://api.github.com';

/**
 * The narrowest scope that can open an issue on a public repository.
 *
 * Not `repo`, which would also grant read and write over every private
 * repository the person owns — for a button that files a bug report. Asking for
 * more than is needed is how a reasonable request becomes one people are right
 * to refuse.
 */
const SCOPE = 'public_repo';

/** Public, and safe to ship: the device flow has no client secret. */
export function clientId(env: NodeJS.ProcessEnv = process.env): string | null {
  return env.OPB_GITHUB_CLIENT_ID?.trim() || null;
}

export interface DeviceCode {
  deviceCode: string;
  userCode: string;
  verificationUri: string;
  /** Seconds to wait between polls. GitHub rejects faster. */
  interval: number;
  expiresIn: number;
}

export async function startDeviceFlow(): Promise<DeviceCode | { error: string }> {
  const id = clientId();
  if (!id) return { error: 'This build has no GitHub application configured.' };

  try {
    const response = await fetch(DEVICE_CODE_URL, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: id, scope: SCOPE }),
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });

    const data = (await response.json()) as {
      device_code?: string;
      user_code?: string;
      verification_uri?: string;
      interval?: number;
      expires_in?: number;
      error_description?: string;
    };

    if (!data.device_code || !data.user_code) {
      return { error: data.error_description ?? 'GitHub did not start the sign-in.' };
    }

    return {
      deviceCode: data.device_code,
      userCode: data.user_code,
      verificationUri: data.verification_uri ?? 'https://github.com/login/device',
      // GitHub's documented floor is 5 seconds; polling faster earns a
      // `slow_down` and a longer wait, so the server's own number wins.
      interval: Math.max(5, data.interval ?? 5),
      expiresIn: data.expires_in ?? 900,
    };
  } catch {
    return { error: 'Could not reach GitHub to start the sign-in.' };
  }
}

export type PollResult =
  | { status: 'pending' }
  | { status: 'slow_down'; interval: number }
  | { status: 'connected'; login: string }
  | { status: 'failed'; error: string };

/** Exchanges a device code for a token, once the person has approved it. */
export async function pollDeviceFlow(deviceCode: string): Promise<PollResult> {
  const id = clientId();
  if (!id) return { status: 'failed', error: 'This build has no GitHub application configured.' };

  let data: {
    access_token?: string;
    error?: string;
    error_description?: string;
    interval?: number;
  };

  try {
    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: id,
        device_code: deviceCode,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    data = await response.json();
  } catch {
    return { status: 'failed', error: 'Could not reach GitHub.' };
  }

  if (data.error === 'authorization_pending') return { status: 'pending' };
  if (data.error === 'slow_down') {
    return { status: 'slow_down', interval: Math.max(5, data.interval ?? 10) };
  }
  if (data.error === 'expired_token') {
    return { status: 'failed', error: 'That code expired. Start again.' };
  }
  if (data.error === 'access_denied') {
    return { status: 'failed', error: 'Sign-in was cancelled.' };
  }
  if (!data.access_token) {
    return { status: 'failed', error: data.error_description ?? 'GitHub refused the sign-in.' };
  }

  const login = await whoAmI(data.access_token);
  if (!login) return { status: 'failed', error: 'Signed in, but GitHub would not say who as.' };

  // Encrypted at rest, in the owner's own storage. Never sent to a browser.
  await writeConfig('github', { token: data.access_token, login }, ['token']);
  return { status: 'connected', login };
}

async function whoAmI(token: string): Promise<string | null> {
  try {
    const response = await fetch(`${API}/user`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    return ((await response.json()) as { login?: string }).login ?? null;
  } catch {
    return null;
  }
}

export interface Connection {
  connected: boolean;
  login?: string;
}

/** Whether an account is connected, and which. Never returns the token. */
export async function connection(): Promise<Connection> {
  const stored = (await readConfig('github', ['token'])) as {
    token?: string;
    login?: string;
  } | null;
  if (!stored?.token) return { connected: false };
  return { connected: true, login: stored.login };
}

export async function disconnect(): Promise<void> {
  await clearConfig('github');
}

export type SubmitResult =
  | { ok: true; url: string; number: number }
  | { ok: false; error: string; needsReconnect?: boolean };

/**
 * Opens the issue, as them.
 *
 * A 401 means the token was revoked — from GitHub's settings, or by the person
 * changing their password. Saying "reconnect" is the whole of the fix, so the
 * caller is told that specifically rather than being handed a status code.
 */
export async function submitIssue(
  title: string,
  body: string,
  labels: string[]
): Promise<SubmitResult> {
  const stored = (await readConfig('github', ['token'])) as { token?: string } | null;
  if (!stored?.token) return { ok: false, error: 'No GitHub account is connected.' };

  try {
    const response = await fetch(`${API}/repos/${UPSTREAM.owner}/${UPSTREAM.repo}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stored.token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, body, labels }),
      cache: 'no-store',
      signal: AbortSignal.timeout(12000),
    });

    if (response.status === 401) {
      return {
        ok: false,
        needsReconnect: true,
        error: 'Your GitHub sign-in is no longer valid. Connect again and resend.',
      };
    }
    if (response.status === 403 || response.status === 404) {
      return {
        ok: false,
        error:
          'GitHub would not accept the report. The project may not be accepting issues right now.',
      };
    }
    if (!response.ok) {
      return { ok: false, error: `GitHub answered ${response.status}.` };
    }

    const issue = (await response.json()) as { html_url?: string; number?: number };
    return { ok: true, url: issue.html_url ?? '', number: issue.number ?? 0 };
  } catch {
    return { ok: false, error: 'Could not reach GitHub to send the report.' };
  }
}
