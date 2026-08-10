import React, { useState } from 'react';
import { Selector, TextArea, TextInput } from '../components/AdminFields';
import { AdminRecord, AdminRecordList } from '../components/AdminRecord';
import { VStack } from '@astryxdesign/core/Layout';
import { Grid } from '@astryxdesign/core/Grid';
import { DateInput } from '@astryxdesign/core/DateInput';
import { Switch } from '@astryxdesign/core/Switch';
import { formatPeriod } from '../../cms/utils/dates';
import { useCMS } from '../../cms/context/CMSContext';
import { ExperienceItem } from '../../cms/types/cms';
import { AstryxHeader, AstryxButton } from '../components/astryx/AstryxComponents';
import { Plus, Save, Check } from 'lucide-react';

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];

/** DateInput types its value as a literal YYYY-MM-DD; the CMS stores a plain
 *  string, so borrow the component's own type rather than restating it. */
type IsoDateString = React.ComponentProps<typeof DateInput>['value'];

export const AdminExperienceCMS: React.FC = () => {
  const { draftData, updateDraft } = useCMS();
  const [isSaved, setIsSaved] = useState(false);

  const expList = draftData.experience.sort((a, b) => a.sortOrder - b.sortOrder);

  const handleAddExperience = () => {
    const newExp: ExperienceItem = {
      id: `exp-${Date.now()}`,
      period: '',
      startDate: new Date().toISOString().split('T')[0],
      type: 'Full-time',
      role: '',
      company: 'New Company',
      companyUrl: '',
      current: true,
      summary: 'Short summary description of role responsibilities.',
      highlights: ['Key impact point 1', 'Key impact point 2'],
      sortOrder: expList.length + 1,
      visible: true,
    };

    updateDraft((draft) => {
      draft.experience.unshift(newExp);
    });
  };

  const handleRemoveExperience = (id: string) => {
    updateDraft((draft) => {
      draft.experience = draft.experience.filter((e) => e.id !== id);
    });
  };

  const handleExpChange = (id: string, field: keyof ExperienceItem, value: any) => {
    updateDraft((draft) => {
      const e = draft.experience.find((item) => item.id === id);
      if (e) {
        (e as any)[field] = value;
      }
    });
  };

  const handleSaveAll = () => {
    updateDraft((draft) => {
      draft.lastSavedAt = new Date().toISOString();
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <VStack gap={6}>
      {/* Astryx Header */}
      <AstryxHeader
        badgeText="Experience"
        title={`Work Experience Timeline (${expList.length})`}
        subtitle="Manage full-time career roles, company names, timeline dates, and key highlights."
      >
        <AstryxButton variant="primary" icon={Plus} onClick={handleAddExperience}>
          Add Experience
        </AstryxButton>
      </AstryxHeader>

      <AdminRecordList>
        {expList.map((exp) => (
          <AdminRecord
            key={exp.id}
            value={exp.id}
            title={`${exp.role} @ ${exp.company}`}
            summary={formatPeriod(exp)}
            badge={exp.current ? 'Current' : 'Past'}
            badgeVariant={exp.current ? 'green' : 'neutral'}
            onRemove={() => handleRemoveExperience(exp.id)}
            removeLabel="Remove role"
          >
            <Grid columns={{ minWidth: 220, repeat: 'fit' }} gap={4}>
              <TextInput
                label="Role title"
                value={exp.role}
                onChange={(_value, e) => handleExpChange(exp.id, 'role', e.target.value)}
                width="100%"
              />

              <TextInput
                label="Company name"
                value={exp.company}
                onChange={(_value, e) => handleExpChange(exp.id, 'company', e.target.value)}
                width="100%"
              />

              <Selector
                label="Employment type"
                value={exp.type}
                options={EMPLOYMENT_TYPES}
                onChange={(value) => handleExpChange(exp.id, 'type', value)}
                width="100%"
              />
            </Grid>

            {/* Dates are picked, not typed. Only the month and year are shown
                on the site, so the day is irrelevant — see cms/utils/dates. */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
              <DateInput
                label="Started"
                value={exp.startDate as IsoDateString}
                onChange={(value) => handleExpChange(exp.id, 'startDate', value)}
                description="Month and year are shown."
              />

              <DateInput
                label="Ended"
                value={exp.endDate as IsoDateString}
                onChange={(value) => handleExpChange(exp.id, 'endDate', value)}
                isDisabled={exp.current}
                disabledMessage="Turn off “Current role” to set an end date."
                isOptional
              />

              <Switch
                label="Current role"
                description={`Shows as “${formatPeriod(exp)}”`}
                value={exp.current}
                onChange={(checked) => {
                  handleExpChange(exp.id, 'current', checked);
                  if (checked) handleExpChange(exp.id, 'endDate', undefined);
                }}
              />
            </div>

            <TextArea
              label="Role overview summary"
              value={exp.summary}
              onChange={(_value, e) => handleExpChange(exp.id, 'summary', e.target.value)}
              rows={2}
              width="100%"
            />

            <TextArea
              label="Key highlights (one per line)"
              value={exp.highlights?.join('\n') || ''}
              onChange={(_value, e) =>
                handleExpChange(exp.id, 'highlights', e.target.value.split('\n'))
              }
              rows={3}
              width="100%"
            />
          </AdminRecord>
        ))}
      </AdminRecordList>

      <div className="flex justify-end pt-4 border-t border-border">
        <AstryxButton variant="primary" icon={isSaved ? Check : Save} onClick={handleSaveAll}>
          {isSaved ? 'Saved' : 'Save experience'}
        </AstryxButton>
      </div>
    </VStack>
  );
};
