'use client';

import React from 'react';
import { TextArea, TextInput } from '../components/AdminFields';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Grid } from '@astryxdesign/core/Grid';
import { Plus, Upload, X } from 'lucide-react';
import { useCMS } from '../../cms/context/CMSContext';
import { RecommendationItem } from '../../cms/types/cms';
import { AstryxHeader, AstryxField, AstryxButton } from '../components/astryx/AstryxComponents';
import { AdminRecord, AdminRecordList } from '../components/AdminRecord';
import { CMSImage } from '../../components/common/CMSImage';
import { sorted, moveById, nextSortOrder, makeId } from '../utils/listOps';

export const AdminRecommendationsCMS: React.FC = () => {
  const { draftData, updateDraft, uploadMedia } = useCMS();
  const items = sorted(draftData.recommendations);

  const patch = (id: string, field: keyof RecommendationItem, value: unknown) => {
    updateDraft((draft) => {
      const rec = draft.recommendations.find((r) => r.id === id);
      if (rec) (rec as any)[field] = value;
    });
  };

  const addItem = () => {
    updateDraft((draft) => {
      const order = nextSortOrder(draft.recommendations);
      draft.recommendations.push({
        id: makeId('rec'),
        name: 'New name',
        role: '',
        company: '',
        quote: '',
        featured: true,
        sortOrder: order,
        visible: true,
      });
    });
  };

  const handleAvatar = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const media = await uploadMedia(file, { altText: `Portrait` });
    if (media) patch(id, 'avatar', media.url);
  };

  return (
    <VStack gap={6}>
      <AstryxHeader
        badgeText="Recommendations"
        title={`Recommendations (${items.length})`}
        subtitle="Testimonials shown on the homepage. The card adds its own quote marks — type the quote without them."
      >
        <AstryxButton variant="primary" icon={Plus} onClick={addItem}>
          Add Recommendation
        </AstryxButton>
      </AstryxHeader>

      {items.length === 0 && (
        <EmptyState
          title="No recommendations yet"
          description="The section hides itself on the site while this list is empty."
        />
      )}

      <AdminRecordList>
        {items.map((rec, idx) => (
          <AdminRecord
            key={rec.id}
            value={rec.id}
            title={rec.name || 'Unnamed'}
            badge={rec.company || undefined}
            visible={rec.visible}
            onToggleVisible={() => patch(rec.id, 'visible', !rec.visible)}
            canMoveUp={idx > 0}
            canMoveDown={idx < items.length - 1}
            onMoveUp={() =>
              updateDraft((draft) => {
                draft.recommendations = moveById(draft.recommendations, rec.id, 'up');
              })
            }
            onMoveDown={() =>
              updateDraft((draft) => {
                draft.recommendations = moveById(draft.recommendations, rec.id, 'down');
              })
            }
            onRemove={() =>
              updateDraft((draft) => {
                draft.recommendations = draft.recommendations.filter((r) => r.id !== rec.id);
              })
            }
            removeLabel="Remove recommendation"
            summary={rec.company || undefined}
          >
            <Grid columns={{ minWidth: 220, repeat: 'fit' }} gap={4}>
              <TextInput
                label="Name"
                value={rec.name}
                onChange={(_value, e) => patch(rec.id, 'name', e.target.value)}
                width="100%"
              />

              <TextInput
                label="Job title"
                value={rec.role}
                onChange={(_value, e) => patch(rec.id, 'role', e.target.value)}
                description="Shown before the company name."
                placeholder="e.g. Head of Engineering"
                width="100%"
              />

              <TextInput
                label="Company"
                value={rec.company}
                onChange={(_value, e) => patch(rec.id, 'company', e.target.value)}
                width="100%"
              />
            </Grid>

            <TextArea
              label="Quote"
              value={rec.quote}
              onChange={(_value, e) => patch(rec.id, 'quote', e.target.value)}
              rows={3}
              width="100%"
            />

            <AstryxField label="Avatar" info="Optional. Shown as a small circle next to the name.">
              <HStack gap={3} align="center">
                {rec.avatar && (
                  <div className="relative">
                    <CMSImage
                      src={rec.avatar}
                      alt={rec.name}
                      className="w-12 h-12 rounded-full object-cover border border-border"
                    />
                    <button
                      onClick={() => patch(rec.id, 'avatar', undefined)}
                      className="absolute -top-1 -right-1 p-0.5 rounded-full bg-surface-primary border border-border text-text-muted hover:text-[var(--color-text-red)]"
                      title="Remove avatar"
                      aria-label="Remove avatar"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <label className="inline-flex items-center gap-2 h-[42px] px-4 rounded-xl bg-surface-secondary border border-border text-xs text-text-primary hover:border-text-primary/40 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>{rec.avatar ? 'Replace' : 'Upload'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => void handleAvatar(rec.id, e)}
                  />
                </label>
              </HStack>
            </AstryxField>
          </AdminRecord>
        ))}
      </AdminRecordList>
    </VStack>
  );
};
