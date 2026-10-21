import type { EducationItem, ExperienceItem, RecommendationItem } from '@/cms/types/cms';
import { csvBoolean, csvDate, type CsvTemplate } from './csv';

/**
 * The fixed templates, one per screen that takes a spreadsheet, and how a row
 * of each becomes a record. `apply` starts from the screen's own new record,
 * so every field the file leaves out has the value Add would have given it,
 * and the screen's Save checks the result like any hand-made record.
 */

export interface CsvImporter<T> {
  template: CsvTemplate;
  apply: (row: Record<string, string>, base: T) => T;
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
