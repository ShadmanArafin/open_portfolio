import { describe, expect, it } from 'vitest';
import { csvDate, parseCsv, readCsv, templateCsv } from '../csv';
import {
  artifactsCsv,
  brandsCsv,
  capabilitiesCsv,
  educationCsv,
  experienceCsv,
  projectsCsv,
  recommendationsCsv,
} from '../csv-templates';
import type {
  BrandItem,
  EducationItem,
  ExperienceItem,
  ProjectItem,
  RecommendationItem,
  VisualArtifactItem,
} from '@/cms/types/cms';

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
    for (const { template } of [
      experienceCsv,
      educationCsv,
      recommendationsCsv,
      projectsCsv,
      brandsCsv,
      capabilitiesCsv,
      artifactsCsv,
    ]) {
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
    const item = experienceCsv.apply(row, base, []);
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
    expect(recommendationsCsv.apply(row, base, []).featured).toBe(false);
  });

  it('accepts partial dates and rejects anything else', () => {
    expect(csvDate('2024')).toBe('2024-01-01');
    expect(csvDate('March 2024')).toBeUndefined();
  });

  it('imports raw LinkedIn recommendations export with first and last name aliases', () => {
    const base = {
      id: 'rec-1',
      name: '',
      role: '',
      company: '',
      quote: '',
      featured: true,
      sortOrder: 1,
      visible: true,
    } as RecommendationItem;

    const linkedInCsv =
      'First Name,Last Name,Company,Job Title,Text,Creation Date\n' +
      'Maya,Lin,Acme Labs,Design Director,"Maya is an extraordinary designer and collaborator.",2024-05-12';

    const { rows, problems } = readCsv(linkedInCsv, recommendationsCsv.template);
    expect(rows).toHaveLength(1);
    expect(problems).toContain('Ignored column not in the template: Creation Date.');

    const imported = recommendationsCsv.apply(rows[0], base, []);
    expect(imported).toMatchObject({
      name: 'Maya Lin',
      company: 'Acme Labs',
      role: 'Design Director',
      quote: 'Maya is an extraordinary designer and collaborator.',
      featured: true,
      visible: true,
    });
  });

  it('imports raw LinkedIn positions and education exports via column aliases', () => {
    const baseExp: ExperienceItem = {
      id: 'exp-1',
      period: '',
      type: 'Full-time',
      role: '',
      company: '',
      current: true,
      summary: '',
      highlights: [],
      sortOrder: 1,
      visible: true,
    };

    const linkedInPositions =
      'Company Name,Title,Started On,Finished On,Description\n' +
      'Vercel,Staff Engineer,2022-01,2024-06,Leading core framework development.';

    const { rows: expRows } = readCsv(linkedInPositions, experienceCsv.template);
    expect(expRows).toHaveLength(1);
    const expItem = experienceCsv.apply(expRows[0], baseExp, []);
    expect(expItem).toMatchObject({
      company: 'Vercel',
      role: 'Staff Engineer',
      startDate: '2022-01-01',
      endDate: '2024-06-01',
      summary: 'Leading core framework development.',
      current: false,
    });

    const baseEdu: EducationItem = {
      id: 'edu-1',
      number: '01',
      degree: '',
      institution: '',
      yearLabel: '',
      status: 'Graduated',
      isCurrent: false,
      sortOrder: 1,
      visible: true,
    };

    const linkedInEdu =
      'School Name,Degree Name,Start Date,End Date\n' +
      'Stanford University,B.S. Computer Science,,';

    const { rows: eduRows } = readCsv(linkedInEdu, educationCsv.template);
    expect(eduRows).toHaveLength(1);
    const eduItem = educationCsv.apply(eduRows[0], baseEdu, []);
    expect(eduItem).toMatchObject({
      institution: 'Stanford University',
      degree: 'B.S. Computer Science',
    });
  });
});

describe('the remaining screens', () => {
  it('gives each imported project its own address, made from its title', () => {
    const base = { slug: 'new-project', year: '2026', status: 'draft' } as ProjectItem;
    const taken = [{ slug: 'harbour-app' } as ProjectItem];
    const [row] = readCsv(
      'title,start_year,end_year,deliverables,published,live_url\nHarbour / App!,2023,2024,Research| UI ,yes,javascript:alert(1)',
      projectsCsv.template
    ).rows;
    expect(projectsCsv.apply(row, base, taken)).toMatchObject({
      slug: 'harbour-app-2',
      title: 'Harbour / App!',
      year: '2023 — 2024',
      deliverables: ['Research', 'UI'],
      status: 'published',
      liveUrl: '',
    });
  });

  it('keeps only https or the site’s own picture addresses', () => {
    const [ok, bad] = readCsv(
      'name,logo\nNorthwind,https://example.com/n.svg\nEvil,javascript:alert(1)',
      brandsCsv.template
    ).rows;
    expect(brandsCsv.apply(ok, { size: 'default' } as BrandItem, []).logo).toBe(
      'https://example.com/n.svg'
    );
    expect(brandsCsv.apply(bad, { size: 'default' } as BrandItem, []).logo).toBe('');
    const [art] = readCsv(
      'image,alt,category\n/api/media/a.png,A screen,MOBILE',
      artifactsCsv.template
    ).rows;
    expect(artifactsCsv.apply(art, { category: 'ui' } as VisualArtifactItem, [])).toMatchObject({
      src: '/api/media/a.png',
      category: 'mobile',
    });
  });
});
