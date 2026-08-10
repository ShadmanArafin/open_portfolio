export type PublishStatus = 'draft' | 'published' | 'archived';

export interface MicrocopySettings {
  availableForFreelance: string;
  contactButton: string;
  letsCreateSomething: string;
  viewAllProjects: string;
  viewAllCaseStudies: string;
  readCaseStudy: string;
  exploreCaseStudy: string;
  visitSite: string;
  moreAboutMe: string;
  myResume: string;
  resumeDownloadStarted: string;
  emailCopied: string;
  sendMessage: string;
  messageSent: string;
  errorMessage: string;
  connectOnWhatsapp: string;
  contactOnWhatsapp: string;
  selectedBrandsTitle: string;
  theStorySoFarTitle: string;
  theStorySoFarSubtitle: string;
  educationTitle: string;
  continuingEducationLabel: string;
  workExperienceTitle: string;
  visualExplorationsTitle: string;
  visualExplorationsSubtitle: string;
  letsWorkTogetherTitle: string;
  letsWorkTogetherSubtitle: string;
  directEmailLabel: string;

  // Copy lifted out of component JSX so it can be edited from /admin/microcopy
  allFilterLabel: string;
  backToCaseStudies: string;
  backToWork: string;
  nextCaseStudyLabel: string;
  impactMetricsLabel: string;
  measuredOutcomesTitle: string;
  contactSuccessTitle: string;
  contactSuccessBody: string;
  sendAnotherMessage: string;
  notFoundTitle: string;
  notFoundBody: string;
}

export interface SiteSettings {
  fullName: string;
  role: string;
  location: string;
  email: string;
  whatsappNumber: string;
  whatsappFormatted: string;
  whatsappUrl: string;
  avatarPath: string;
  portraitPath: string;
  resumeUrl: string;
  resumeFilename: string;
  availabilityStatus: string;
  availableDotEnabled: boolean;
  copyrightText: string;
  timezone: string;
  siteUrl: string;
  aboutHeading?: string;
  aboutStoryParagraphs?: string[];
}

export interface SectionConfig {
  id: string;
  name: string;
  label: string;
  visible: boolean;
  order: number;
  anchorId: string;
  heading?: string;
  subheading?: string;
  description?: string;
  primaryCtaLabel?: string;
  primaryCtaUrl?: string;
  secondaryCtaLabel?: string;
  secondaryCtaUrl?: string;
}

export interface ProjectImageItem {
  id: string;
  label: string;
  alt: string;
  url?: string;
  placeholderGradient?: string;
}

export interface ProjectApproachStep {
  title: string;
  description: string;
}

