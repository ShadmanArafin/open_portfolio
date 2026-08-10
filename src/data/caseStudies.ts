export interface CaseStudyWireframe {
  id: string;
  title: string;
  description: string;
  gradient: string;
}

export interface CaseStudyDecision {
  number: string;
  title: string;
  rationale: string;
  impact: string;
}

export interface CaseStudy {
  id: string;
  slug: string;
  number: string;
  title: string;
  category: string;
  year: string;
  coverImage: string;
  coverGradient: string;
  shortChallenge: string;
  disciplines: string[];
  featured: boolean;
  role: string;
  timeline: string;
  platform: string;
  industry: string;
  overview: string[];
  challenge: string;
  userResearch: {
    title: string;
    summary: string;
    keyInsights: string[];
  };
  userFlows: {
    title: string;
    description: string;
    steps: string[];
  };
  wireframes: CaseStudyWireframe[];
  keyDecisions: CaseStudyDecision[];
  finalSolution: {
    description: string;
    highlights: string[];
  };
  designSystemTokens: {
    colors: { name: string; hex: string }[];
    typography: string;
    spacingScale: string;
  };
  outcome: {
    summary: string;
    metrics: string[];
  };
}

/**
 * Demo case studies.
 *
 * All fictional. The numbers below are illustrative placeholders — replace them
 * with your own before publishing, because invented metrics on a real portfolio
 * are worse than no metrics at all. Edit from /admin/case-studies.
 */
