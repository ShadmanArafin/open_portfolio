import React from 'react';
import { Selector, TextInput } from '../components/AdminFields';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Upload } from 'lucide-react';
import { useCMS } from '../../cms/context/CMSContext';
import { VisualArtifactItem } from '../../cms/types/cms';
import { AstryxHeader } from '../components/astryx/AstryxComponents';
import { AdminRecord, AdminRecordList } from '../components/AdminRecord';
import { CMSImage } from '../../components/common/CMSImage';
import { AdminImageField } from '../components/AdminImageField';
import { sorted, moveById, nextSortOrder, makeId } from '../utils/listOps';

const CATEGORIES: VisualArtifactItem['category'][] = ['ui', 'systems', 'mobile'];

export const AdminArtifactsCMS: React.FC = () => {
  const { draftData, updateDraft, uploadMedia } = useCMS();
  const items = sorted(draftData.artifacts);

  const patch = (id: string, field: keyof VisualArtifactItem, value: unknown) => {
    updateDraft((draft) => {
      const item = draft.artifacts.find((a) => a.id === id);
      if (item) (item as any)[field] = value;
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';

    for (const file of files) {
      const media = await uploadMedia(file);
      if (!media) continue;
      updateDraft((draft) => {
        draft.artifacts.push({
          id: makeId('art'),
          category: 'ui',
          src: media.url,
          alt: media.altText,
          sortOrder: nextSortOrder(draft.artifacts),
          visible: true,
        });
      });
    }
  };

  const replaceImageFile = async (id: string, file: File) => {
    const media = await uploadMedia(file);
    if (media) patch(id, 'src', media.url);
  };

  return (
    <VStack gap={6}>
      <AstryxHeader
        badgeText="Visual explorations"
        title={`Visual Artifacts (${items.length})`}
        subtitle="Interface shots shown in the visual explorations gallery on the About page."
      >
        <label className="inline-flex items-center justify-center gap-2 h-[42px] px-5 rounded-xl bg-accent text-bg text-xs font-semibold hover:opacity-90 cursor-pointer border border-[var(--color-border-emphasized)] shadow-sm">
          <Upload className="w-4 h-4" />
          <span>Upload Images</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => void handleUpload(e)}
          />
        </label>
      </AstryxHeader>

      {items.length === 0 && (
        <EmptyState
          title="No visual explorations yet"
          description="Upload one or more images to fill the gallery on your About page."
        />
      )}

      <AdminRecordList>
        {items.map((item, idx) => (
          <AdminRecord
            key={item.id}
            value={item.id}
            title={item.alt || 'Untitled artifact'}
            badge={item.category.toUpperCase()}
            media={<CMSImage src={item.src} alt="" className="w-full h-full object-cover" />}
            visible={item.visible}
            onToggleVisible={() => patch(item.id, 'visible', !item.visible)}
            canMoveUp={idx > 0}
            canMoveDown={idx < items.length - 1}
            onMoveUp={() =>
              updateDraft((draft) => {
                draft.artifacts = moveById(draft.artifacts, item.id, 'up');
              })
            }
            onMoveDown={() =>
              updateDraft((draft) => {
                draft.artifacts = moveById(draft.artifacts, item.id, 'down');
              })
            }
            onRemove={() =>
              updateDraft((draft) => {
                draft.artifacts = draft.artifacts.filter((a) => a.id !== item.id);
              })
            }
            removeLabel="Remove artifact"
          >
            <HStack gap={4} align="start" wrap="wrap">
              <AdminImageField
                src={item.src}
                alt={item.alt}
                size="thumb"
                fit="cover"
                onFile={(file) => replaceImageFile(item.id, file)}
              />

              <VStack gap={4}>
                <TextInput
                  label="Alt text"
                  value={item.alt}
                  onChange={(_value, e) => patch(item.id, 'alt', e.target.value)}
                  description="Describes the image for screen readers and search engines."
                  width="100%"
                />

                <Selector
                  label="Category"
                  value={item.category}
                  options={CATEGORIES}
                  onChange={(value) => patch(item.id, 'category', value)}
                  width="100%"
                />
              </VStack>
            </HStack>
          </AdminRecord>
        ))}
      </AdminRecordList>
    </VStack>
  );
};
