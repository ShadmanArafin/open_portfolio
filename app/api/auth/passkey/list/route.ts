import { NextResponse } from 'next/server';
import { requireOwner, UnauthorizedError } from '@/core/auth/guard';
import { getStorageAdapter } from '@/core/storage/registry';

/**
 * The owner's enrolled passkeys, for the settings screen.
 *
 * Owner-only, and deliberately sparse: the public key and counter are
 * verification state, not display state, and the browser never needs them.
 * The enroll/remove actions live beside this under `register/` and `[id]`.
 */
export async function GET() {
  try {
    await requireOwner();
  } catch (err) {
    const status = err instanceof UnauthorizedError ? 401 : 500;
    return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status });
  }

  const credentials = await (await getStorageAdapter()).passkeys.list();
  return NextResponse.json({
    ok: true,
    credentials: credentials.map((c) => ({
      id: c.id,
      deviceName: c.deviceName,
      createdAt: c.createdAt,
      lastUsedAt: c.lastUsedAt,
    })),
  });
}
