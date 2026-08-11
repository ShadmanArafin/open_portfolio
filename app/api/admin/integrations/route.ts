import { demoRestrictionMessage, isDemoMode } from '@/core/demo/config';
import { NextResponse } from 'next/server';
import { requireOwner, UnauthorizedError } from '@/core/auth/guard';
import { clientKey, rateLimit } from '@/core/auth/ratelimit';
import {
  getIntegration,
  hintFor,
  listIntegrations,
  readConfig,
  vaultAvailable,
  writeConfig,
  clearConfig,
} from '@/core/integrations';

export const dynamic = 'force-dynamic';

/**
 * Configuring third-party services from the admin.
 *
 * One endpoint for every integration, because every integration is described by
 * the same shape. The twenty-fifth service is a definition file and nothing
 * here changes.
 *
 * **Secrets go in and never come out.** The response says whether a password is
 * set and shows its last four characters; it never returns the value. An admin
 * screen that round-trips a password so it can pre-fill a field is one XSS away
 * from handing it over, and gains nothing — nobody needs to read a key they
 * pasted in themselves.
 */

async function guard(): Promise<NextResponse | null> {
  try {
    await requireOwner();
    return null;
  } catch (err) {
    const status = err instanceof UnauthorizedError ? 401 : 500;
    return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status });
  }
}

/** Everything the admin screen needs, and nothing it does not. */
export async function GET() {
  const rejected = await guard();
  if (rejected) return rejected;

  const integrations = await Promise.all(
    listIntegrations().map(async (definition) => {
      const stored = await readConfig(definition.id, definition.secretFields);
      const byEnv = definition.configuredByEnv?.(process.env) ?? false;

      const values: Record<string, unknown> = {};
      const secrets: Record<string, unknown> = {};
      for (const [name, value] of Object.entries(stored ?? {})) {
        if (definition.secretFields.includes(name)) {
          secrets[name] = hintFor(typeof value === 'string' ? value : '');
        } else {
          values[name] = value;
        }
      }

      return {
        id: definition.id,
        name: definition.name,
        category: definition.category,
        summary: definition.summary,
        freeTier: definition.freeTier,
        docsUrl: definition.docsUrl,
        setup: definition.setup,
        fields: definition.fields,
        secretFields: definition.secretFields,
        degradation: definition.degradation,
        // Env wins, and the screen says so rather than offering fields that
        // would be silently ignored.
        configuredByEnv: byEnv,
        isConfigured: byEnv || stored !== null,
        values,
        secrets,
      };
    })
  );

  return NextResponse.json({
    ok: true,
    // Without a server secret nothing can be stored safely, and the screen has
    // to say that up front rather than accepting a password and losing it.
    vaultAvailable: vaultAvailable(),
    integrations,
  });
}

export async function PUT(req: Request) {
  // Switched off in the demo. Enforced here rather than hidden in the UI: a
  // disabled button is a suggestion, and this endpoint is reachable without it.
  if (isDemoMode()) {
    return NextResponse.json(
      { ok: false, error: demoRestrictionMessage('integrations') },
      { status: 403 }
    );
  }

  const rejected = await guard();
  if (rejected) return rejected;

  const body = (await req.json().catch(() => null)) as {
    id?: string;
    values?: Record<string, unknown>;
  } | null;

  const definition = body?.id ? getIntegration(body.id) : undefined;
  if (!definition) {
    return NextResponse.json({ ok: false, error: 'Unknown integration.' }, { status: 400 });
  }
  if (!vaultAvailable() && definition.secretFields.length > 0) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'This site has no encryption key, so it cannot store passwords safely. Set OPB_SECRET_KEY and restart.',
      },
      { status: 409 }
    );
  }

  // Validated against the integration's own schema, merged over what is stored
  // — a secret left blank means "unchanged", so the merged view is what has to
  // satisfy the schema rather than the request on its own.
  const existing = (await readConfig(definition.id, definition.secretFields)) ?? {};
  const merged = { ...existing, ...body?.values };
  for (const field of definition.secretFields) {
    if (!merged[field]) merged[field] = existing[field] ?? '';
  }

  const parsed = definition.schema.safeParse(merged);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const label =
      definition.fields.find((f) => f.name === issue?.path[0])?.label ??
      String(issue?.path[0] ?? '');
    return NextResponse.json(
      {
        ok: false,
        error: label ? `Check the "${label}" field.` : 'Those settings are incomplete.',
      },
      { status: 400 }
    );
  }

  await writeConfig(definition.id, body?.values ?? {}, definition.secretFields);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const rejected = await guard();
  if (rejected) return rejected;

  const id = new URL(req.url).searchParams.get('id');
  if (!id || !getIntegration(id)) {
    return NextResponse.json({ ok: false, error: 'Unknown integration.' }, { status: 400 });
  }

  await clearConfig(id);
  return NextResponse.json({ ok: true });
}

/**
 * Runs the integration's own test, against the settings as they would be saved.
 *
 * Rate limited because it makes an outbound connection to a host the caller
 * chose. Without a limit this is a way to make the site knock on arbitrary
 * doors — and being owner-only is not the same as being safe to leave open.
 */
export async function POST(req: Request) {
  const rejected = await guard();
  if (rejected) return rejected;

  const limit = await rateLimit(`integration-test:${await clientKey()}`, 20, 60 * 10);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many tests in a row. Wait a few minutes.' },
      { status: 429 }
    );
  }

  const body = (await req.json().catch(() => null)) as {
    id?: string;
    values?: Record<string, unknown>;
  } | null;

  const definition = body?.id ? getIntegration(body.id) : undefined;
  if (!definition) {
    return NextResponse.json({ ok: false, error: 'Unknown integration.' }, { status: 400 });
  }

  // Test what would be saved, not what is stored: somebody fixing a password
  // needs to know the new one works before committing to it.
  const existing = (await readConfig(definition.id, definition.secretFields)) ?? {};
  const merged = { ...existing, ...body?.values };
  for (const field of definition.secretFields) {
    if (!merged[field]) merged[field] = existing[field] ?? '';
  }

  const parsed = definition.schema.safeParse(merged);
  if (!parsed.success) {
    // Name the field. "Fill in the settings above first" in front of six
    // filled-in boxes reads as the button being broken.
    const issue = parsed.error.issues[0];
    const label = definition.fields.find((f) => f.name === issue?.path[0])?.label;
    return NextResponse.json({
      ok: true,
      result: {
        ok: false,
        message: label
          ? `There is nothing usable in "${label}" yet. Fill that in and try again.`
          : 'Some settings are still missing.',
      },
    });
  }

  try {
    const result = await definition.test(parsed.data as never);
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    return NextResponse.json({
      ok: true,
      result: {
        ok: false,
        message: err instanceof Error ? err.message : 'The test failed, and did not say why.',
      },
    });
  }
}
