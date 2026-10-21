import { describe, expect, it } from 'vitest';
import { csvDate, parseCsv, readCsv, templateCsv } from '../csv';
import { educationCsv, experienceCsv, recommendationsCsv } from '../csv-templates';
import type { ExperienceItem, RecommendationItem } from '@/cms/types/cms';

describe('parseCsv', () => {
  it('reads quotes, doubled quotes, commas and newlines inside quotes, CRLF and a BOM', () => {
    const text = '\uFEFFname,quote\r\n"Rivera, Sam","She said ""yes""\nand meant it"\r\n\r\n';
    expect(parseCsv(text)).toEqual([
      ['name', 'quote'],
      ['Rivera, Sam', 'She said "yes"\nand meant it'],
    ]);
  });

  it('recognises the semicolon files European Excel writes', () => {
    expect(parseCsv('name;quote\nSam;Hi, there')).toEqual([
      ['name', 'quote'],
      ['Sam', 'Hi, there'],
    ]);
  });
});

describe('readCsv', () => {
  it('matches columns by name in any order and case, and names the ones it ignored', () => {
    const { rows, problems } = readCsv(
      'Quote,NAME,Mood\n"Great work",Sam,happy',
      recommendationsCsv.template
    );
    expect(rows).toEqual([{ quote: 'Great work', name: 'Sam' }]);
    expect(problems).toEqual(['Ignored column not in the template: Mood.']);
  });

  it('skips a row missing a required value, with its line number', () => {
    const { rows, problems } = readCsv('name,quote\nSam,Hi\n,Orphan', recommendationsCsv.template);
    expect(rows).toHaveLength(1);
    expect(problems).toEqual(['Line 3 skipped: “name” is empty.']);
  });

  it('refuses a file without a required column', () => {
    const { rows, problems } = readCsv('name\nSam', recommendationsCsv.template);
    expect(rows).toEqual([]);
    expect(problems[0]).toContain('“quote”');
  });

  it('round-trips its own template', () => {
    for (const { template } of [experienceCsv, educationCsv, recommendationsCsv]) {
      const { rows, problems } = readCsv(templateCsv(template), template);
      expect(problems).toEqual([]);
      expect(rows).toHaveLength(1);
    }
  });
});

describe('templates', () => {
  it('turns a role row into a record, current while it has no end', () => {
    const base: ExperienceItem = {
      id: 'exp-1',
      period: '',
      type: 'Full-time',
      role: '',
      company: '',
      current: true,
      summary: '',
      highlights: [],
      sortOrder: 3,
      visible: true,
    };
    const [row] = readCsv(
      'role,company,start,end,highlights\nDesigner,Harbour,2021-3,2023,Shipped v2| Grew team ',
      experienceCsv.template
    ).rows;
    const item = experienceCsv.apply(row, base);
    expect(item).toMatchObject({
      id: 'exp-1',
      role: 'Designer',
      startDate: '2021-03-01',
      endDate: '2023-01-01',
      current: false,
      highlights: ['Shipped v2', 'Grew team'],
      sortOrder: 3,
    });
  });

  it('reads yes and no as people type them', () => {
    const base = { featured: true } as RecommendationItem;
    const [row] = readCsv('name,quote,featured\nSam,Hi,No', recommendationsCsv.template).rows;
    expect(recommendationsCsv.apply(row, base).featured).toBe(false);
  });

  it('accepts partial dates and rejects anything else', () => {
    expect(csvDate('2024')).toBe('2024-01-01');
    expect(csvDate('March 2024')).toBeUndefined();
  });
});
