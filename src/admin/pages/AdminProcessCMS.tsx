import React from 'react';
import { TextArea, TextInput } from '../components/AdminFields';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { VStack } from '@astryxdesign/core/Layout';
import { Grid } from '@astryxdesign/core/Grid';
import { Plus } from 'lucide-react';
import { useCMS } from '../../cms/context/CMSContext';
import { ProcessStepItem } from '../../cms/types/cms';
import { AstryxHeader, AstryxButton } from '../components/astryx/AstryxComponents';
import { AdminRecord, AdminRecordList } from '../components/AdminRecord';
import { sorted, moveById, nextSortOrder, makeId } from '../utils/listOps';

export const AdminProcessCMS: React.FC = () => {
  const { draftData, updateDraft } = useCMS();
  const steps = sorted(draftData.processSteps);

  const patch = (id: string, field: keyof ProcessStepItem, value: unknown) => {
    updateDraft((draft) => {
      const step = draft.processSteps.find((s) => s.id === id);
      if (step) (step as any)[field] = value;
    });
  };

  const addStep = () => {
    updateDraft((draft) => {
      const order = nextSortOrder(draft.processSteps);
      draft.processSteps.push({
        id: makeId('step'),
        number: String(order).padStart(2, '0'),
        title: 'New step',
        duration: '',
        deliverable: '',
        description: '',
        details: [],
        sortOrder: order,
        visible: true,
      });
    });
  };

  return (
    <VStack gap={6}>
      <AstryxHeader
        badgeText="Process"
        title={`Process Steps (${steps.length})`}
        subtitle="The numbered steps in the “Design Process” section on the homepage. Deliverable and detail chips are optional — leave them empty to hide them."
      >
        <AstryxButton variant="primary" icon={Plus} onClick={addStep}>
          Add Step
        </AstryxButton>
      </AstryxHeader>

      {steps.length === 0 && (
        <EmptyState
          title="No process steps yet"
          description="Add one and it appears on the homepage immediately."
        />
      )}

      <AdminRecordList>
        {steps.map((step, idx) => (
          <AdminRecord
            key={step.id}
            value={step.id}
            title={step.title || 'Untitled step'}
            badge={step.number || String(idx + 1).padStart(2, '0')}
            visible={step.visible}
            onToggleVisible={() => patch(step.id, 'visible', !step.visible)}
            canMoveUp={idx > 0}
            canMoveDown={idx < steps.length - 1}
            onMoveUp={() =>
              updateDraft((draft) => {
                draft.processSteps = moveById(draft.processSteps, step.id, 'up');
              })
            }
            onMoveDown={() =>
              updateDraft((draft) => {
                draft.processSteps = moveById(draft.processSteps, step.id, 'down');
              })
            }
            onRemove={() =>
              updateDraft((draft) => {
                draft.processSteps = draft.processSteps.filter((s) => s.id !== step.id);
              })
            }
            removeLabel="Remove step"
            summary={step.description || undefined}
          >
            <Grid columns={{ minWidth: 200, repeat: 'fit' }} gap={4}>
              <TextInput
                label="Number"
                value={step.number}
                onChange={(_value, e) => patch(step.id, 'number', e.target.value)}
                width="100%"
              />

              <div className="sm:col-span-3">
                <TextInput
                  label="Title"
                  value={step.title}
                  onChange={(_value, e) => patch(step.id, 'title', e.target.value)}
                  width="100%"
                />
              </div>
            </Grid>

            <TextArea
              label="Description"
              value={step.description}
              onChange={(_value, e) => patch(step.id, 'description', e.target.value)}
              rows={2}
              width="100%"
            />

            <Grid columns={{ minWidth: 280, repeat: 'fit' }} gap={4}>
              <TextInput
                label="Deliverable"
                value={step.deliverable}
                onChange={(_value, e) => patch(step.id, 'deliverable', e.target.value)}
                description="Optional. Shown as “Deliverable: …” under the title."
                width="100%"
              />

              <TextInput
                label="Duration"
                value={step.duration}
                onChange={(_value, e) => patch(step.id, 'duration', e.target.value)}
                description="Optional. Not currently shown on the site."
                width="100%"
              />
            </Grid>

            <TextArea
              label="Detail chips (one per line)"
              value={step.details?.join('\n') ?? ''}
              onChange={(_value, e) =>
                patch(
                  step.id,
                  'details',
                  e.target.value.split('\n').filter((line) => line.trim() !== '')
                )
              }
              description="Optional. Small tags under the description."
              rows={2}
              width="100%"
            />
          </AdminRecord>
        ))}
      </AdminRecordList>
    </VStack>
  );
};
