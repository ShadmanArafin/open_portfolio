'use client';

import React from 'react';
import { TextArea, TextInput } from '../components/AdminFields';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { VStack } from '@astryxdesign/core/Layout';
import { Grid } from '@astryxdesign/core/Grid';
import { Plus } from 'lucide-react';
import { useCMS } from '../../cms/context/CMSContext';
import { CapabilityGroupItem } from '../../cms/types/cms';
import { AstryxHeader, AstryxField, AstryxButton } from '../components/astryx/AstryxComponents';
import { AdminRecord, AdminRecordList } from '../components/AdminRecord';
import { sorted, moveById, nextSortOrder, makeId, textareaClass } from '../utils/listOps';

export const AdminCapabilitiesCMS: React.FC = () => {
  const { draftData, updateDraft } = useCMS();
  const groups = sorted(draftData.capabilityGroups);

  const patch = (id: string, field: keyof CapabilityGroupItem, value: unknown) => {
    updateDraft((draft) => {
      const group = draft.capabilityGroups.find((g) => g.id === id);
      if (group) (group as any)[field] = value;
    });
  };

  const addGroup = () => {
    updateDraft((draft) => {
      const order = nextSortOrder(draft.capabilityGroups);
      draft.capabilityGroups.push({
        id: makeId('cap'),
        number: String(order).padStart(2, '0'),
        title: 'New category',
        description: '',
        capabilities: [],
        sortOrder: order,
        visible: true,
      });
    });
  };

  return (
    <VStack gap={6}>
      <AstryxHeader
        badgeText="Capabilities"
        title={`Capability Groups (${groups.length})`}
        subtitle="Skill categories shown in the “What I bring to the table” section, each with its own list of capabilities."
      >
        <AstryxButton variant="primary" icon={Plus} onClick={addGroup}>
          Add Group
        </AstryxButton>
      </AstryxHeader>

      {groups.length === 0 && (
        <EmptyState
          title="No capability groups yet"
          description="Add one to populate the capabilities section on your homepage."
        />
      )}

      <AdminRecordList>
        {groups.map((group, idx) => (
          <AdminRecord
            key={group.id}
            value={group.id}
            title={group.title || 'Untitled group'}
            badge={group.number || String(idx + 1).padStart(2, '0')}
            visible={group.visible}
            onToggleVisible={() => patch(group.id, 'visible', !group.visible)}
            canMoveUp={idx > 0}
            canMoveDown={idx < groups.length - 1}
            onMoveUp={() =>
              updateDraft((draft) => {
                draft.capabilityGroups = moveById(draft.capabilityGroups, group.id, 'up');
              })
            }
            onMoveDown={() =>
              updateDraft((draft) => {
                draft.capabilityGroups = moveById(draft.capabilityGroups, group.id, 'down');
              })
            }
            onRemove={() =>
              updateDraft((draft) => {
                draft.capabilityGroups = draft.capabilityGroups.filter((g) => g.id !== group.id);
              })
            }
            removeLabel="Remove group"
            summary={`${group.capabilities.length} capabilities`}
          >
            <Grid columns={{ minWidth: 200, repeat: 'fit' }} gap={4}>
              <TextInput
                label="Number"
                value={group.number}
                onChange={(_value, e) => patch(group.id, 'number', e.target.value)}
                width="100%"
              />

              <div className="sm:col-span-3">
                <TextInput
                  label="Category title"
                  value={group.title}
                  onChange={(_value, e) => patch(group.id, 'title', e.target.value)}
                  width="100%"
                />
              </div>
            </Grid>

            <TextArea
              label="Description"
              value={group.description}
              onChange={(_value, e) => patch(group.id, 'description', e.target.value)}
              description="Optional supporting line for this group."
              rows={2}
              width="100%"
            />

            <AstryxField label={`Capabilities, one per line — ${group.capabilities.length}`}>
              <textarea
                rows={6}
                value={group.capabilities.join('\n')}
                onChange={(e) =>
                  patch(
                    group.id,
                    'capabilities',
                    e.target.value.split('\n').filter((line) => line.trim() !== '')
                  )
                }
                className={textareaClass}
              />
            </AstryxField>
          </AdminRecord>
        ))}
      </AdminRecordList>
    </VStack>
  );
};
