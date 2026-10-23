'use client';

import type { CapabilityGroupItem } from '@/cms/types/cms';
import { updateCapabilitiesAction } from '../_actions/collections';
import { CollectionEditor } from '../_components/collection-editor';
import { capabilitiesCsv } from '@/core/import/csv-templates';
import { CheckField, Field } from '../_components/form-fields';
import { newId } from '../_components/ids';

const pad2 = (value: number) => String(value).padStart(2, '0');

/** The next free number, so a group added after removals does not repeat one. */
function nextNumber(items: CapabilityGroupItem[]): number {
  const numbers = items
    .map((item) => Number.parseInt(item.number, 10))
    .filter((value) => Number.isFinite(value));
  return numbers.length > 0 ? Math.max(...numbers) + 1 : items.length + 1;
}

/**
 * Skill categories and the capabilities under each.
 *
 * One group per category, with its capabilities as plain lines — the textarea
 * splits them on save and the count in the label updates as they are typed.
 * Same number rules as the process steps: typed by hand, computed only for
 * new records, and never left colliding by a removal.
 */
export function CapabilitiesBuilder({
  initialGroups,
  token,
}: {
  initialGroups: CapabilityGroupItem[];
  token?: string;
}) {
  return (
    <CollectionEditor<CapabilityGroupItem>
      token={token}
      initialItems={initialGroups}
      addLabel="Add group"
      emptyTitle="No capability groups yet."
      emptyHint="Add one to populate the capabilities section on your homepage."
      deleteLabel="Delete group"
      deleteWarning="The group leaves your draft, wherever it was shown. This cannot be undone without restoring a version."
      title={(group) => group.title}
      summary={(group) => `${group.capabilities.length} capabilities`}
      badge={(group) => (group.number ? { label: group.number, live: false } : null)}
      csv={capabilitiesCsv}
      create={(items) => ({
        id: newId('cap'),
        number: pad2(nextNumber(items)),
        title: 'New category',
        description: '',
        capabilities: [],
        sortOrder: items.length + 1,
        visible: true,
      })}
      duplicate={(group, items) => ({
        ...structuredClone(group),
        id: newId('cap'),
        number: pad2(nextNumber(items)),
      })}
      save={async (groups, token) => {
        const result = await updateCapabilitiesAction(groups, token);
        return {
          ok: result.ok,
          error: result.error,
          conflict: result.conflict,
          token: result.token,
          items: result.capabilityGroups,
        };
      }}
      renderFields={(group, mutate) => (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field
              label="Number"
              value={group.number}
              onChange={(value) => mutate((current) => ({ ...current, number: value }))}
            />
            <div className="sm:col-span-2">
              <Field
                label="Category title"
                value={group.title}
                onChange={(value) => mutate((current) => ({ ...current, title: value }))}
              />
            </div>
          </div>

          <Field
            label="Description"
            value={group.description}
            onChange={(value) => mutate((current) => ({ ...current, description: value }))}
            hint="Optional supporting line for this group."
            rows={2}
          />

          <Field
            label={`Capabilities, one per line — ${group.capabilities.length}`}
            value={group.capabilities.join('\n')}
            onChange={(value) =>
              mutate((current) => ({ ...current, capabilities: value.split('\n') }))
            }
            hint="Empty lines drop when you save."
            rows={6}
          />

          <CheckField
            label="Visible"
            description="Hidden groups stay in the draft but leave the section."
            checked={group.visible}
            onChange={(checked) => mutate((current) => ({ ...current, visible: checked }))}
          />
        </>
      )}
    />
  );
}
