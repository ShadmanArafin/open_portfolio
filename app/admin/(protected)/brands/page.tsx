import type { Metadata } from 'next';
import { getContentForChannel } from '@/core/content/read';
import { screenToken } from '@/core/content/screen-token';
import { BrandsBuilder } from './brands-builder';

export const metadata: Metadata = { title: 'Brands' };

/**
 * The logo wall's content, at its own address instead of inside the legacy
 * catch-all. Same shape as the work collections: the trunk reads the draft,
 * the island owns every edit locally, and one Save writes the whole list
 * revision-checked.
 */
export default async function BrandsPage() {
  const draft = await getContentForChannel('draft');
  const brands = [...(draft.brands ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="grid gap-6" style={{ maxWidth: 'var(--measure)' }}>
      <div>
        <p className="m-0 font-mono text-xs uppercase tracking-widest text-text-muted">Content</p>
        <h1 className="font-display m-0 mt-1 text-3xl">Clients & logos</h1>
        <p className="m-0 mt-1 text-text-secondary">
          The logos shown in the strip on your homepage. Clients, tools, publications — whatever
          fits your field.
        </p>
      </div>

      <BrandsBuilder token={screenToken(draft, 'brands')} initialBrands={brands} />
    </div>
  );
}
