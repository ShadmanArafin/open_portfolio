import { NextResponse, type NextRequest } from 'next/server';
import { requireOwner, UnauthorizedError } from '@/core/auth/guard';
import { getContentForChannel } from '@/core/content/read';
import { getStorageAdapter } from '@/core/storage/registry';
import { exportToJsonResume, importFromJsonResume } from '@/core/resume/json-resume';

/**
 * Standard JSON Resume (schema.jsonresume.org) API endpoint.
 *
 * Owner-only:
 * - GET: Exports current career data (experience, education, skills, basics) as resume.json.
 * - POST: Imports and merges standard JSON Resume into the owner's draft.
 */

export async function GET() {
  try {
    await requireOwner();
  } catch (err) {
    const status = err instanceof UnauthorizedError ? 401 : 500;
    return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status });
  }

  const draft = await getContentForChannel('draft');
  const jsonResume = exportToJsonResume(draft);

  return new NextResponse(JSON.stringify(jsonResume, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="resume.json"',
      'Cache-Control': 'private, no-cache, no-store',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    await requireOwner();
  } catch (err) {
    const status = err instanceof UnauthorizedError ? 401 : 500;
    return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status });
  }

  try {
    const body = await req.json();
    const draft = await getContentForChannel('draft');
    const updated = importFromJsonResume(body, draft);

    const adapter = await getStorageAdapter();
    await adapter.writeSnapshot('draft', updated);

    return NextResponse.json({
      ok: true,
      message: 'Resume data imported successfully into draft.',
      counts: {
        experience: updated.experience.length,
        education: updated.education.length,
        skills: updated.capabilityGroups.length,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid JSON Resume format.';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
