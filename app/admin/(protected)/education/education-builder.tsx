'use client';

import type { EducationItem } from '@/cms/types/cms';
import { updateEducationAction } from '../_actions/collections';
import { CollectionEditor } from '../_components/collection-editor';
import { educationCsv } from '@/core/import/csv-templates';
import { CheckField, Field, SelectField } from '../_components/form-fields';
import { newId } from '../_components/ids';

const STATUSES = ['In Progress', 'Graduated', 'Completed', 'Paused'];

/**
 * Degrees and academic chapters, in the order the About page lists them.
 *
 * Entries carry a number, but nobody types it: the action rewrites it from
 * the list position on save, so removing an entry no longer leaves the
 * numbering with a hole or a repeat (the legacy screen wrote "0" + length at
 * creation and never touched it again). The status select is also the only
 * place `isCurrent` is set, which is how the legacy screen kept the two
 * fields from disagreeing.
 */
export function EducationBuilder({
  initialEducation,
  token,
}: {
  initialEducation: EducationItem[];
  token?: string;
}) {
  return (
    <CollectionEditor<EducationItem>
      token={token}
      initialItems={initialEducation}
      addLabel="Add entry"
      emptyTitle="No education yet."
      emptyHint="Add one and it appears in the timeline on your About page."
      deleteLabel="Delete entry"
      deleteWarning="The entry leaves your draft, wherever it was shown. This cannot be undone without restoring a version."
      title={(entry) => entry.degree}
      summary={(entry) => entry.institution}
      badge={(entry) => ({ label: entry.status, live: entry.status === 'Graduated' })}
      csv={educationCsv}
      create={(entries) => ({
        id: newId('edu'),
        number: '',
        yearLabel: '2026',
        degree: 'B.Sc. in Computer Science & Engineering',
        institution: 'University Name',
        status: 'Graduated',
        sortOrder: entries.length + 1,
        visible: true,
      })}
      duplicate={(entry) => ({ ...structuredClone(entry), id: newId('edu') })}
      save={async (education, token) => {
        const result = await updateEducationAction(education, token);
        return {
          ok: result.ok,
          error: result.error,
          conflict: result.conflict,
          token: result.token,
          items: result.education,
        };
      }}
      renderFields={(entry, mutate) => (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Degree / certificate"
              value={entry.degree}
              onChange={(value) => mutate((current) => ({ ...current, degree: value }))}
            />
            <Field
              label="Institution / university"
              value={entry.institution}
              onChange={(value) => mutate((current) => ({ ...current, institution: value }))}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Completed"
              value={entry.yearLabel}
              onChange={(value) => mutate((current) => ({ ...current, yearLabel: value }))}
              hint="Shown as written, e.g. JUN 2024. Leave empty while in progress."
              placeholder="JUN 2024"
            />
            <SelectField
              label="Status"
              value={entry.status}
              options={STATUSES.map((value) => ({ value, label: value }))}
              onChange={(value) =>
                mutate((current) => ({
                  ...current,
                  status: value as EducationItem['status'],
                  isCurrent: value === 'In Progress',
                }))
              }
            />
          </div>

          <CheckField
            label="Visible"
            description="Hidden entries stay in the draft but leave the About page."
            checked={entry.visible}
            onChange={(checked) => mutate((current) => ({ ...current, visible: checked }))}
          />
        </>
      )}
    />
  );
}