export interface ProjectItem {
  id: string;
  slug: string;
  number: string;
  title: string;
  name: string;
  company: string;
  companyUrl?: string;
  category: string;
  /** Rendered label, e.g. "2024 — 2025". Derived from the bounds below when set. */
  year: string;
  startYear?: string;
  endYear?: string;
  shortDescription: string;
  description: string[];
  heroHeadline: string;
  role: string;
  deliverables: string[];
  industry: string;
  timeline: string;
  platform: string;
  liveUrl?: string;
  siteUrl?: string;
  featured: boolean;
  sortOrder: number;
  status: PublishStatus;
  visualPlaceholder: string;
  images: ProjectImageItem[];
  overview: string[];
  challenge: string;
  approachSteps: ProjectApproachStep[];
  keyScreensCount: number;
  outcomeNote: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface CaseStudyBlock {
  id: string;
  type:
    | 'text'
    | 'heading'
    | 'quote'
    | 'image'
    | 'two-column-images'
    | 'problem-statement'
    | 'key-insight'
    | 'wireframe-gallery'
    | 'prototype-embed'
    | 'outcome'
    | 'learnings';
  content: Record<string, any>;
  order: number;
}

export interface CaseStudyItem {
  id: string;
  slug: string;
  number: string;
  title: string;
  category: string;
  /** Rendered label. Derived from the bounds below when set. */
  year: string;
  startYear?: string;
  endYear?: string;
  coverImage?: string;
  coverGradient?: string;
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
  wireframes: {
    id: string;
    title: string;
    description: string;
    gradient: string;
    image?: string;
  }[];
  keyDecisions: {
    number: string;
    title: string;
    rationale: string;
    impact: string;
  }[];
  finalSolution: {
    title: string;
    description: string;
    highlights: string[];
  };
  designSystemTokens: {
    colors: { name: string; hex: string }[];
    typography: string;
    spacingScale: string;
  };
  /** Narrative result, shown on the case study detail page. */
  outcome: {
    summary: string;
    metrics: string[];
  };
  /** Headline stats, shown as a metric row. */
  outcomes: {
    metric: string;
    label: string;
  }[];
  blocks?: CaseStudyBlock[];
  sortOrder: number;
  status: PublishStatus;
  seoTitle?: string;
  seoDescription?: string;
}

export interface BrandItem {
  id: string;
  name: string;
  logo: string;
  alt: string;
  url?: string;
  size: 'small' | 'default' | 'wide';
  sortOrder: number;
  visible: boolean;
}

export interface ExperienceItem {
  id: string;
  /**
   * The rendered label, e.g. "Dec 2024 — Present".
   * Derived from startDate/endDate/current when those are set; kept as the
   * fallback for entries authored before the structured fields existed.
   */
  period: string;
  /** ISO YYYY-MM-DD. Only the month and year are ever shown. */
  startDate?: string;
  /** ISO YYYY-MM-DD. Omitted while `current` is true. */
  endDate?: string;
  type: string;
  role: string;
  company: string;
  companyUrl?: string;
  current: boolean;
  summary: string;
  highlights: string[];
  sortOrder: number;
  visible: boolean;
}

export interface EducationItem {
  id: string;
  number: string;
  yearLabel: string;
  degree: string;
  institution: string;
  institutionUrl?: string;
  status: 'In Progress' | 'Graduated' | 'Completed' | 'Paused';
  isCurrent?: boolean;
  sortOrder: number;
  visible: boolean;
}

export interface ProcessStepItem {
  id: string;
  number: string;
  title: string;
  duration: string;
  deliverable: string;
  description: string;
  details: string[];
  sortOrder: number;
  visible: boolean;
}

export interface CapabilityGroupItem {
  id: string;
  number: string;
  title: string;
  description: string;
  capabilities: string[];
  sortOrder: number;
  visible: boolean;
}

export interface RecommendationItem {
  id: string;
  name: string;
  role: string;
  company: string;
  companyUrl?: string;
  quote: string;
  avatar?: string;
  featured: boolean;
  sortOrder: number;
  visible: boolean;
}

export interface VisualArtifactItem {
  id: string;
  category: 'ui' | 'systems' | 'mobile';
  src: string;
  alt: string;
  sortOrder: number;
  visible: boolean;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'pdf' | 'video' | 'svg';
  sizeBytes: number;
  dimensions?: string;
  uploadedAt: string;
  altText: string;
  usageCount: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  company?: string;
  projectType: string;
  message: string;
  receivedAt: string;
  status: 'unread' | 'read' | 'archived' | 'spam';
}

/**
 * Which platform a social card points at. The list is kept in step with
 * SOCIAL_PLATFORMS in `cms/data/socialPlatforms.ts`, which owns the icon and
 * the profile URL prefix for each one.
 */
export type SocialPlatformId =
  | 'linkedin'
  | 'github'
  | 'dribbble'
  | 'behance'
  | 'figma'
  | 'instagram'
  | 'twitter'
  | 'youtube'
  | 'medium'
  | 'threads'
  | 'bluesky'
  | 'mastodon'
  | 'codepen'
  | 'whatsapp'
  | 'email'
  | 'website';

export interface SocialLinkItem {
  id: string;
  label: string;
  /** Caption under the icon on the footer card — usually the handle. */
  name: string;
  url: string;
  iconType: SocialPlatformId;
  visible: boolean;
  sortOrder: number;
}

export interface NavLinkItem {
  id: string;
  label: string;
  path: string;
  visible: boolean;
  sortOrder: number;
}

export interface AppearanceSettings {
  accentDark: string;
  accentLight: string;
  backgroundDark: string;
  backgroundLight: string;
  strokeDark: string;
  strokeLight: string;
  displayFontFamily: string;
  bodyFontFamily: string;
  /**
   * Font for the small mono-style labels (section eyebrows, numbers, meta).
   * Empty means the system monospace stack, which is the original look.
   */
  monoFontFamily?: string;
  giantFooterText?: string;
}

export interface SEOSettings {
  siteTitle: string;
  titleTemplate: string;
  metaDescription: string;
  canonicalUrl: string;
  ogImage: string;
  favicon: string;
  robots: string;
  author: string;
}

export interface ContentVersion {
  id: string;
  timestamp: string;
  editor: string;
  action: string;
  summary: string;
  snapshot: any;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export interface CMSState {
  status: PublishStatus;
  lastSavedAt: string;
  lastPublishedAt: string;
  settings: SiteSettings;
  microcopy: MicrocopySettings;
  appearance: AppearanceSettings;
  seo: SEOSettings;
  sections: SectionConfig[];
  projects: ProjectItem[];
  caseStudies: CaseStudyItem[];
  brands: BrandItem[];
  experience: ExperienceItem[];
  education: EducationItem[];
  processSteps: ProcessStepItem[];
  capabilityGroups: CapabilityGroupItem[];
  recommendations: RecommendationItem[];
  artifacts: VisualArtifactItem[];
  socialLinks: SocialLinkItem[];
  navLinks: NavLinkItem[];
  media: MediaItem[];
  messages: ContactMessage[];
  versions: ContentVersion[];
  activityLogs: ActivityLog[];
}
