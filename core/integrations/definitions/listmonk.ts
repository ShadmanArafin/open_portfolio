import 'server-only';
import { z } from 'zod';
import { registerIntegration, type TestResult } from '../registry';

/**
 * Where the list goes when it is time to write to everyone.
 *
 * This is the one definition the site never calls. Open Portfolio collects
 * addresses and hands them over as a file; sending a broadcast means bounces,
 * unsubscribes and a sending domain, and half-building that leaves somebody
 * holding a list they cannot mail. Listmonk is the recommendation because it
 * is the free one — AGPL, a single binary, and happy beside the Postgres this
 * site already runs.
 *
 * So there is deliberately no API key field. Nothing here would use one, and a
 * credential stored for a caller that does not exist is a liability with no
 * payoff. The address is kept because the Test button is the thing worth
 * having while self-hosting: "is it up, and is that the right port".
 *
 * Measured, not assumed (a public instance, 2026-10-18): the API answers
 * `{ data: … }` when it works and `{ message: … }` when it refuses, and a
 * refusal is **403**, not 401 — which is why the check below reads the body
 * rather than trusting the status alone.
 */

export const listmonkSchema = z.object({
  url: z.string().min(1),
});

export type ListmonkSettings = z.infer<typeof listmonkSchema>;

/** The address as given, with any trailing slash removed, plus an API path. */
export function listmonkApiUrl(url: string, path: string): string {
  return `${url.replace(/\/+$/, '')}${path}`;
}

interface Probe {
  status: number;
  body: unknown;
}

async function probe(url: string): Promise<Probe> {
  const res = await fetch(url, {
    cache: 'no-store',
    // A Test button that hangs is worse than one that says no.
    signal: AbortSignal.timeout(8000),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

/** Listmonk answers `{ data: … }` on success and `{ message: … }` on a refusal. */
function speaksListmonk(body: unknown): boolean {
  return typeof body === 'object' && body !== null && ('data' in body || 'message' in body);
}

registerIntegration<ListmonkSettings>({
  id: 'listmonk',
  name: 'Newsletter sending (Listmonk)',
  category: 'email',
  summary:
    'Writes to your whole list at once — self-hosted and free, so your subscribers stay on your server.',

  freeTier: {
    summary:
      'Free and open source (AGPLv3) — self-hosted, so the only cost is the server it runs on. v6.2.0 was the current release on 26 June 2026.',
    verifiedOn: '2026-10-18',
  },
  docsUrl: 'https://listmonk.app/docs/installation',
  setup: [
    'Run Listmonk on a server you already have. One Docker command is enough — the install page is linked below.',
    'Open Listmonk at http://localhost:9000 (or wherever you put it) and make the admin account it asks for.',
    'Create a list there, and leave its opt-in on double, so only people who confirmed ever get mail.',
    'Download your addresses from the Newsletter screen, then import that file into Listmonk.',
    'Paste the address Listmonk answers on below, and press Test to check it is up.',
  ],

  fields: [
    {
      name: 'url',
      label: 'Listmonk address',
      kind: 'text',
      placeholder: 'https://listmonk.yourdomain.com',
      help: 'Where Listmonk answers. It opens on port 9000 unless you changed that.',
    },
  ],
  secretFields: [],

  schema: listmonkSchema,

  degradation:
    'Without this your list stays here: the form keeps collecting addresses and the download keeps working, but nothing writes to your subscribers.',

  async test(config): Promise<TestResult> {
    let status: number;
    let body: unknown;
    try {
      ({ status, body } = await probe(listmonkApiUrl(config.url, '/api/health')));
    } catch {
      return {
        ok: false,
        message:
          'Nothing answered at that address. Check it for typos, that Listmonk is running, and that the port is right — Listmonk opens on 9000 unless you changed it.',
      };
    }

    if (!speaksListmonk(body)) {
      return {
        ok: false,
        message: `Something answered at that address, but not like Listmonk — it replied ${status}, and not in Listmonk's own shape. This should be the address Listmonk's page opens at.`,
      };
    }

    if ((body as { data?: { db?: unknown } }).data?.db === false) {
      return {
        ok: false,
        message:
          'Listmonk answered but cannot reach its database. Start the Postgres it expects — its install page covers that — and test again.',
      };
    }

    if (status === 401 || status === 403) {
      return {
        ok: true,
        message:
          'Listmonk is running: it answered, and asked for a login that only its own screens can give. Nothing else to do here.',
      };
    }

    if (status >= 400) {
      return {
        ok: false,
        message: `Listmonk answered with ${status} for its health check. If you put your own login in front of it that is expected; otherwise its logs will say why.`,
      };
    }

    return {
      ok: true,
      message:
        'Listmonk is running. Your list reaches it by way of the download on the Newsletter screen.',
    };
  },
});
