export interface ProjectImage {
  id: string;
  alt: string;
  placeholderGradient: string;
  label: string;
  url?: string;
}

export interface Project {
  id: string;
  slug: string;
  number: string;
  name: string;
  title: string;
  company: string;
  category: string;
  year: string;
  role: string;
  deliverables: string[];
  shortDescription: string;
  description: string[];
  heroHeadline: string;
  industry: string;
  timeline: string;
  platform: string;
  featured: boolean;
  visualPlaceholder: string;
  images: ProjectImage[];
  overview: string[];
  challenge: string;
  approachSteps: { title: string; description: string }[];
  keyScreensCount: number;
  outcomeNote: string;
  siteUrl?: string;
  liveUrl?: string;
  companyUrl?: string;
}

/**
 * Demo projects.
 *
 * Every company here is fictional and every image is a CC0 placeholder — see
 * public/demo/LICENSE.md. Add your own from /admin/projects; you can delete all
 * of these in one action from the dashboard.
 */
export const PROJECTS: Project[] = [
  {
    id: 'project-northwind',
    slug: 'northwind-commerce',
    number: '01',
    name: 'Northwind',
    title: 'Northwind — Commerce Platform & Admin Suite',
    company: 'Northwind',
    category: 'Commerce / Platform',
    year: '2024 — 2025',
    role: 'Product Designer',
    deliverables: ['Product design', 'Design system', 'Responsive web', 'Handoff'],
    shortDescription:
      'A responsive storefront and internal admin suite, rebuilt around a shared component library.',
    description: [
      'This is placeholder text so you can see how a project page is laid out. Replace it with your own from the admin.',
      'A good project entry says what the thing was, what you did on it, and what changed as a result. Two or three sentences each.',
    ],
    heroHeadline: 'Turning a sprawling internal tool into something the team could actually use.',
    industry: 'Retail',
    timeline: '12 weeks',
    platform: 'Web & mobile',
    featured: true,
    siteUrl: 'https://example.com',
    liveUrl: 'https://example.com',
    companyUrl: 'https://example.com',
    visualPlaceholder: 'from-emerald-900/40 via-neutral-900 to-black',
    images: [
      {
        id: 'p1-img-1',
        alt: 'Abstract dashboard interface mockup',
        placeholderGradient: 'from-emerald-950 via-zinc-900 to-black',
        label: '01 / Overview',
        url: '/demo/shots/dashboard.svg',
      },
      {
        id: 'p1-img-2',
        alt: 'Abstract image grid mockup',
        placeholderGradient: 'from-zinc-900 via-stone-900 to-neutral-950',
        label: '02 / Catalogue',
        url: '/demo/shots/grid.svg',
      },
      {
        id: 'p1-img-3',
        alt: 'Abstract mobile app screens mockup',
        placeholderGradient: 'from-emerald-900/50 via-neutral-900 to-black',
        label: '03 / Mobile',
        url: '/demo/shots/mobile.svg',
      },
      {
        id: 'p1-img-4',
        alt: 'Abstract editorial layout mockup',
        placeholderGradient: 'from-stone-900 via-zinc-900 to-black',
        label: '04 / Editorial',
        url: '/demo/shots/editorial.svg',
      },
    ],
    overview: [
      'Placeholder overview. Describe the product, the team and your role in a way someone outside your industry could follow.',
      'Avoid listing tools here — the work itself is more interesting than the software it was made in.',
    ],
    challenge:
      'Placeholder challenge. What made this hard? Constraints, conflicting requirements and dead ends are usually the most interesting part of any project.',
    approachSteps: [
      {
        title: 'Understand.',
        description: 'What you did to learn the problem before proposing anything.',
      },
      {
        title: 'Structure.',
        description: 'How you organised the information, the flows or the architecture.',
      },
      { title: 'Design.', description: 'What you actually made, and the decisions behind it.' },
      { title: 'Ship.', description: 'How it got built, and what you handed over.' },
    ],
    keyScreensCount: 4,
    outcomeNote: 'Placeholder outcome — say what changed once this shipped.',
  },
  {
    id: 'project-contoso',
    slug: 'contoso-builder',
    number: '02',
    name: 'Contoso',
    title: 'Contoso — No-Code Store Builder',
    company: 'Contoso',
    category: 'SaaS / Builder',
    year: '2024',
    role: 'Product Designer',
    deliverables: ['Product design', 'User flows', 'Design system', 'Prototyping'],
    shortDescription:
      'An onboarding and store-configuration flow for people who have never built a website before.',
    description: [
      'Placeholder text. Replace with a short description of what this project was.',
      'One or two sentences is plenty here — the detail belongs further down the page.',
    ],
    heroHeadline: 'Making a genuinely complex setup feel like answering four questions.',
    industry: 'SaaS',
    timeline: '16 weeks',
    platform: 'Web app',
    featured: true,
    siteUrl: 'https://example.com',
    liveUrl: 'https://example.com',
    companyUrl: 'https://example.com',
    visualPlaceholder: 'from-zinc-800 via-neutral-900 to-stone-950',
    images: [
      {
        id: 'p2-img-1',
        alt: 'Abstract dashboard interface mockup',
        placeholderGradient: 'from-zinc-900 via-slate-900 to-black',
        label: '01 / Dashboard',
        url: '/demo/shots/dashboard.svg',
      },
      {
        id: 'p2-img-2',
        alt: 'Abstract mobile app screens mockup',
        placeholderGradient: 'from-[#121414] via-zinc-900 to-neutral-950',
        label: '02 / Onboarding',
        url: '/demo/shots/mobile.svg',
      },
      {
        id: 'p2-img-3',
        alt: 'Abstract image grid mockup',
        placeholderGradient: 'from-slate-900 via-zinc-900 to-black',
        label: '03 / Templates',
        url: '/demo/shots/grid.svg',
      },
    ],
    overview: [
      'Placeholder overview text. Describe the product and your part in it.',
      'Replace all of this from /admin/projects.',
    ],
    challenge:
      'Placeholder challenge. Compressing a long configuration process into something a non-technical person finishes in one sitting.',
    approachSteps: [
      { title: 'Map flows.', description: 'How you worked out the steps and their order.' },
      { title: 'Componentise.', description: 'How you kept it consistent as it grew.' },
      { title: 'Ship.', description: 'How it reached production.' },
    ],
    keyScreensCount: 3,
    outcomeNote: 'Placeholder outcome — a number here is worth a paragraph of adjectives.',
  },
  {
    id: 'project-fabrikam',
    slug: 'fabrikam-relocation',
    number: '03',
    name: 'Fabrikam',
    title: 'Fabrikam — Guided Relocation Service',
    company: 'Fabrikam',
    category: 'Service / Web app',
    year: '2023',
    role: 'Product Designer',
    deliverables: ['UX architecture', 'Responsive UI', 'Wireframes'],
    shortDescription:
      'A step-by-step service that walks people through a long, anxious, paperwork-heavy process.',
    description: [
      'Placeholder text. Replace with your own project description.',
      'Say what it was and who it was for.',
    ],
    heroHeadline: 'Turning a stressful multi-month process into a series of small, clear steps.',
    industry: 'Services',
    timeline: '10 weeks',
    platform: 'Web app',
    featured: true,
    siteUrl: 'https://example.com',
    liveUrl: 'https://example.com',
    companyUrl: 'https://example.com',
    visualPlaceholder: 'from-neutral-900 via-stone-900 to-black',
    images: [
      {
        id: 'p3-img-1',
        alt: 'Abstract editorial layout mockup',
        placeholderGradient: 'from-stone-950 via-neutral-900 to-black',
        label: '01 / Guided flow',
        url: '/demo/shots/editorial.svg',
      },
      {
        id: 'p3-img-2',
        alt: 'Abstract mobile app screens mockup',
        placeholderGradient: 'from-zinc-900 via-stone-900 to-black',
        label: '02 / Mobile',
        url: '/demo/shots/mobile.svg',
      },
    ],
    overview: [
      'Placeholder overview. Two short paragraphs work well here.',
      'Replace from the admin.',
    ],
    challenge:
      'Placeholder challenge. Long processes with legal requirements are hard to make feel manageable without hiding what matters.',
    approachSteps: [
      { title: 'Research.', description: 'What you learned from the people who use it.' },
      { title: 'Structure.', description: 'How you broke the process into steps.' },
      { title: 'Design.', description: 'What you built and why.' },
    ],
    keyScreensCount: 2,
    outcomeNote: 'Placeholder outcome — what improved, and how you know.',
  },
  {
    id: 'project-lumen-yard',
    slug: 'lumen-yard-storefront',
    number: '04',
    name: 'Lumen Yard',
    title: 'Lumen Yard — Independent Storefront',
    company: 'Lumen Yard',
    category: 'E-commerce',
    year: '2023',
    role: 'Product Designer',
    deliverables: ['E-commerce design', 'Mobile shopping', 'Handoff'],
    shortDescription:
      'A small, fast storefront where the photography does the selling and the interface stays out of the way.',
    description: [
      'Placeholder text — replace with your own.',
      'Short entries like this are fine. Not every project needs a full case study.',
    ],
    heroHeadline: 'Letting the product photography carry the page.',
    industry: 'Retail',
    timeline: '8 weeks',
    platform: 'Web & mobile',
    featured: false,
    siteUrl: 'https://example.com',
    liveUrl: 'https://example.com',
    companyUrl: 'https://example.com',
    visualPlaceholder: 'from-slate-900 via-neutral-900 to-zinc-950',
    images: [
      {
        id: 'p4-img-1',
        alt: 'Abstract image grid mockup',
        placeholderGradient: 'from-slate-950 via-zinc-900 to-black',
        label: '01 / Storefront',
        url: '/demo/shots/grid.svg',
      },
      {
        id: 'p4-img-2',
        alt: 'Abstract editorial layout mockup',
        placeholderGradient: 'from-zinc-900 via-neutral-900 to-black',
        label: '02 / Product detail',
        url: '/demo/shots/editorial.svg',
      },
    ],
    overview: ['Placeholder overview.', 'Replace from /admin/projects.'],
    challenge:
      'Placeholder challenge. Keeping a visually heavy page fast enough to load well on a phone.',
    approachSteps: [
      { title: 'Audit.', description: 'What you found when you looked at what existed.' },
      { title: 'Design.', description: 'What you changed.' },
    ],
    keyScreensCount: 2,
    outcomeNote: 'Placeholder outcome.',
  },
];
