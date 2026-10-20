'use client';

import { formatYearRange } from '@/cms/utils/dates';
import { normaliseSlug } from '@/core/pages/schema';
import type { CaseStudyItem, MediaItem } from '@/cms/types/cms';
import { updateCaseStudiesAction } from '../_actions/collections';
import { CollectionEditor } from '../_components/collection-editor';
import { CheckField, Field, SelectField } from '../_components/form-fields';
import { newId } from '../_components/ids';
import { ImageField } from '../_components/image-field';

const secondary =
  'rounded-full border border-border px-3 text-sm text-text-secondary hover:text-text-primary disabled:opacity-50';

/**
 * Case studies and design stories.
 *
 * The same shell as Selected work — the legacy admin rebuilt this list a
 * second time, which is how two sibling screens ended up with different
 * margins and different delete flows. What is specific to a story stays here:
 * the cover image, the status, and the key decisions, each with a title, the
 * reasoning, and the measured impact.
 *
 * The deeper story fields (research, flows, wireframes, final solution) are
 * not editable in this port, exactly as the legacy screen left them — they
 * carry the seed content, and a new story starts from the same placeholders
 * the old screen wrote. What did change: the web address is editable and the
 * story can be marked featured, which the testimonial-style blocks read.
 */

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft — only you can see it' },
  { value: 'published', label: 'Published — anyone can see it' },
  { value: 'archived', label: 'Archived — hidden, but kept' },
];

function uniqueSlug(base: string, items: CaseStudyItem[]): string {
  let slug = base;
  for (let n = 2; items.some((item) => item.slug === slug); n++) {
    slug = `${base}-${n}`;
  }
  return slug;
}

function createCaseStudy(items: CaseStudyItem[]): CaseStudyItem {
  return {
    id: newId('cs'),
    slug: uniqueSlug('case-study', items),
    number: String(items.length + 1).padStart(2, '0'),
    title: 'New Case Study Title',
    category: '',
    year: String(new Date().getFullYear()),
    // Empty, not Apex's screenshot.
    coverImage: '',
    shortChallenge:
      'Exploring complex user problems and turning them into intuitive design systems.',
    disciplines: [],
    featured: true,
    role: '',
    timeline: '8 Weeks',
    platform: 'Web & Mobile App',
    industry: 'Enterprise SaaS',
    overview: [
      'Detailed case study overview paragraph 1.',
      'Detailed case study overview paragraph 2.',
    ],
    challenge: 'The primary challenge was streamlining complex workflows for high-volume users.',
    userResearch: {
      title: 'User Insights & Pain Points',
      summary: 'Conducted user interviews with core stakeholders to identify friction points.',
      keyInsights: ['Users struggled with multi-step navigation', 'High drop-off on checkout flow'],
    },
    userFlows: {
      title: 'Optimized Workflow Architecture',
      description: 'Simplified 7-step process down to 3 clear actions.',
      steps: ['Discovery', 'Configuration', 'Checkout'],
    },
    wireframes: [
      {
        id: newId('w'),
        title: 'Early exploration',
        description: 'What you were working out at this stage.',
        gradient: 'from-accent/20 to-surface-secondary',
        image: '',
      },
    ],
    keyDecisions: [
      {
        number: '01',
        title: 'Single-Page Checkout Flow',
        rationale: 'Reduced friction during high-intent purchasing.',
        impact: '+24% Conversion',
      },
      {
        number: '02',
        title: 'Contextual Side Drawer Navigation',
        rationale: 'Maintained screen context while exploring product details.',
        impact: '-30% Support Tickets',
      },
    ],
    finalSolution: {
      title: 'High-Fidelity Interface System',
      description: '',
      highlights: ['Accessible WCAG contrast compliance', 'Dark and light mode system tokens'],
    },
    designSystemTokens: {
      colors: [],
      typography: '',
      spacingScale: '',
    },
    outcome: {
      summary: '',
      metrics: [],
    },
    outcomes: [],
    sortOrder: 0,
    status: 'draft',
  };
}

function duplicateCaseStudy(item: CaseStudyItem, items: CaseStudyItem[]): CaseStudyItem {
  return {
    ...structuredClone(item),
    id: newId('cs'),
    slug: uniqueSlug(`${item.slug}-copy`, items),
    title: `${item.title} (Copy)`,
    status: 'draft',
    sortOrder: 0,
  };
}