export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'cs-01',
    slug: 'simplifying-a-complex-workflow',
    number: '01',
    title: 'Simplifying a seven-step workflow into something people finish in one sitting',
    category: 'PRODUCT DESIGN / UX',
    year: '2025',
    coverImage: '/demo/shots/dashboard.svg',
    coverGradient: 'from-emerald-950 via-zinc-900 to-black',
    shortChallenge:
      'How might we remove friction from a long multi-step process without hiding the information people need to act confidently?',
    disciplines: ['Research', 'Product design', 'Interaction design'],
    featured: true,
    role: 'Lead Designer',
    timeline: '14 weeks',
    platform: 'Web & mobile',
    industry: 'Placeholder industry',
    overview: [
      'This is a placeholder case study so you can see the full layout before writing your own. Replace every part of it from the admin.',
      'A strong case study covers the situation, what you tried, what you rejected, and what actually happened. The rejected options are usually the most interesting part.',
    ],
    challenge:
      'Placeholder challenge. Describe the real constraint you were working against — the deadline, the legacy system, the disagreement, the thing that made this genuinely difficult.',
    userResearch: {
      title: 'Research & insights',
      summary:
        'Placeholder summary. Say how you learned about the problem: interviews, analytics, support tickets, or simply using the thing yourself.',
      keyInsights: [
        'Placeholder insight. Something you learned that changed your mind.',
        'Placeholder insight. Something that contradicted an assumption.',
        'Placeholder insight. Something small that turned out to matter.',
      ],
    },
    userFlows: {
      title: 'Restructuring the flow',
      description:
        'Placeholder description of how you reorganised the process, and what you moved where.',
      steps: [
        '01. First step of the new flow',
        '02. Second step',
        '03. Third step',
        '04. Confirmation and result',
      ],
    },
    wireframes: [
      {
        id: 'wf-1',
        title: 'Exploration 01 — Two structural options',
        description: 'Placeholder description of what you were comparing and why.',
        gradient: 'from-zinc-900 via-stone-900 to-neutral-950',
      },
      {
        id: 'wf-2',
        title: 'Exploration 02 — Density and hierarchy',
        description: 'Placeholder description of the second exploration.',
        gradient: 'from-emerald-950/60 via-zinc-900 to-black',
      },
    ],
    keyDecisions: [
      {
        number: '01',
        title: 'Progressive disclosure instead of stacked dialogs',
        rationale:
          'Placeholder rationale. Explain the reasoning, including what you gave up by choosing this.',
        impact: 'Placeholder impact — what measurably changed.',
      },
      {
        number: '02',
        title: 'Non-blocking alerts for high-risk steps',
        rationale: 'Placeholder rationale for the second decision.',
        impact: 'Placeholder impact.',
      },
    ],
    finalSolution: {
      description: 'Placeholder description of what you ended up shipping and how it feels to use.',
      highlights: [
        'Placeholder highlight of the final solution.',
        'Placeholder highlight — something you are genuinely pleased with.',
        'Placeholder highlight — an accessibility or performance win.',
      ],
    },
    designSystemTokens: {
      colors: [
        { name: 'Background', hex: '#0D0F0F' },
        { name: 'Surface', hex: '#181A1A' },
        { name: 'Accent', hex: '#35F2B3' },
        { name: 'Border', hex: '#1B1B1B' },
      ],
      typography: 'Placeholder — the typefaces and weights you used',
      spacingScale: '4pt grid (16, 24, 32, 48, 64, 80)',
    },
    outcome: {
      summary:
        'Placeholder outcome. If you have real numbers, use them here; if you do not, describe the change qualitatively rather than inventing figures.',
      metrics: [
        '58% reduction in time to complete the task',
        '0.2% error rate, down from 14%',
        '94% positive rating from the people who use it daily',
      ],
    },
  },
  {
    id: 'cs-02',
    slug: 'rethinking-onboarding',
    number: '02',
    title: 'Rethinking onboarding so people reach value before they commit',
    category: 'SAAS UX / PRODUCT ARCHITECTURE',
    year: '2024',
    coverImage: '/demo/shots/mobile.svg',
    coverGradient: 'from-zinc-900 via-stone-900 to-neutral-950',
    shortChallenge:
      'How might we turn a long configuration wizard into something that shows value in the first minute?',
    disciplines: ['Product strategy', 'UX architecture', 'Design system'],
    featured: true,
    role: 'Product Designer',
    timeline: '12 weeks',
    platform: 'Web app',
    industry: 'Placeholder industry',
    overview: [
      'A second placeholder case study. Replace it with your own, or delete it entirely from the admin.',
      'You do not need many case studies. Two or three strong ones beat eight thin ones.',
    ],
    challenge:
      'Placeholder challenge. A long setup process before anyone sees anything useful is one of the most common product problems there is.',
    userResearch: {
      title: 'Drop-off analysis',
      summary: 'Placeholder summary of how you investigated where people were giving up.',
      keyInsights: [
        'Placeholder insight about where people abandoned the flow.',
        'Placeholder insight about what they expected instead.',
        'Placeholder insight about who was affected most.',
      ],
    },
    userFlows: {
      title: 'A shorter path to the first useful moment',
      description: 'Placeholder description of the restructured onboarding.',
      steps: [
        '01. Ask only what is genuinely required',
        '02. Show a real, populated result immediately',
        '03. Offer deeper configuration later, in context',
      ],
    },
    wireframes: [
      {
        id: 'wf-3',
        title: 'Exploration 01 — Guided versus self-directed',
        description: 'Placeholder description of the comparison.',
        gradient: 'from-slate-900 via-zinc-900 to-black',
      },
    ],
    keyDecisions: [
      {
        number: '01',
        title: 'Defer configuration instead of front-loading it',
        rationale: 'Placeholder rationale.',
        impact: 'Placeholder impact.',
      },
    ],
    finalSolution: {
      description: 'Placeholder description of the shipped onboarding experience.',
      highlights: ['Placeholder highlight.', 'Placeholder highlight.'],
    },
    designSystemTokens: {
      colors: [
        { name: 'Background', hex: '#0D0F0F' },
        { name: 'Accent', hex: '#35F2B3' },
      ],
      typography: 'Placeholder typography note',
      spacingScale: '4pt grid',
    },
    outcome: {
      summary: 'Placeholder outcome for the second case study.',
      metrics: ['42% fewer people abandoning setup', '3x faster time to first result'],
    },
  },
  {
    id: 'cs-03',
    slug: 'building-a-design-system',
    number: '03',
    title: 'Building a design system three teams would actually adopt',
    category: 'DESIGN SYSTEMS',
    year: '2024',
    coverImage: '/demo/shots/grid.svg',
    coverGradient: 'from-slate-950 via-zinc-900 to-black',
    shortChallenge:
      'How might we build shared components that teams choose to use rather than route around?',
    disciplines: ['Design systems', 'Documentation', 'Accessibility'],
    featured: false,
    role: 'Design Systems Lead',
    timeline: '20 weeks',
    platform: 'Web',
    industry: 'Placeholder industry',
    overview: [
      'A third placeholder case study, marked as not featured so you can see how that looks.',
      'Replace or delete from /admin/case-studies.',
    ],
    challenge:
      'Placeholder challenge. Adoption, not construction, is the hard part of any design system.',
    userResearch: {
      title: 'Talking to the people who would use it',
      summary: 'Placeholder summary.',
      keyInsights: [
        'Placeholder insight about why the previous attempt was ignored.',
        'Placeholder insight about what teams actually needed.',
      ],
    },
    userFlows: {
      title: 'Contribution model',
      description: 'Placeholder description of how teams could add to the system.',
      steps: ['01. Propose', '02. Review', '03. Publish', '04. Document'],
    },
    wireframes: [],
    keyDecisions: [
      {
        number: '01',
        title: 'Ship documentation alongside every component',
        rationale: 'Placeholder rationale.',
        impact: 'Placeholder impact.',
      },
    ],
    finalSolution: {
      description: 'Placeholder description.',
      highlights: ['Placeholder highlight.', 'Placeholder highlight.'],
    },
    designSystemTokens: {
      colors: [{ name: 'Accent', hex: '#35F2B3' }],
      typography: 'Placeholder typography note',
      spacingScale: '4pt grid',
    },
    outcome: {
      summary: 'Placeholder outcome.',
      metrics: ['3 teams adopted it within a quarter'],
    },
  },
];
