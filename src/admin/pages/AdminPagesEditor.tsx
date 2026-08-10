'use client';

import React, { useState } from 'react';
import { TextArea, TextInput } from '../components/AdminFields';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Grid } from '@astryxdesign/core/Grid';
import { Divider } from '@astryxdesign/core/Divider';
import { Text } from '@astryxdesign/core/Text';
import { useCMS } from '../../cms/context/CMSContext';
import { SectionConfig } from '../../cms/types/cms';
import { AdminRecord, AdminRecordList } from '../components/AdminRecord';
import { AstryxHeader, AstryxButton } from '../components/astryx/AstryxComponents';
import { Save, Check } from 'lucide-react';

export const AdminPagesEditor: React.FC = () => {
  const { draftData, updateDraft } = useCMS();
  const [savedId, setSavedId] = useState<string | null>(null);

  // Orders at 100+ are standalone page headers (Work, Case Studies, Contact),
  // not homepage bands - they are editable but not reorderable.
  const PAGE_HEADER_ORDER_FLOOR = 100;

  const allSections = [...draftData.sections].sort((a, b) => a.order - b.order);
  const sections = allSections.filter((s) => s.order < PAGE_HEADER_ORDER_FLOOR);
  const pageHeaders = allSections.filter((s) => s.order >= PAGE_HEADER_ORDER_FLOOR);

  const handleToggleVisibility = (id: string) => {
    updateDraft((draft) => {
      const sec = draft.sections.find((s) => s.id === id);
      if (sec) sec.visible = !sec.visible;
    });
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const reordered = [...sections];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];

    updateDraft((draft) => {
      // Renumber homepage bands only, leaving page headers at their 100+ slots.
      reordered.forEach((sec, idx) => {
        const target = draft.sections.find((s) => s.id === sec.id);
        if (target) target.order = idx + 1;
      });
    });
  };

  const handleSectionFieldChange = (id: string, field: keyof SectionConfig, value: any) => {
    updateDraft((draft) => {
      const sec = draft.sections.find((s) => s.id === id);
      if (sec) {
        (sec as any)[field] = value;
      }
      if (id === 'about') {
        if (field === 'heading') draft.settings.aboutHeading = value;
        if (field === 'description')
          draft.settings.aboutStoryParagraphs = String(value)
            .split(/\n\s*\n/)
            .filter((para: string) => para.trim() !== '');
      }
    });
  };

  const handleExplicitSave = (id: string) => {
    updateDraft((draft) => {
      draft.lastSavedAt = new Date().toISOString();
    });
    setSavedId(id);
    setTimeout(() => setSavedId(null), 2500);
  };

  return (
    <VStack gap={6}>
      {/* Astryx Header */}
      <AstryxHeader
        badgeText="Homepage"
        title="Homepage Section Builder"
        subtitle="Reorder the bands on your homepage, show or hide them, and edit their headings and buttons. Changes save as you type."
      />

      {/* Sections List */}
      <AdminRecordList>
        {sections.map((section, index) => {
          const isSaved = savedId === section.id;

          return (
            <AdminRecord
              key={section.id}
              value={section.id}
              title={section.name}
              badge={`#${section.anchorId}`}
              summary={`Label: ${section.label}`}
              visible={section.visible}
              onToggleVisible={() => handleToggleVisibility(section.id)}
              onMoveUp={() => handleMove(index, 'up')}
              onMoveDown={() => handleMove(index, 'down')}
              canMoveUp={index > 0}
              canMoveDown={index < sections.length - 1}
            >
              <Grid columns={{ minWidth: 280, repeat: 'fit' }} gap={4}>
                <TextInput
                  label="Section label"
                  value={section.label}
                  onChange={(_value, e) =>
                    handleSectionFieldChange(section.id, 'label', e.target.value)
                  }
                  width="100%"
                />

                <TextInput
                  label="Anchor ID (#)"
                  value={section.anchorId}
                  onChange={(_value, e) =>
                    handleSectionFieldChange(section.id, 'anchorId', e.target.value)
                  }
                  width="100%"
                />
              </Grid>

              <TextInput
                label="Main headline"
                value={section.heading || ''}
                onChange={(_value, e) =>
                  handleSectionFieldChange(section.id, 'heading', e.target.value)
                }
                width="100%"
              />

              <TextArea
                label="Supporting description / story"
                value={section.description || ''}
                onChange={(_value, e) =>
                  handleSectionFieldChange(section.id, 'description', e.target.value)
                }
                rows={4}
                width="100%"
              />

              <Grid columns={{ minWidth: 280, repeat: 'fit' }} gap={4}>
                <TextInput
                  label="Primary CTA label"
                  value={section.primaryCtaLabel || ''}
                  onChange={(_value, e) =>
                    handleSectionFieldChange(section.id, 'primaryCtaLabel', e.target.value)
                  }
                  width="100%"
                />

                <TextInput
                  label="Primary CTA destination"
                  value={section.primaryCtaUrl || ''}
                  onChange={(_value, e) =>
                    handleSectionFieldChange(section.id, 'primaryCtaUrl', e.target.value)
                  }
                  width="100%"
                />
              </Grid>

              <HStack justify="end">
                <AstryxButton
                  variant="primary"
                  icon={isSaved ? Check : Save}
                  onClick={() => handleExplicitSave(section.id)}
                >
                  {isSaved ? 'Saved' : 'Save section'}
                </AstryxButton>
              </HStack>
            </AdminRecord>
          );
        })}
      </AdminRecordList>

      {/* Standalone page headers — the heading block at the top of /work,
          /case-studies and /contact. Not part of the homepage sequence. */}
      {pageHeaders.length > 0 && (
        <VStack gap={3}>
          <Divider />
          <VStack gap={1}>
            <Text type="large" weight="medium">
              Page headers
            </Text>
            <Text type="supporting" display="block">
              The intro block at the top of each standalone page.
            </Text>
          </VStack>

          <AdminRecordList>
            {pageHeaders.map((section) => (
              <AdminRecord
                key={section.id}
                value={section.id}
                title={section.name}
                badge={section.label}
                summary={section.heading || undefined}
                visible={section.visible}
                onToggleVisible={() => handleToggleVisibility(section.id)}
              >
                <TextInput
                  label="Eyebrow label"
                  value={section.label}
                  onChange={(_value, e) =>
                    handleSectionFieldChange(section.id, 'label', e.target.value)
                  }
                  width="100%"
                />

                <TextInput
                  label="Headline"
                  value={section.heading || ''}
                  onChange={(_value, e) =>
                    handleSectionFieldChange(section.id, 'heading', e.target.value)
                  }
                  width="100%"
                />

                <TextArea
                  label="Intro paragraph"
                  value={section.description || ''}
                  onChange={(_value, e) =>
                    handleSectionFieldChange(section.id, 'description', e.target.value)
                  }
                  rows={2}
                  width="100%"
                />
              </AdminRecord>
            ))}
          </AdminRecordList>
        </VStack>
      )}
    </VStack>
  );
};
