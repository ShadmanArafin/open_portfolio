import type { SectionConfig, SiteSettings } from '@/cms/types/cms';
import { createHomePage, type PageRecord } from './schema';

/**
 * The theme's home page, rebuilt from blocks.
 *
 * A site starts with the theme's fixed home layout — hero, logos, work,
 * experience, about and the rest — edited on the Homepage screen. Building a
 * home page from blocks used to start from nothing, so taking the step meant
 * losing every headline and button the owner had already written, and the
 * site carried two front doors in the meantime. This makes the block version
 * of what is there now: same sections in the same order, same words, hidden
 * ones still hidden, each as the block that shows the same records.
 *
 * Sections without an equivalent block are left out rather than guessed at.
 * Nothing is published by it: the page arrives as a draft like any new page.
 */

type Block = { id: string; type: string; v: 1; props: Record<string, unknown>; hidden?: boolean };

const link = (label?: string, href?: string) =>
  label?.trim() && href?.trim() ? [{ label: label.trim(), href: href.trim() }] : [];

function blockFor(section: SectionConfig, settings: SiteSettings | undefined) {
  const heading = section.heading?.trim() || undefined;
  const description = section.description?.trim() || undefined;
  const primary = link(section.primaryCtaLabel, section.primaryCtaUrl);
  const secondary = link(section.secondaryCtaLabel, section.secondaryCtaUrl);

  switch (section.id) {
    case 'hero':
      return {
        type: 'hero',
        props: {
          headline: heading || settings?.fullName || 'Welcome',
          ...(description ? { subhead: description } : {}),
          ...(primary.length + secondary.length > 0 ? { cta: [...primary, ...secondary] } : {}),
        },
      };
    case 'brands':
      return { type: 'logoWall', props: { ...(heading ? { heading } : {}) } };
    case 'work':
      return { type: 'collection', props: { source: 'projects', limit: 6, heading } };
    case 'case-studies':
      return { type: 'collection', props: { source: 'caseStudies', heading } };
    case 'experience':
      return { type: 'timeline', props: { kind: 'work', heading } };
    case 'about': {
      // The About band's words live in settings when they have been edited.
      const paragraphs = settings?.aboutStoryParagraphs?.length
        ? settings.aboutStoryParagraphs
        : description
          ? [description]
          : [];
      return {
        type: 'split',
        props: {
          heading: settings?.aboutHeading?.trim() || heading,
          paragraphs,
          media: { src: settings?.portraitPath ?? '', alt: settings?.fullName ?? '' },
          ...(primary.length ? { cta: primary } : {}),
        },
      };
    }
    case 'process':
      return { type: 'steps', props: { heading } };
    case 'capabilities':
      return { type: 'skills', props: { heading } };
    case 'recommendations':
      return { type: 'testimonials', props: { heading, limit: 3 } };
    case 'contact':
      return {
        type: 'ctaBanner',
        props: {
          headline: heading || 'Get in touch',
          ...(description ? { description } : {}),
          cta: primary.length ? primary : [{ label: 'Get in touch', href: '/contact' }],
        },
      };
    default:
      return null;
  }
}

/** Drops `undefined` so stored props stay what the schema expects. */
function clean(props: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(props).filter(([, value]) => value !== undefined));
}

export function homePageFromSections(
  sections: SectionConfig[] | undefined,
  settings: SiteSettings | undefined
): PageRecord {
  const page = createHomePage();
  const blocks: Block[] = [];
  for (const section of [...(sections ?? [])].sort((a, b) => a.order - b.order)) {
    const made = blockFor(section, settings);
    if (!made) continue;
    blocks.push({
      id: `block_home_${section.id.replace(/[^a-z0-9]+/gi, '_')}`,
      type: made.type,
      v: 1,
      props: clean(made.props),
      ...(section.visible === false ? { hidden: true } : {}),
    });
  }
  return { ...page, blocks };
}
