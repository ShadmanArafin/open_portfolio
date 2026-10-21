'use client';

import type { RecommendationItem } from '@/cms/types/cms';
import { updateRecommendationsAction } from '../_actions/collections';
import { CollectionEditor } from '../_components/collection-editor';
import { recommendationsCsv } from '@/core/import/csv-templates';
import { CheckField, Field } from '../_components/form-fields';
import { newId } from '../_components/ids';
import { ImageField } from '../_components/image-field';

/**
 * The quotes shown on the homepage.
 *
 * The legacy screen kept the quote field bare and put the warning in the
 * page header; here it sits on the field it applies to, because the card
 * really does add its own quotation marks. Two things the legacy screen
 * could not set are settable now: `featured` (the testimonials block filters
 * on "featured only" with no way to reach it) and the avatar can be cleared
 * without replacing it. `companyUrl` stays seed-only, as it was.
 */
export function RecommendationsBuilder({
  initialRecommendations,
  token,
}: {
  initialRecommendations: RecommendationItem[];
  token?: string;
}) {
  return (
    <CollectionEditor<RecommendationItem>
      token={token}
      initialItems={initialRecommendations}
      addLabel="Add recommendation"
      emptyTitle="No recommendations yet."
      emptyHint="The section hides itself on the site while this list is empty."
      deleteLabel="Delete recommendation"
      deleteWarning="The quote leaves your draft, wherever it was shown. This cannot be undone without restoring a version."
      title={(item) => item.name}
      summary={(item) => item.company}
      badge={(item) => (item.visible ? null : { label: 'Hidden', live: false })}
      csv={recommendationsCsv}
      create={(items) => ({
        id: newId('rec'),
        name: 'New name',
        role: '',
        company: '',
        quote: '',
        featured: true,
        sortOrder: items.length + 1,
        visible: true,
      })}
      duplicate={(item) => ({ ...structuredClone(item), id: newId('rec') })}
      save={async (recommendations, token) => {
        const result = await updateRecommendationsAction(recommendations, token);
        return {
          ok: result.ok,
          error: result.error,
          conflict: result.conflict,
          token: result.token,
          items: result.recommendations,
        };
      }}
      renderFields={(item, mutate) => (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Name"
              value={item.name}
              onChange={(value) => mutate((current) => ({ ...current, name: value }))}
            />
            <Field
              label="Job title"
              value={item.role}
              onChange={(value) => mutate((current) => ({ ...current, role: value }))}
              hint="Shown before the company name."
              placeholder="e.g. Head of Engineering"
            />
          </div>

          <Field
            label="Company"
            value={item.company}
            onChange={(value) => mutate((current) => ({ ...current, company: value }))}
          />

          <Field
            label="Quote"
            value={item.quote}
            onChange={(value) => mutate((current) => ({ ...current, quote: value }))}
            hint="The card adds its own quote marks — type the quote without them."
            rows={3}
          />

          <ImageField
            label="Avatar"
            src={item.avatar ?? ''}
            alt={`${item.name} portrait`}
            uploadAlt={item.name ? `${item.name} portrait` : 'Portrait'}
            hint="Optional. Shown as a small circle next to the name."
            onUploaded={(media) => mutate((current) => ({ ...current, avatar: media.url }))}
            onRemove={() => mutate((current) => ({ ...current, avatar: undefined }))}
          />

          <CheckField
            label="Featured"
            description="Shown by blocks that only display featured quotes."
            checked={item.featured}
            onChange={(checked) => mutate((current) => ({ ...current, featured: checked }))}
          />

          <CheckField
            label="Visible"
            description="Hidden quotes stay in the draft but leave the site."
            checked={item.visible}
            onChange={(checked) => mutate((current) => ({ ...current, visible: checked }))}
          />
        </>
      )}
    />
  );
}
