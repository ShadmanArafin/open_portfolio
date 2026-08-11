import type { PageRecord } from '@/core/pages/schema';
import {
  CMSState,
  ExperienceItem,
  EducationItem,
  ProcessStepItem,
  CapabilityGroupItem,
  BrandItem,
  ProjectItem,
  CaseStudyItem,
  RecommendationItem,
  NavLinkItem,
} from '../types/cms';
import { PROJECTS } from '../../data/projects';
import { CASE_STUDIES } from '../../data/caseStudies';
import { BRANDS } from '../../data/brands';
import { EXPERIENCES } from '../../data/experience';
import { EDUCATION_DATA } from '../../data/education';
import { CAPABILITIES_DATA, CAPABILITIES_HEADER } from '../../data/capabilities';
import { ABOUT_DATA } from '../../data/about';
import { RECOMMENDATIONS } from '../../data/recommendations';
import { SOCIAL_CARDS, FOOTER_CONFIG } from '../../data/socials';
import { CONTACT_DATA } from '../../data/contact';
import { parsePeriod, parseYearRange } from '../utils/dates';

/**
 * Seed content.
 *
 * These files are read exactly once — the first time the site runs on a given
 * browser — to populate the CMS. After that the CMS is the only source of
 * truth and nothing in `src/data/` is read again. Editing a file here will not
 * change a site that already has stored content; use the admin, or Reset to
 * seed data from Settings.
 */

// Periods are authored as text ("Dec 2024 — Present"); split them once here so
// the editor can offer real date controls from then on.
const initialExperience: ExperienceItem[] = EXPERIENCES.map((exp, idx) => {
  const parts = parsePeriod(exp.period);
  return {
    id: exp.id,
    period: exp.period,
    startDate: parts.startDate,
    endDate: parts.endDate,
    type: 'Full-time',
    role: exp.role,
    company: exp.company,
    companyUrl: exp.companyUrl,
    current: parts.current,
    summary: exp.description,
    highlights: exp.highlights,
    sortOrder: idx + 1,
    visible: true,
  };
});

// The source file packs both meanings into one `status` string: either a
// completion date ("NOV 2023") or a state ("IN PROGRESS"). Split them, so the
// date field holds a date and the status field holds a status — otherwise the
// About page prints the same value twice ("IN PROGRESS / IN PROGRESS").
const initialEducation: EducationItem[] = EDUCATION_DATA.map((edu, idx) => {
  const inProgress = edu.status.toUpperCase().includes('PROGRESS');
  return {
    id: edu.id,
    number: edu.number,
    yearLabel: inProgress ? '' : edu.status,
    degree: edu.degree,
    institution: edu.institution,
    institutionUrl: edu.url,
    status: inProgress ? ('In Progress' as const) : ('Graduated' as const),
    isCurrent: inProgress,
    sortOrder: idx + 1,
    visible: true,
  };
});

// Derived from the "how I think" principles. Duration and deliverable have no
// source value, so they start empty rather than claiming a made-up timeline —
// fill them in from /admin/process if you want them shown.
const initialProcessSteps: ProcessStepItem[] = ABOUT_DATA.principles.map((p, idx) => ({
  id: `step-${idx + 1}`,
  number: p.number,
  title: p.title,
  duration: '',
  deliverable: '',
  description: p.description,
  details: [],
  sortOrder: idx + 1,
  visible: true,
}));

const initialCapabilities: CapabilityGroupItem[] = CAPABILITIES_DATA.map((cap, idx) => ({
  id: `cap-${idx + 1}`,
  number: cap.number,
  title: cap.category,
  description: '',
  capabilities: cap.items,
  sortOrder: idx + 1,
  visible: true,
}));

const initialBrands: BrandItem[] = BRANDS.map((brand, idx) => ({
  id: brand.id,
  name: brand.name,
  logo: brand.logo,
  alt: brand.alt,
  url: brand.url,
  size: brand.size ?? 'default',
  sortOrder: idx + 1,
  visible: true,
}));

const initialProjects: ProjectItem[] = PROJECTS.map((proj, idx) => ({
  ...proj,
  industry: proj.industry || proj.category,
  ...parseYearRange(proj.year),
  sortOrder: idx + 1,
  status: 'published',
}));

