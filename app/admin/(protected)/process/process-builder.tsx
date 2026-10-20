'use client';

import type { ProcessStepItem } from '@/cms/types/cms';
import { updateProcessAction } from '../_actions/collections';
import { CollectionEditor } from '../_components/collection-editor';
import { CheckField, Field } from '../_components/form-fields';
import { newId } from '../_components/ids';

const pad2 = (value: number) => String(value).padStart(2, '0');

/** The next free number, so a step added after removals does not repeat one. */
function nextNumber(items: ProcessStepItem[]): number {
  const numbers = items
    .map((item) => Number.parseInt(item.number, 10))
    .filter((value) => Number.isFinite(value));
  return numbers.length > 0 ? Math.max(...numbers) + 1 : items.length + 1;
}

/**
 * The numbered steps of the design process.
 *
 * The number is typed, not derived — the legacy screen let the person write
 * "01" or "Step one", and reordering never touched it. Only the number a
 * *new* step starts with is computed, and from the highest number in the
 * list rather than the list length, which is how the legacy "length + 1"
 * produced duplicates after a removal.
 */
export function ProcessBuilder({
  initialSteps,
  token,
}: {
  initialSteps: ProcessStepItem[];
  token?: string;
}) {
  return (
    <CollectionEditor<ProcessStepItem>
      token={token}
      initialItems={initialSteps}
      addLabel="Add step"
      emptyTitle="No process steps yet."
      emptyHint="Add one and it appears on the homepage immediately."
      deleteLabel="Delete step"
      deleteWarning="The step leaves your draft, wherever it was shown. This cannot be undone without restoring a version."
      title={(step) => step.title}
      summary={(step) => step.description}
      badge={(step) => (step.number ? { label: step.number, live: false } : null)}
      create={(items) => ({
        id: newId('step'),
        number: pad2(nextNumber(items)),
        title: 'New step',
        duration: '',
        deliverable: '',
        description: '',
        details: [],
        sortOrder: items.length + 1,
        visible: true,
      })}
      duplicate={(step, items) => ({
        ...structuredClone(step),
        id: newId('step'),
        number: pad2(nextNumber(items)),
      })}
      save={async (processSteps, token) => {
        const result = await updateProcessAction(processSteps, token);
        return {
          ok: result.ok,
          error: result.error,
          conflict: result.conflict,
          token: result.token,
          items: result.processSteps,
        };
      }}
      renderFields={(step, mutate) => (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field
              label="Number"
              value={step.number}
              onChange={(value) => mutate((current) => ({ ...current, number: value }))}
            />
            <div className="sm:col-span-2">
              <Field
                label="Title"
                value={step.title}
                onChange={(value) => mutate((current) => ({ ...current, title: value }))}
              />
            </div>
          </div>

          <Field
            label="Description"
            value={step.description}
            onChange={(value) => mutate((current) => ({ ...current, description: value }))}
            rows={2}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Deliverable"
              value={step.deliverable}
              onChange={(value) => mutate((current) => ({ ...current, deliverable: value }))}
              hint="Optional. Shown as “Deliverable: …” under the title."
            />
            <Field
              label="Duration"
              value={step.duration}
              onChange={(value) => mutate((current) => ({ ...current, duration: value }))}
              hint="Optional. Not currently shown on the site."
            />
          </div>

          <Field
            label="Detail chips (one per line)"
            value={step.details.join('\n')}
            onChange={(value) => mutate((current) => ({ ...current, details: value.split('\n') }))}
            hint="Optional. Small tags under the description."
            rows={2}
          />

          <CheckField
            label="Visible"
            description="Hidden steps stay in the draft but leave the section."
            checked={step.visible}
            onChange={(checked) => mutate((current) => ({ ...current, visible: checked }))}
          />
        </>
      )}
    />
  );
}
