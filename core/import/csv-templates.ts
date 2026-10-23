import type {
  BrandItem,
  CapabilityGroupItem,
  EducationItem,
  ExperienceItem,
  ProjectItem,
  RecommendationItem,
  VisualArtifactItem,
} from '@/cms/types/cms';
import { normaliseSlug } from '@/core/pages/schema';
import { formatYearRange } from '@/cms/utils/dates';
import { csvBoolean, csvDate, type CsvTemplate } from './csv';

/**
 * The fixed templates, one per screen that takes a spreadsheet, and how a row
 * of each becomes a record. `apply` starts from the screen's own new record,
 * so every field the file leaves out has the value Add would have given it,
 * and the screen's Save checks the result like any hand-made record.
 */

export interface CsvImporter<T> {
  template: CsvTemplate;
  /** `others` is every record already on the screen or made earlier in this import. */
  apply: (row: Record<string, string>, base: T, others: T[]) => T;
}

const EDUCATION_STATUSES: EducationItem['status'][] = [
  'In Progress',
  'Graduated',
  'Completed',
  'Paused',
];

export const experienceCsv: CsvImporter<ExperienceItem> = {
  template: {
    name: 'experience',
    columns: [
      { key: 'role', required: true, hint: 'Job title.', example: 'Product designer' },
      { key: 'company', required: true, hint: 'Who you worked for.', example: 'Harbour Studio' },
      { key: 'type', hint: 'Full-time, Part-time, Contract…', example: 'Full-time' },
      { key: 'start', hint: 'YYYY-MM or YYYY-MM-DD.', example: '2022-03' },
      { key: 'end', hint: 'Empty while the role is current.', example: '' },
      { key: 'summary', hint: 'One or two sentences.', example: 'Led design for the app.' },
      {
        key: 'highlights',
        hint: 'Separate several with a | character.',
        example: 'Shipped v2|Grew the team to five',
      },
      { key: 'company_url', hint: 'Optional link.', example: 'https://example.com' },
    ],
  },
  apply: (row, base) => {
    const endDate = csvDate(row.end);
    return {
      ...base,
      role: row.role,
      company: row.company,
      type: row.type || base.type,
      startDate: csvDate(row.start) ?? base.startDate,
      endDate,
      current: !endDate,
      summary: row.summary ?? base.summary,
      highlights: row.highlights
        ? row.highlights
            .split('|')
            .map((line) => line.trim())
            .filter(Boolean)
        : [],
      companyUrl: row.company_url || undefined,
    };
  },
};

export const educationCsv: CsvImporter<EducationItem> = {
  template: {
    name: 'education',
    columns: [
      { key: 'degree', required: true, hint: 'What you studied.', example: 'B.A. Design' },
      {
        key: 'institution',
        required: true,
        hint: 'Where you studied.',
        example: 'City University',
      },
      { key: 'years', hint: 'Shown as written.', example: '2016 — 2020' },
      {
        key: 'status',
        hint: EDUCATION_STATUSES.join(', ') + '.',
        example: 'Graduated',
      },
      { key: 'institution_url', hint: 'Optional link.', example: '' },
    ],
  },
  apply: (row, base) => {
    const status =
      EDUCATION_STATUSES.find((value) => value.toLowerCase() === row.status?.toLowerCase()) ??
      base.status;
    return {
      ...base,
      degree: row.degree,
      institution: row.institution,
      yearLabel: row.years || base.yearLabel,
      status,
      isCurrent: status === 'In Progress',
      institutionUrl: row.institution_url || undefined,
    };
  },
};

export const recommendationsCsv: CsvImporter<RecommendationItem> = {
  template: {
    name: 'recommendations',
    columns: [
      { key: 'name', required: true, hint: 'Who said it.', example: 'Sam Rivera' },
      {
        key: 'quote',
        required: true,
        hint: 'Their words.',
        example: 'A rare mix of craft and calm.',
      },
      { key: 'role', hint: 'Their job title.', example: 'Head of Product' },
      { key: 'company', hint: 'Where they work.', example: 'Harbour Studio' },
      { key: 'featured', hint: 'yes or no.', example: 'yes' },
    ],
  },
  apply: (row, base) => ({
    ...base,
    name: row.name,
    quote: row.quote,
    role: row.role ?? '',
    company: row.company ?? '',
    featured: csvBoolean(row.featured, base.featured),
  }),
};

/** Pipe-separated cells: `Research|Design|Handoff`. */
function list(cell: string | undefined): string[] {
  return (cell ?? '')
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);
}

/** A picture address a spreadsheet may carry: this site's own, or https. */
function imageAddress(cell: string | undefined): string {
  const value = (cell ?? '').trim();
  return /^https:\/\//i.test(value) || value.startsWith('/') ? value : '';
}

