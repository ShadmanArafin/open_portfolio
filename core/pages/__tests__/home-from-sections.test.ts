import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { INITIAL_CMS_STATE } from '@/cms/data/initialData';
import { BlockList } from '@/core/blocks/registry';
import { parsePage } from '@/core/blocks/lookup';
import { homePageFromSections } from '../home-from-sections';

/** Sections that configure other pages (`work-page`, `contact-page`, …). */
const isHomeSection = (id: string) => !id.endsWith('-page');

const state = () => structuredClone(INITIAL_CMS_STATE);

describe('home page from the theme sections', () => {
  it('turns every seeded section into a block that parses, none quarantined', () => {
    const { sections, settings } = state();
    const page = homePageFromSections(sections, settings);
    const parsed = parsePage(page.blocks);
    expect(parsed.filter((entry) => entry.kind === 'unknown')).toEqual([]);
    expect(page.blocks.length).toBe(sections.filter((s) => isHomeSection(s.id)).length);
    expect(page.status).toBe('draft');
  });

  it('keeps the owner’s words, order and hidden sections', () => {
    const { sections, settings } = state();
    sections.find((s) => s.id === 'hero')!.heading = 'Pictures of places about to change';
    sections.find((s) => s.id === 'brands')!.visible = false;
    const page = homePageFromSections(sections, settings);
    const sortedIds = [...sections]
      .sort((a, b) => a.order - b.order)
      .map((s) => s.id)
      .filter(isHomeSection);
    expect(page.blocks.map((b) => (b as { id: string }).id)).toEqual(
      sortedIds.map((id) => `block_home_${id.replace(/-/g, '_')}`)
    );
    const hero = page.blocks[0] as { type: string; props: { headline: string } };
    expect(hero).toMatchObject({
      type: 'hero',
      props: { headline: 'Pictures of places about to change' },
    });
    const brands = page.blocks.find((b) => (b as { type: string }).type === 'logoWall') as {
      hidden?: boolean;
    };
    expect(brands.hidden).toBe(true);
  });

  it('renders as a page with exactly one h1', () => {
    const { sections, settings } = state();
    const html = renderToStaticMarkup(
      createElement(BlockList, {
        blocks: parsePage(homePageFromSections(sections, settings).blocks),
      })
    );
    expect(html.match(/<h1[\s>]/g)?.length).toBe(1);
  });
});
