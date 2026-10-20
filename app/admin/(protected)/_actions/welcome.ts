'use server';

import { getStorageAdapter } from '@/core/storage/registry';
import { requireOwner } from '@/core/auth/guard';
import { RevisionConflictError } from '@/core/storage/contract';
import { conflictMessage } from '@/core/content/changes';
import { PROFESSIONS } from '@/cms/data/professions';
import type { CMSState } from '@/cms/types/cms';
import { applyWelcomeAnswers, WELCOME_ACCENTS, type WelcomeAnswers } from '@/core/content/welcome';
import { publishDraftAction } from './publish';
import { readDraftForWrite } from '@/core/content/draft';

export interface WelcomeResult {
  ok: boolean;
  error?: string;
  conflict?: boolean;
}

/**
 * The first-run wizard's write, as one server action.
 *
 * The content rules live in `core/content/welcome.ts` and are shared with
 * nothing else anymore — the wizard this replaced applied them inline, in the
 * browser, with the draft the client happened to be holding. Here the draft
 * is read from storage, transformed, written back revision-cased, and then
 * published through the same `publishDraftAction` the Publish button uses, so
 * the contrast gate and the snapshot rules apply identically.
 *
 * A failed publish does not roll the answers back: they are saved in the
 * draft, the error says so, and the top-bar Publish is the retry. Trapping
 * someone on a wizard page until the server cooperates would be punishing the
 * wrong person.
 */
export async function applyWelcomeAction(input: {
  fullName: string;
  role: string;
  location: string;
  email: string;
  profession: string;
  accentName: string;
}): Promise<WelcomeResult> {
  await requireOwner();

  if (!input || typeof input !== 'object') {
    return { ok: false, error: 'Those answers are not usable.' };
  }

  const strings = [input.fullName, input.role, input.location, input.email];
  if (
    strings.some((value) => typeof value !== 'string') ||
    strings.some((value) => value.length > 320)
  ) {
    return { ok: false, error: 'Those answers are not usable.' };
  }

  // Profession and accent arrive as names; they are resolved against the
  // closed sets here rather than trusted, so nothing arbitrary from the wire
  // can reach the theme or the microcopy.
  const profession = PROFESSIONS.find((pack) => pack.id === input.profession);
  const accent = WELCOME_ACCENTS.find((candidate) => candidate.name === input.accentName);
  if (!profession || !accent) return { ok: false, error: 'Those answers are not usable.' };

  const adapter = await getStorageAdapter();
  const meta = await readDraftForWrite(adapter);

  const answers: WelcomeAnswers = {
    fullName: input.fullName.slice(0, 120),
    role: input.role.slice(0, 120),
    location: input.location.slice(0, 120),
    email: input.email.slice(0, 254),
    profession: profession.id,
    accent,
  };

  const next = applyWelcomeAnswers(meta.state as CMSState, answers);

  try {
    await adapter.writeSnapshot('draft', next, meta.revision);
  } catch (err) {
    if (err instanceof RevisionConflictError) {
      // Raced with another save. Re-read for the diff: what matters is what is
      // stored now, not the read this write was built on.
      const fresh = await adapter.readSnapshotMeta('draft');
      return {
        ok: false,
        conflict: true,
        error: conflictMessage(err, fresh?.state ?? null, next, 'Saving'),
      };
    }
    throw err;
  }

  const published = await publishDraftAction();
  if (!published.ok) {
    return {
      ok: false,
      error: 'Your answers are saved, but publishing them failed. Try Publish from the top bar.',
    };
  }
  return { ok: true };
}