export const projectsCsv: CsvImporter<ProjectItem> = {
  template: {
    name: 'work',
    columns: [
      { key: 'title', required: true, hint: 'The project’s name.', example: 'Harbour booking app' },
      {
        key: 'slug',
        hint: 'Its address, /work/…; made from the title when empty.',
        example: 'harbour-booking',
      },
      { key: 'company', hint: 'Who it was for.', example: 'Harbour Studio' },
      { key: 'category', hint: 'Product, Branding, Web…', example: 'Product design' },
      { key: 'start_year', hint: 'YYYY.', example: '2023' },
      { key: 'end_year', hint: 'YYYY; empty while ongoing.', example: '2024' },
      {
        key: 'summary',
        hint: 'One line, shown on the card.',
        example: 'Booking in three taps instead of twelve.',
      },
      { key: 'role', hint: 'What you did.', example: 'Lead designer' },
      {
        key: 'deliverables',
        hint: 'Separate several with |.',
        example: 'Research|Interface|Design system',
      },
      { key: 'live_url', hint: 'Optional https link.', example: 'https://example.com' },
      { key: 'published', hint: 'yes to publish with the site; no keeps a draft.', example: 'no' },
    ],
  },
  apply: (row, base, others) => {
    // One segment: /work/<slug> has no room for a slash.
    const wanted = normaliseSlug(row.slug || row.title).replace(/\//g, '-') || base.slug;
    let slug = wanted;
    for (let n = 2; others.some((other) => other.slug === slug); n++) slug = `${wanted}-${n}`;
    const live = /^https?:\/\//i.test(row.live_url ?? '') ? row.live_url : '';
    const startYear = /^\d{4}$/.test(row.start_year ?? '') ? row.start_year : undefined;
    const endYear = startYear && /^\d{4}$/.test(row.end_year ?? '') ? row.end_year : undefined;
    return {
      ...base,
      slug,
      title: row.title,
      name: row.title,
      company: row.company ?? '',
      category: row.category ?? '',
      startYear,
      endYear,
      year: formatYearRange({ startYear, endYear, year: base.year }),
      shortDescription: row.summary || base.shortDescription,
      role: row.role ?? '',
      deliverables: list(row.deliverables),
      liveUrl: live,
      status: csvBoolean(row.published, false) ? 'published' : 'draft',
    };
  },
};

export const brandsCsv: CsvImporter<BrandItem> = {
  template: {
    name: 'brands',
    columns: [
      { key: 'name', required: true, hint: 'The client or company.', example: 'Northwind' },
      {
        key: 'logo',
        hint: 'An https address, or one from your media library (/api/media/…).',
        example: 'https://example.com/logo.svg',
      },
      { key: 'url', hint: 'Optional link to their site.', example: 'https://example.com' },
      { key: 'size', hint: 'small, default or wide.', example: 'default' },
    ],
  },
  apply: (row, base) => {
    const size = (['small', 'default', 'wide'] as const).find(
      (value) => value === row.size?.toLowerCase()
    );
    return {
      ...base,
      name: row.name,
      logo: imageAddress(row.logo),
      alt: `${row.name} logo`,
      url: /^https?:\/\//i.test(row.url ?? '') ? row.url : undefined,
      size: size ?? base.size,
    };
  },
};

export const capabilitiesCsv: CsvImporter<CapabilityGroupItem> = {
  template: {
    name: 'capabilities',
    columns: [
      { key: 'title', required: true, hint: 'The group’s name.', example: 'Research' },
      { key: 'description', hint: 'One sentence.', example: 'Finding out what people need.' },
      {
        key: 'capabilities',
        hint: 'Separate several with |.',
        example: 'Interviews|Usability tests|Synthesis',
      },
    ],
  },
  apply: (row, base) => ({
    ...base,
    title: row.title,
    description: row.description ?? '',
    capabilities: list(row.capabilities),
  }),
};

export const artifactsCsv: CsvImporter<VisualArtifactItem> = {
  template: {
    name: 'artifacts',
    columns: [
      {
        key: 'image',
        required: true,
        hint: 'An https address, or one from your media library (/api/media/…).',
        example: 'https://example.com/shot.png',
      },
      {
        key: 'alt',
        required: true,
        hint: 'What the picture shows.',
        example: 'Checkout screen, mobile',
      },
      { key: 'category', hint: 'ui, systems or mobile.', example: 'mobile' },
    ],
  },
  apply: (row, base) => {
    const category = (['ui', 'systems', 'mobile'] as const).find(
      (value) => value === row.category?.toLowerCase()
    );
    return {
      ...base,
      src: imageAddress(row.image),
      alt: row.alt,
      category: category ?? base.category,
    };
  },
};