/**
 * The outcome metrics are authored as sentences ("58% reduction in average
 * transaction processing time"). The detail page renders a large figure above
 * a caption, so split the leading figure off when there is one.
 */
function splitMetric(text: string): { metric: string; label: string } {
  const match = text.match(/^([+-]?[\d.,]+\s*(?:%|x|\+)?)\s+(.*)$/i);
  if (match) return { metric: match[1].trim(), label: match[2].trim() };
  return { metric: '', label: text };
}

const initialCaseStudies: CaseStudyItem[] = CASE_STUDIES.map((cs, idx) => ({
  ...cs,
  ...parseYearRange(cs.year),
  sortOrder: idx + 1,
  status: 'published',
  keyDecisions: cs.keyDecisions ?? [],
  finalSolution: {
    title: 'Final Solution',
    description: cs.finalSolution?.description ?? '',
    highlights: cs.finalSolution?.highlights ?? [],
  },
  designSystemTokens: cs.designSystemTokens ?? {
    colors: [],
    typography: '',
    spacingScale: '',
  },
  outcome: cs.outcome ?? { summary: '', metrics: [] },
  outcomes: (cs.outcome?.metrics ?? []).map(splitMetric),
}));

const initialRecommendations: RecommendationItem[] = RECOMMENDATIONS.map((rec, idx) => ({
  id: rec.id,
  name: rec.name,
  // Not present in the source data — add job titles from /admin/recommendations.
  role: '',
  company: rec.company,
  // Quotes are stored with typographic quote marks; the card adds its own.
  quote: rec.quote.replace(/^[“"'\s]+|[”"'\s]+$/g, ''),
  featured: true,
  sortOrder: idx + 1,
  visible: true,
}));

const initialNavLinks: NavLinkItem[] = [
  { id: 'nav-work', label: 'Work', path: '/work', visible: true, sortOrder: 1 },
  {
    id: 'nav-case-studies',
    label: 'Case Studies',
    path: '/case-studies',
    visible: true,
    sortOrder: 2,
  },
  { id: 'nav-about', label: 'About', path: '/about', visible: true, sortOrder: 3 },
  { id: 'nav-contact', label: 'Contact', path: '/contact', visible: true, sortOrder: 4 },
];

/** Seeded assets have no real upload date — use the install date. */
const seedDate = new Date().toISOString().slice(0, 10);

/**
 * One page, built from blocks, shipped as a draft.
 *
 * A draft on purpose. Nothing should appear on a stranger's live site that they
 * did not choose to publish — but an empty Pages screen teaches nobody what a
 * page is, and every install deserves one worked example to open, rearrange and
 * publish or delete.
 *
 * It also means the block renderer and the page route are exercised by real
 * seeded content on every fresh install, rather than only by tests.
 */
const initialPages: PageRecord[] = [
  {
    id: 'page_example',
    slug: 'example',
    title: 'An example page',
    status: 'draft',
    seo: {
      description: 'A starting point. Rearrange it, rename it, or delete it.',
    },
    nav: { show: false, order: 10 },
    updatedAt: '2026-01-01T00:00:00.000Z',
    revision: 1,
    blocks: [
      {
        id: 'block_example_hero',
        type: 'hero',
        v: 1,
        frame: { spacing: 'loose' },
        props: {
          eyebrow: 'Example',
          headline: 'This page is made of blocks.',
          subhead:
            'Every part of it is a block you can move, edit or remove. Nothing here is special — make your own and delete this one.',
          cta: [{ label: 'Get in touch', href: '/contact' }],
        },
      },
      {
        id: 'block_example_text',
        type: 'richText',
        v: 1,
        props: {
          heading: 'How pages work',
          paragraphs: [
            'A page is an address and a stack of blocks. The blocks decide what is on it; the theme decides what it looks like. That separation is why switching theme never breaks a page.',
            'Blocks cannot set their own colours, spacing or type sizes. It sounds restrictive and it is the reason a page you build at midnight still looks composed in the morning.',
          ],
        },
      },
      {
        id: 'block_example_cards',
        type: 'cards',
        v: 1,
        props: {
          heading: 'Three things worth knowing',
          columns: 3,
          items: [
            {
              title: 'Drafts stay private',
              body: 'A page is only visible to the internet once you publish it. Until then, only you can see it, through Preview.',
            },
            {
              title: 'Addresses are checked',
              body: 'If you pick a web address the site already uses, it says so rather than letting you make a page that never opens.',
            },
            {
              title: 'Nothing is lost',
              body: 'A block this version cannot read is kept exactly as it was rather than thrown away.',
            },
          ],
        },
      },
    ],
  },
];

export const INITIAL_CMS_STATE: CMSState = {
  status: 'published',
  lastSavedAt: new Date().toISOString(),
  lastPublishedAt: new Date().toISOString(),

  settings: {
    fullName: 'Your Name',
    role: 'Your Role',
    location: CONTACT_DATA.location,
    email: CONTACT_DATA.email,
    whatsappNumber: CONTACT_DATA.whatsappNumber,
    whatsappFormatted: CONTACT_DATA.whatsappFormatted,
    whatsappUrl: CONTACT_DATA.whatsappUrl,
    avatarPath: FOOTER_CONFIG.avatarPath,
    portraitPath: '/demo/portrait.svg',
    // Empty until you upload one — the dashboard will prompt you.
    resumeUrl: FOOTER_CONFIG.resumeUrl,
    resumeFilename: '',
    availabilityStatus: 'Available for select projects',
    availableDotEnabled: true,
    // Empty on purpose: the footer works this out from your name and the
    // current year. A literal here is a copy that goes stale the moment
    // somebody changes their name in Settings, and nothing connects the two
    // screens in the user's mind.
    copyrightText: '',
    timezone: 'UTC',
    siteUrl: '',
    aboutHeading: 'Learning, making, and improving along the way.',
    aboutStoryParagraphs: [
      'This is placeholder text. Write your own story here — where you started, what you work on now, and what you are trying to get better at.',
      'You can edit every word on this site from /admin. Nothing here requires touching code or redeploying.',
    ],
  },

  microcopy: {
    availableForFreelance: CONTACT_DATA.availability,
    contactButton: 'GET IN TOUCH',
    letsCreateSomething: "LET'S CREATE SOMETHING",
    viewAllProjects: 'VIEW ALL PROJECTS',
    viewAllCaseStudies: 'VIEW ALL CASE STUDIES',
    readCaseStudy: 'EXPLORE CASE STUDY',
    exploreCaseStudy: 'EXPLORE CASE STUDY',
    visitSite: 'Visit Site',
    moreAboutMe: 'MORE ABOUT ME',
    myResume: 'DOWNLOAD RESUME',
    resumeDownloadStarted: 'Resume download started',
    emailCopied: 'Email address copied to clipboard',
    sendMessage: 'SEND MESSAGE',
    messageSent: 'Message sent successfully!',
    errorMessage: 'Something went wrong. Please try again.',
    connectOnWhatsapp: 'WHATSAPP DIRECT',
    contactOnWhatsapp: 'CONTACT ON WHATSAPP',
    selectedBrandsTitle: "SELECTED CLIENTS I'VE WORKED WITH",
    theStorySoFarTitle: 'THE STORY SO FAR',
    theStorySoFarSubtitle: 'How I got here, and what I am working on now.',
    educationTitle: 'EDUCATION',
    continuingEducationLabel: 'CONTINUING EDUCATION',
    workExperienceTitle: 'WORK EXPERIENCE',
    visualExplorationsTitle: 'SELECTED EXPLORATIONS',
    visualExplorationsSubtitle: 'Work in progress, experiments and finished pieces.',
    letsWorkTogetherTitle: "LET'S WORK TOGETHER",
    letsWorkTogetherSubtitle:
      "Whether you're starting something new, improving something that exists, or just exploring an idea — I'm always interested in a good problem.",
    directEmailLabel: 'DIRECT EMAIL',

    // Copy that used to be hardcoded inside components
    allFilterLabel: 'All',
    backToCaseStudies: 'Back to Case Studies',
    backToWork: 'Back to Work',
    nextCaseStudyLabel: 'NEXT CASE STUDY',
    impactMetricsLabel: 'IMPACT & METRICS',
    measuredOutcomesTitle: 'Measured Outcomes',
    contactSuccessTitle: 'Message Sent.',
    contactSuccessBody:
      "Thanks for reaching out. I'll read what you sent and get back to you soon.",
    sendAnotherMessage: 'SEND ANOTHER MESSAGE',
    notFoundTitle: 'Not found',
    notFoundBody: 'That page may have been renamed or removed.',
  },

  appearance: {
    accentDark: '#35F2B3',
    accentLight: '#00B97D',
    backgroundDark: '#0D0F0F',
    backgroundLight: '#F3F3EF',
    strokeDark: '#1B1B1B',
    strokeLight: '#DADADA',
    displayFontFamily: 'Instrument Serif',
    bodyFontFamily: 'Geist',
    monoFontFamily: 'Geist Mono',
    giantFooterText: 'PORTFOLIO',
  },

  seo: {
    siteTitle: 'Your Name — Your Role',
    // Also empty, for the same reason: the page title falls back to
    // "Page — Site title", which tracks whatever the site is called.
    titleTemplate: '',
    metaDescription:
      'Placeholder description. Write one or two sentences describing who you are and what you do — search engines and link previews show roughly 150 characters.',
    canonicalUrl: '',
    ogImage: '/demo/portrait.svg',
    favicon: '/favicon.svg',
    robots: 'index, follow',
    author: 'Your Name',
  },

  sections: [
    {
      id: 'hero',
      name: 'Hero Overview',
      label: 'Overview',
      visible: true,
      order: 1,
      anchorId: 'hero',
      heading: 'This is your portfolio. Make it yours.',
      description:
        'Placeholder introduction. Sign in at /admin to replace every word, image and colour on this site — no code, no redeploy.',
      primaryCtaLabel: 'CONTACT',
      primaryCtaUrl: CONTACT_DATA.whatsappUrl,
      secondaryCtaLabel: "LET'S CREATE SOMETHING",
      secondaryCtaUrl: '/contact',
    },
    {
      id: 'brands',
      name: 'Clients & Brands',
      label: 'Clients & Brands',
      visible: true,
      order: 2,
      anchorId: 'brands',
      heading: "SELECTED CLIENTS I'VE WORKED WITH",
    },
    {
      id: 'work',
      name: 'Selected Work',
      label: 'Selected Work',
      visible: true,
      order: 3,
      anchorId: 'work',
      heading: 'SELECTED WORK',
      primaryCtaLabel: 'VIEW ALL PROJECTS',
      primaryCtaUrl: '/work',
    },
    {
      id: 'case-studies',
      name: 'Case Studies',
      label: 'Case Studies',
      visible: true,
      order: 4,
      anchorId: 'case-studies',
      heading: 'A closer look at how I solve problems.',
      description:
        'Longer stories covering the thinking, the decisions and the dead ends behind the finished work.',
      primaryCtaLabel: 'VIEW ALL CASE STUDIES',
      primaryCtaUrl: '/case-studies',
    },
    {
      id: 'experience',
      name: 'Work Experience',
      label: 'Experience',
      visible: true,
      order: 5,
      anchorId: 'experience',
      heading: 'WORK EXPERIENCE',
      primaryCtaLabel: 'VIEW FULL RESUME',
      // Set once you upload a résumé from /admin/media.
      primaryCtaUrl: '',
    },
    {
      id: 'about',
      name: 'About Story',
      label: 'About',
      visible: true,
      order: 6,
      anchorId: 'about',
      heading: 'Learning, making, and improving along the way.',
      description:
        'Placeholder summary. A couple of sentences about who you are and the kind of work you take on.',
      primaryCtaLabel: 'MORE ABOUT ME',
      primaryCtaUrl: '/about',
    },
    {
      id: 'process',
      name: 'Design Process',
      label: 'My Process',
      visible: true,
      order: 7,
      anchorId: 'process',
      heading: 'HOW I WORK',
    },
    {
      id: 'capabilities',
      name: 'Core Capabilities',
      label: CAPABILITIES_HEADER.sectionLabel,
      visible: true,
      order: 8,
      anchorId: 'capabilities',
      heading: CAPABILITIES_HEADER.heading,
      description: CAPABILITIES_HEADER.supportingCopy,
    },
    {
      id: 'recommendations',
      name: 'Recommendations',
      label: 'Recommendations',
      visible: true,
      order: 9,
      anchorId: 'recommendations',
      heading: 'Kind words from leaders and colleagues.',
    },
    {
      id: 'contact',
      name: "Let's Work Together",
      label: "Let's Work Together",
      visible: true,
      order: 10,
      anchorId: 'contact',
      heading: 'Have something worth building?',
      description:
        "Whether you're starting something new, improving something that exists, or just exploring an idea — I'm always interested in a good problem.",
      primaryCtaLabel: "LET'S TALK",
      primaryCtaUrl: '/contact',
      secondaryCtaLabel: 'CONTACT ON WHATSAPP',
      secondaryCtaUrl: CONTACT_DATA.whatsappUrl,
    },

    // Standalone page headers. Not rendered on the homepage — `order` is only
    // used for homepage sequencing, so these sit after it.
    {
      id: 'work-page',
      name: 'Work Page Header',
      label: 'WORK',
      visible: true,
      order: 101,
      anchorId: 'work-page',
      heading: 'Selected work.',
      description: 'A collection of projects, with the most recent first.',
    },
    {
      id: 'case-studies-page',
      name: 'Case Studies Page Header',
      label: 'CASE STUDIES',
      visible: true,
      order: 102,
      anchorId: 'case-studies-page',
      heading: 'A closer look at how I approach problems.',
      description:
        'Longer stories covering the decisions, the structure and the process behind the finished work.',
    },
    {
      id: 'contact-page',
      name: 'Contact Page Header',
      label: 'CONTACT',
      visible: true,
      order: 103,
      anchorId: 'contact-page',
      heading: "Let's talk about what you're building.",
      description:
        "Have a project or an idea you'd like to discuss? Send a message and I'll get back to you as soon as I can.",
    },
  ],

  pages: initialPages,
  projects: initialProjects,
  caseStudies: initialCaseStudies,
  brands: initialBrands,
  experience: initialExperience,
  education: initialEducation,
  processSteps: initialProcessSteps,
  capabilityGroups: initialCapabilities,
  recommendations: initialRecommendations,

  artifacts: [
    {
      id: 'art-01',
      category: 'ui',
      src: '/demo/shots/dashboard.svg',
      alt: 'Abstract dashboard interface mockup',
      sortOrder: 1,
      visible: true,
    },
    {
      id: 'art-02',
      category: 'systems',
      src: '/demo/shots/editorial.svg',
      alt: 'Abstract editorial layout mockup',
      sortOrder: 2,
      visible: true,
    },
    {
      id: 'art-03',
      category: 'systems',
      src: '/demo/shots/grid.svg',
      alt: 'Abstract image grid mockup',
      sortOrder: 3,
      visible: true,
    },
    {
      id: 'art-04',
      category: 'mobile',
      src: '/demo/shots/mobile.svg',
      alt: 'Abstract mobile app screens mockup',
      sortOrder: 4,
      visible: true,
    },
  ],

  socialLinks: SOCIAL_CARDS.map((card, idx) => ({
    ...card,
    visible: true,
    sortOrder: idx + 1,
  })),

  navLinks: initialNavLinks,

  // Demo assets that ship in public/demo. Uploading your own adds entries here.
  media: [
    {
      id: 'm-01',
      name: 'avatar.svg',
      url: '/demo/avatar.svg',
      type: 'svg',
      sizeBytes: 504,
      dimensions: '600x600',
      uploadedAt: seedDate,
      altText: 'Placeholder avatar',
      usageCount: 2,
    },
    {
      id: 'm-02',
      name: 'portrait.svg',
      url: '/demo/portrait.svg',
      type: 'svg',
      sizeBytes: 515,
      dimensions: '1200x1600',
      uploadedAt: seedDate,
      altText: 'Placeholder portrait',
      usageCount: 2,
    },
  ],

  messages: [],

  versions: [],

  activityLogs: [
    {
      id: 'act-101',
      timestamp: new Date().toISOString(),
      user: 'System',
      action: 'Initialised',
      details: 'CMS seeded from the built-in content files.',
    },
  ],
};
