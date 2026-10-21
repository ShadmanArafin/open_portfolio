'use client';

import { formatPeriod } from '@/cms/utils/dates';
import type { ExperienceItem } from '@/cms/types/cms';
import { updateExperienceAction } from '../_actions/collections';
import { CollectionEditor } from '../_components/collection-editor';
import { experienceCsv } from '@/core/import/csv-templates';
import { CheckField, Field, SelectField } from '../_components/form-fields';
import { newId } from '../_components/ids';

const TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];

/** A native month picker that speaks the CMS's own ISO dates. */
function DateField({
  label,
  value,
  onChange,
  disabled,
  hint,
}: {
  label: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-semibold">{label}</span>
      <input
        type="date"
        value={value ?? ''}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value || undefined)}
        className="w-full rounded-xl border border-border bg-surface-primary px-3 text-text-primary disabled:opacity-50"
        style={{ minHeight: 44 }}
      />
      {hint ? <span className="text-text-secondary">{hint}</span> : null}
    </label>
  );
}

/**
 * The roles behind the timeline on the About page.
 *
 * Dates are picked, not typed, and the end date turns off while a role is
 * current — the two rules the legacy screen enforced. What it did not do is
 * write the label the site shows: the timeline block reads `period` verbatim
 * and the legacy admin left it frozen at whatever the seed said. Here the
 * date fields are the truth — the action rewrites `period` from them on every
 * save, so the label follows the dates.
 */
export function ExperienceBuilder({
  initialExperience,
  token,
}: {
  initialExperience: ExperienceItem[];
  token?: string;
}) {
  return (
    <CollectionEditor<ExperienceItem>
      token={token}
      initialItems={initialExperience}
      addLabel="Add role"
      emptyTitle="No roles yet."
      emptyHint="Add one and it appears in the timeline on your About page."
      deleteLabel="Delete role"
      deleteWarning="The role leaves your draft, wherever it was shown. This cannot be undone without restoring a version."
      title={(item) => [item.role, item.company].filter(Boolean).join(' @ ')}
      summary={(item) => formatPeriod(item)}
      badge={(item) =>
        item.current ? { label: 'Current', live: true } : { label: 'Past', live: false }
      }
      csv={experienceCsv}
      create={(items) => ({
        id: newId('exp'),
        period: '',
        startDate: new Date().toISOString().split('T')[0],
        type: 'Full-time',
        role: '',
        company: 'New Company',
        current: true,
        summary: 'Short summary description of role responsibilities.',
        highlights: ['Key impact point 1', 'Key impact point 2'],
        sortOrder: items.length + 1,
        visible: true,
      })}
      duplicate={(item) => ({ ...structuredClone(item), id: newId('exp') })}
      save={async (experience, token) => {
        const result = await updateExperienceAction(experience, token);
        return {
          ok: result.ok,
          error: result.error,
          conflict: result.conflict,
          token: result.token,
          items: result.experience,
        };
      }}
      renderFields={(item, mutate) => (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Role title"
              value={item.role}
              onChange={(value) => mutate((current) => ({ ...current, role: value }))}
            />
            <Field
              label="Company name"
              value={item.company}
              onChange={(value) => mutate((current) => ({ ...current, company: value }))}
            />
          </div>

          <SelectField
            label="Employment type"
            value={item.type}
            options={TYPES.map((value) => ({ value, label: value }))}
            onChange={(value) => mutate((current) => ({ ...current, type: value }))}
          />

          <div className="grid gap-3 sm:grid-cols-3">
            <DateField
              label="Started"
              value={item.startDate}
              onChange={(value) => mutate((current) => ({ ...current, startDate: value }))}
              hint="Month and year are shown."
            />
            <DateField
              label="Ended"
              value={item.endDate}
              disabled={item.current}
              onChange={(value) => mutate((current) => ({ ...current, endDate: value }))}
              hint={
                item.current
                  ? 'Turn off “Current role” to set an end date.'
                  : 'Month and year are shown.'
              }
            />
            <CheckField
              label="Current role"
              description={`Shows as “${formatPeriod(item)}”`}
              checked={item.current}
              onChange={(checked) =>
                mutate((current) => ({
                  ...current,
                  current: checked,
                  endDate: checked ? undefined : current.endDate,
                }))
              }
            />
          </div>

          <Field
            label="Role overview summary"
            value={item.summary}
            onChange={(value) => mutate((current) => ({ ...current, summary: value }))}
            rows={2}
          />

          <Field
            label="Key highlights (one per line)"
            value={item.highlights.join('\n')}
            onChange={(value) =>
              mutate((current) => ({ ...current, highlights: value.split('\n') }))
            }
            hint="One highlight per line. Empty lines drop when you save."
            rows={3}
          />

          <CheckField
            label="Visible"
            description="Hidden roles stay in the draft but leave the timeline."
            checked={item.visible}
            onChange={(checked) => mutate((current) => ({ ...current, visible: checked }))}
          />
        </>
      )}
    />
  );
}
