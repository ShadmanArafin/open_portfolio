import { describe, expect, it } from 'vitest';
import type { CaseStudyItem } from '@/cms/types/cms';
import { caseStudyToProject, mergeWork } from '@/core/content/read';
import { hasStory, isCaseStudy } from '@/core/content/work';
import nextConfig from '../../../next.config';

describe('work merge and case-study adaptation', () => {
  const sampleCaseStudy: CaseStudyItem = {
    id: 'cs-sample',
    slug: 'sample-case-study',
    number: '01',
    title: 'Sample Case Study Title',
    category: 'Design Systems',
    year: '2025',
    startYear: '2024',
    endYear: '2025',
    coverImage: '/demo/sample.png',
    coverGradient: 'from-zinc-900 to-black',
    shortChallenge: 'Solving complex navigation challenges across devices.',
    disciplines: ['Research', 'Design'],
    featured: true,
    role: 'Staff Product Designer',
    timeline: '12 weeks',
    platform: 'Web & iOS',
    industry: 'Enterprise Software',
    overview: ['First paragraph of the overview.', 'Second paragraph.'],
    challenge: 'A difficult architectural problem.',
    userResearch: {
      title: 'User Insights',
      summary: 'Interviews with 20 users.',
      keyInsights: ['Insight A', 'Insight B'],
    },
    userFlows: {
      title: 'Simplified Flow',
      description: 'Streamlined checkout steps.',
      steps: ['Step 1', 'Step 2'],
    },
    wireframes: [
      {
        id: 'wf-1',
        title: 'Exploration 1',
        description: 'Comparison of 2 architectures',
        gradient: 'from-blue-900 to-black',
      },
    ],
    keyDecisions: [
      {
        number: '01',
        title: 'Modal vs Drawer',
        rationale: 'Drawers preserve context',
        impact: '+15% task completion',
      },
    ],
    finalSolution: {
      title: 'Final Implementation',
      description: 'The polished interface system.',
      highlights: ['WCAG AA compliance'],
    },
    designSystemTokens: {
      colors: [{ name: 'Brand', hex: '#0055ff' }],
      typography: 'Inter',
      spacingScale: '8px',
    },
    outcome: {
      summary: 'Delivered on time with measurable impact.',
      metrics: ['+25% conversion'],
    },
    outcomes: [{ metric: '+25%', label: 'conversion' }],
    blocks: [
      {
        id: 'story-b1',
        type: 'text',
        content: { title: 'Heading', text: 'Body paragraph' },
        order: 1,
      },
    ],
    sortOrder: 5,
    status: 'published',
    seoTitle: 'Custom SEO Title',
    seoDescription: 'Custom SEO Description',
  };

  it('losslessly maps a CaseStudyItem into a ProjectItem with story blocks', () => {
    const project = caseStudyToProject(sampleCaseStudy);

    expect(project.id).toBe('cs-sample');
    expect(project.slug).toBe('sample-case-study');
    expect(project.title).toBe('Sample Case Study Title');
    expect(project.role).toBe('Staff Product Designer');
    expect(project.category).toBe('Design Systems');
    expect(project.year).toBe('2025');
    expect(project.startYear).toBe('2024');
    expect(project.endYear).toBe('2025');
    expect(project.shortDescription).toBe('Solving complex navigation challenges across devices.');
    expect(project.deliverables).toEqual(['Research', 'Design']);
    expect(project.status).toBe('published');
    expect(project.featured).toBe(true);
    expect(project.images[0]).toEqual({
      id: 'cs-sample-cover',
      label: '01 / COVER',
      alt: 'Sample Case Study Title',
      url: '/demo/sample.png',
    });
    expect(project.approachSteps[0]).toEqual({
      title: 'Modal vs Drawer',
      description: 'Drawers preserve context (+15% task completion)',
    });
    expect(project.outcomeNote).toBe('Delivered on time with measurable impact.');
    expect(project.seoTitle).toBe('Custom SEO Title');
    expect(project.seoDescription).toBe('Custom SEO Description');

    // Story blocks are preserved on the project
    expect(project.story).toBeDefined();
    expect(project.story?.blocks).toHaveLength(1);
    expect(project.story?.blocks[0]).toMatchObject({
      id: 'story-b1',
      type: 'text',
    });
  });

  it('marks an adapted case study so views can tell it from ordinary work', () => {
    const adapted = caseStudyToProject(sampleCaseStudy);
    expect(adapted.origin).toBe('case-study');
    expect(isCaseStudy(adapted)).toBe(true);
    expect(hasStory(adapted)).toBe(true);
  });

  it('still calls a legacy case study a case study when it carries no story', () => {
    // A snapshot written before the merge has no story blocks, so `story` alone
    // cannot answer the question the case-study views ask.
    const adapted = caseStudyToProject({ ...sampleCaseStudy, blocks: [] });
    expect(hasStory(adapted)).toBe(false);
    expect(isCaseStudy(adapted)).toBe(true);
  });

  it('counts work that carries a story even without the legacy marker', () => {
    const adapted = caseStudyToProject(sampleCaseStudy);
    const { origin: _origin, ...withoutMarker } = adapted;
    expect(isCaseStudy(withoutMarker)).toBe(true);
  });

  it('folds legacy case studies in without duplicating ones already migrated', () => {
    const migrated = caseStudyToProject(sampleCaseStudy);
    const other = { ...sampleCaseStudy, id: 'cs-other', slug: 'another-study' };

    const merged = mergeWork([migrated], [sampleCaseStudy, other]);

    // The migrated one is already in `projects`; only the new one is added.
    expect(merged.map((p) => p.slug)).toEqual(['sample-case-study', 'another-study']);
  });

  it('is idempotent, so folding at several boundaries cannot duplicate work', () => {
    const once = mergeWork([], [sampleCaseStudy]);
    const twice = mergeWork(once, [sampleCaseStudy]);
    expect(twice.map((p) => p.slug)).toEqual(['sample-case-study']);
  });

  it('configures 301 permanent redirects for /case-studies and /case-studies/:slug', async () => {
    expect(nextConfig.redirects).toBeDefined();
    const redirects = await nextConfig.redirects!();

    const caseStudiesRoot = redirects.find((r) => r.source === '/case-studies');
    expect(caseStudiesRoot).toBeDefined();
    expect(caseStudiesRoot?.destination).toBe('/work');
    expect(caseStudiesRoot?.permanent).toBe(true);

    const caseStudiesSlug = redirects.find((r) => r.source === '/case-studies/:slug');
    expect(caseStudiesSlug).toBeDefined();
    expect(caseStudiesSlug?.destination).toBe('/work/:slug');
    expect(caseStudiesSlug?.permanent).toBe(true);
  });
});