export function CaseStudiesBuilder({
  initialCaseStudies,
  token,
}: {
  initialCaseStudies: CaseStudyItem[];
  token?: string;
}) {
  return (
    <CollectionEditor<CaseStudyItem>
      token={token}
      initialItems={initialCaseStudies}
      addLabel="Add case study"
      emptyTitle="No case studies yet."
      emptyHint="A story becomes a page at /work/…, and blocks can list them automatically."
      deleteLabel="Delete case study"
      deleteWarning="The story leaves your draft, wherever it was shown. This cannot be undone without restoring a version."
      title={(study) => study.title}
      summary={(study) =>
        [study.category, formatYearRange(study)].filter(Boolean).join(' • ') || 'No details yet'
      }
      badge={(study) => ({
        label:
          study.status === 'published'
            ? 'Live'
            : study.status === 'archived'
              ? 'Archived'
              : 'Draft',
        live: study.status === 'published',
      })}
      create={createCaseStudy}
      duplicate={duplicateCaseStudy}
      save={async (caseStudies, token) => {
        const result = await updateCaseStudiesAction(caseStudies, token);
        return {
          ok: result.ok,
          error: result.error,
          conflict: result.conflict,
          token: result.token,
          items: result.caseStudies,
        };
      }}
      renderFields={(study, mutate, items) => {
        const others = items.filter((other) => other.id !== study.id).map((other) => other.slug);
        const slugProblem =
          study.slug.length === 0
            ? 'Every case study needs a web address.'
            : others.includes(study.slug)
              ? 'Another case study already uses that address.'
              : null;

        const uploadCover = (media: MediaItem) =>
          mutate((current) => ({ ...current, coverImage: media.url }));

        const setDecision = (
          index: number,
          patch: Partial<CaseStudyItem['keyDecisions'][number]>
        ) =>
          mutate((current) => ({
            ...current,
            keyDecisions: current.keyDecisions.map((decision, i) =>
              i === index ? { ...decision, ...patch } : decision
            ),
          }));

        const addDecision = () =>
          mutate((current) => ({
            ...current,
            keyDecisions: [
              ...current.keyDecisions,
              {
                number: String(current.keyDecisions.length + 1).padStart(2, '0'),
                title: 'New Design Decision',
                rationale: 'Why this decision was made.',
                impact: 'Measurable user impact.',
              },
            ],
          }));

        const removeDecision = (index: number) =>
          mutate((current) => ({
            ...current,
            keyDecisions: current.keyDecisions.filter((_, i) => i !== index),
          }));

        return (
          <>
            <ImageField
              label="Cover image"
              src={study.coverImage ?? ''}
              alt={`${study.title} cover`}
              uploadAlt={`${study.title || 'Case study'} cover image`}
              onUploaded={uploadCover}
              onRemove={() => mutate((current) => ({ ...current, coverImage: '' }))}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Case study title"
                value={study.title}
                onChange={(value) => mutate((current) => ({ ...current, title: value }))}
              />
              <Field
                label="Category / architecture"
                value={study.category}
                onChange={(value) => mutate((current) => ({ ...current, category: value }))}
              />
              <Field
                label="Role title"
                value={study.role}
                onChange={(value) => mutate((current) => ({ ...current, role: value }))}
              />
              <Field
                label="Timeline / duration"
                value={study.timeline}
                onChange={(value) => mutate((current) => ({ ...current, timeline: value }))}
              />
              <SelectField
                label="Status"
                value={study.status}
                options={STATUS_OPTIONS}
                onChange={(value) =>
                  mutate((current) => ({
                    ...current,
                    status: value as CaseStudyItem['status'],
                  }))
                }
              />
            </div>

            <Field
              label="Web address"
              value={study.slug}
              onChange={(value) =>
                mutate((current) => ({ ...current, slug: normaliseSlug(value) }))
              }
              hint={`This case study will be at /work/${study.slug}`}
              problem={slugProblem}
            />

            <Field
              label="Short challenge summary"
              value={study.shortChallenge}
              onChange={(value) => mutate((current) => ({ ...current, shortChallenge: value }))}
              rows={3}
            />

            <CheckField
              label="Featured"
              description="Shown by blocks that only display featured work."
              checked={study.featured}
              onChange={(checked) => mutate((current) => ({ ...current, featured: checked }))}
            />

            <section aria-label="Key design decisions" className="grid gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="m-0 text-base">Key design decisions</h3>
                <button
                  type="button"
                  onClick={addDecision}
                  className={secondary}
                  style={{ minHeight: 44 }}
                >
                  Add decision
                </button>
              </div>

              {study.keyDecisions.length === 0 ? (
                <p className="m-0 text-sm text-text-secondary">No decisions yet.</p>
              ) : (
                study.keyDecisions.map((decision, index) => (
                  <div
                    key={`${study.id}-decision-${index}`}
                    className="grid gap-3 rounded-xl border border-border p-3"
                  >
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Field
                        label="Number"
                        value={decision.number}
                        onChange={(value) => setDecision(index, { number: value })}
                      />
                      <Field
                        label="Decision title"
                        value={decision.title}
                        onChange={(value) => setDecision(index, { title: value })}
                      />
                      <Field
                        label="Impact"
                        value={decision.impact}
                        placeholder="e.g. +24% conversion"
                        onChange={(value) => setDecision(index, { impact: value })}
                      />
                    </div>
                    <Field
                      label="Rationale"
                      value={decision.rationale}
                      onChange={(value) => setDecision(index, { rationale: value })}
                      rows={2}
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeDecision(index)}
                        className={secondary}
                        style={{ minHeight: 44 }}
                      >
                        Remove decision
                      </button>
                    </div>
                  </div>
                ))
              )}
            </section>
          </>
        );
      }}
    />
  );
}
