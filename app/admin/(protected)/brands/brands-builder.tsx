'use client';

import type { BrandItem } from '@/cms/types/cms';
import { updateBrandsAction } from '../_actions/collections';
import { CollectionEditor } from '../_components/collection-editor';
import { brandsCsv } from '@/core/import/csv-templates';
import { CheckField, Field } from '../_components/form-fields';
import { newId } from '../_components/ids';
import { ImageField } from '../_components/image-field';

/**
 * Clients and logos for the logo wall.
 *
 * One card per brand: the logo, the name, a description for screen readers,
 * and whether it is on the wall. The legacy screen had the same controls
 * except the description — it uploaded a library caption ("Northwind logo")
 * and left the public `alt` field as the seed had it, so a brand added from
 * the admin went out with no description at all. This screen writes both.
 *
 * `url` and `size` stay as the seed authored them, the way the legacy screen
 * left them: the block the logos feed ignores both today.
 */
export function BrandsBuilder({
  initialBrands,
  token,
}: {
  initialBrands: BrandItem[];
  token?: string;
}) {
  return (
    <CollectionEditor<BrandItem>
      token={token}
      initialItems={initialBrands}
      addLabel="Add brand"
      emptyTitle="No brands yet."
      emptyHint="Add one and its logo joins the strip on your homepage."
      deleteLabel="Delete brand"
      deleteWarning="The brand leaves your draft, wherever it was shown. This cannot be undone without restoring a version."
      title={(brand) => brand.name}
      badge={(brand) => (brand.visible ? null : { label: 'Hidden', live: false })}
      csv={brandsCsv}
      create={(brands) => ({
        id: newId('brand'),
        name: 'New client',
        logo: '',
        alt: '',
        size: 'default',
        sortOrder: brands.length + 1,
        visible: true,
      })}
      duplicate={(brand) => ({ ...structuredClone(brand), id: newId('brand') })}
      save={async (brands, token) => {
        const result = await updateBrandsAction(brands, token);
        return {
          ok: result.ok,
          error: result.error,
          conflict: result.conflict,
          token: result.token,
          items: result.brands,
        };
      }}
      renderFields={(brand, mutate) => (
        <>
          <ImageField
            label="Logo"
            src={brand.logo}
            alt={`${brand.name} logo`}
            uploadAlt={`${brand.name} logo`}
            hint="Shown on the logo wall. A wide logo works best."
            onUploaded={(media) => mutate((current) => ({ ...current, logo: media.url }))}
            onRemove={() => mutate((current) => ({ ...current, logo: '' }))}
          />
          <Field
            label="Brand name"
            value={brand.name}
            onChange={(value) => mutate((current) => ({ ...current, name: value }))}
          />
          <Field
            label="Logo description"
            value={brand.alt}
            onChange={(value) => mutate((current) => ({ ...current, alt: value }))}
            hint="Read out by screen readers where the logo stands alone."
          />
          <CheckField
            label="Visible"
            description="Hidden brands stay in the draft but leave the wall."
            checked={brand.visible}
            onChange={(checked) => mutate((current) => ({ ...current, visible: checked }))}
          />
        </>
      )}
    />
  );
}
