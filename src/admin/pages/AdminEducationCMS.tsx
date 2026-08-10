import React, { useState } from 'react';
import { Selector, TextInput } from '../components/AdminFields';
import { AdminRecord, AdminRecordList } from '../components/AdminRecord';
import { VStack } from '@astryxdesign/core/Layout';
import { Grid } from '@astryxdesign/core/Grid';
import { useCMS } from '../../cms/context/CMSContext';
import { EducationItem } from '../../cms/types/cms';
import { AstryxHeader, AstryxButton } from '../components/astryx/AstryxComponents';
import { Plus, Save, Check } from 'lucide-react';

/** Matches EducationItem['status'] in the CMS schema. */
const EDUCATION_STATUSES = ['In Progress', 'Graduated', 'Completed', 'Paused'];

export const AdminEducationCMS: React.FC = () => {
  const { draftData, updateDraft } = useCMS();
  const [isSaved, setIsSaved] = useState(false);

  const eduList = draftData.education.sort((a, b) => a.sortOrder - b.sortOrder);

  const handleAddEducation = () => {
    const newEdu: EducationItem = {
      id: `edu-${Date.now()}`,
      number: `0${eduList.length + 1}`,
      yearLabel: '2026',
      degree: 'B.Sc. in Computer Science & Engineering',
      institution: 'University Name',
      status: 'Graduated',
      sortOrder: eduList.length + 1,
      visible: true,
    };

    updateDraft((draft) => {
      draft.education.unshift(newEdu);
    });
  };

  const handleRemoveEducation = (id: string) => {
    updateDraft((draft) => {
      draft.education = draft.education.filter((e) => e.id !== id);
    });
  };

  const handleEduChange = (id: string, field: keyof EducationItem, value: any) => {
    updateDraft((draft) => {
      const e = draft.education.find((item) => item.id === id);
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
        badgeText="Education"
        title={`Education & Academic Chapters (${eduList.length})`}
        subtitle="Manage academic degrees, university names, status badges, and graduation dates."
      >
        <AstryxButton variant="primary" icon={Plus} onClick={handleAddEducation}>
          Add Education
        </AstryxButton>
      </AstryxHeader>

      <AdminRecordList>
        {eduList.map((edu) => (
          <AdminRecord
            key={edu.id}
            value={edu.id}
            title={edu.degree}
            summary={edu.institution}
            badge={edu.status}
            badgeVariant={edu.status === 'Graduated' ? 'green' : 'cyan'}
            onRemove={() => handleRemoveEducation(edu.id)}
            removeLabel="Remove entry"
          >
            <Grid columns={{ minWidth: 220, repeat: 'fit' }} gap={4}>
              <TextInput
                label="Degree / certificate"
                value={edu.degree}
                onChange={(_value, e) => handleEduChange(edu.id, 'degree', e.target.value)}
                width="100%"
              />

              <TextInput
                label="Institution / university"
                value={edu.institution}
                onChange={(_value, e) => handleEduChange(edu.id, 'institution', e.target.value)}
                width="100%"
              />

              <TextInput
                label="Completed"
                description="Shown as written, e.g. JUN 2024. Leave empty while in progress."
                value={edu.yearLabel}
                onChange={(_value, e) => handleEduChange(edu.id, 'yearLabel', e.target.value)}
                placeholder="JUN 2024"
                isOptional
                width="100%"
              />
            </Grid>

            {/* Status is a fixed set, so it picks rather than types — free text
                here is what let the same value end up in both fields. */}
            <Selector
              label="Status"
              value={edu.status}
              options={EDUCATION_STATUSES}
              onChange={(value) => {
                handleEduChange(edu.id, 'status', value);
                handleEduChange(edu.id, 'isCurrent', value === 'In Progress');
              }}
              width={220}
            />
          </AdminRecord>
        ))}
      </AdminRecordList>

      <div className="flex justify-end pt-4 border-t border-border">
        <AstryxButton variant="primary" icon={isSaved ? Check : Save} onClick={handleSaveAll}>
          {isSaved ? 'Saved' : 'Save education'}
        </AstryxButton>
      </div>
    </VStack>
  );
};
