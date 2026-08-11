import { CMSState } from '../types/cms';

/**
 * What the dashboard can honestly tell you.
 *
 * There is no analytics backend and no visitor data, so nothing here is about
 * traffic. What the CMS *does* know is the state of the content itself, and
 * most of what goes wrong with a portfolio is visible from that: work that
 * never got published, a case study with no cover, a link preview that will
 * render blank, an enquiry nobody answered.
 *
 * Every issue names the screen that fixes it, so the list is a queue of work
 * rather than a report.
 */

export type IssueSeverity = 'blocking' | 'warning' | 'idea';

export interface ContentIssue {
  id: string;
  severity: IssueSeverity;
  title: string;
  detail: string;
  /** Where to go to fix it. */
  to: string;
  action: string;
}

/** Text the seed ships with. Still present means the record was never edited. */
const PLACEHOLDERS = [
  'new project',
  'one-line summary shown on project cards.',
  'project overview description paragraph 1.',
  'headline shown at the top of the project page.',
  'what problem did this project set out to solve?',
  'overview paragraph shown on the project detail page.',
  'https://example.com',
  'untitled',
  'new case study',
];

function isPlaceholder(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const v = value.trim().toLowerCase();
  return v.length > 0 && PLACEHOLDERS.includes(v);
}

const RECOMMENDED_DESCRIPTION_MIN = 50;
const RECOMMENDED_DESCRIPTION_MAX = 160;

export interface HealthReport {
  issues: ContentIssue[];
  /** Checks passed out of checks run, as a percentage. */
  score: number;
  passed: number;
  total: number;
  /** Records a visitor can actually reach right now. */
  liveProjects: number;
  liveCaseStudies: number;
  /** Whole days since the last publish, or null if never published. */
  daysSincePublish: number | null;
  unreadMessages: number;
  unusedMedia: number;
  storageBytes: number;
}

export function analyseContent(
  state: CMSState,
  countMediaUsage: (id: string) => number,
  options: { emailConfigured?: boolean } = {}
): HealthReport {
  const issues: ContentIssue[] = [];
  let total = 0;

  /** Register a check; push an issue when it fails. */
  const check = (passed: boolean, issue: () => ContentIssue) => {
    total += 1;
    if (!passed) issues.push(issue());
  };

  const projects = state.projects ?? [];
  const caseStudies = state.caseStudies ?? [];
  const artifacts = state.artifacts ?? [];
  const brands = state.brands ?? [];
  const sections = state.sections ?? [];
  const media = state.media ?? [];
  const seo = state.seo;

  /* ------------------------------------------------ reach: is it even live */

  const draftProjects = projects.filter((p) => p.status !== 'published');
  check(draftProjects.length === 0, () => ({
    id: 'projects-unpublished',
    severity: 'blocking',
    title: `${draftProjects.length} project${draftProjects.length === 1 ? '' : 's'} not published`,
    detail: `Nobody can see ${draftProjects
      .map((p) => p.title)
      .slice(0, 3)
      .join(', ')}${draftProjects.length > 3 ? ` and ${draftProjects.length - 3} more` : ''}.`,
    to: '/admin/projects',
    action: 'Review status',
  }));

  const draftCaseStudies = caseStudies.filter((cs) => cs.status !== 'published');
  check(draftCaseStudies.length === 0, () => ({
    id: 'case-studies-unpublished',
    severity: 'blocking',
    title: `${draftCaseStudies.length} case stud${draftCaseStudies.length === 1 ? 'y' : 'ies'} not published`,
    detail: 'Case studies are usually the most persuasive thing on a portfolio. These are hidden.',
    to: '/admin/case-studies',
    action: 'Review status',
  }));

  const hiddenSections = sections.filter((s) => s.visible === false);
  check(hiddenSections.length === 0, () => ({
    id: 'sections-hidden',
    severity: 'warning',
    title: `${hiddenSections.length} homepage section${hiddenSections.length === 1 ? '' : 's'} hidden`,
    detail: `Hidden: ${hiddenSections.map((s) => s.name).join(', ')}.`,
    to: '/admin/pages',
    action: 'Open builder',
  }));

  /* ------------------------------------------ first impression: the visuals */

  const coverless = caseStudies.filter((cs) => !cs.coverImage);
  check(coverless.length === 0, () => ({
    id: 'case-study-covers',
    severity: 'warning',
    title: `${coverless.length} case stud${coverless.length === 1 ? 'y has' : 'ies have'} no cover image`,
    detail:
      'The cover is what the card on /case-studies shows. Without it the card reads as empty.',
    to: '/admin/case-studies',
    action: 'Add covers',
  }));

  const imagelessProjects = projects.filter((p) => !(p.images ?? []).some((img) => img?.url));
  check(imagelessProjects.length === 0, () => ({
    id: 'project-images',
    severity: 'warning',
    title: `${imagelessProjects.length} project${imagelessProjects.length === 1 ? '' : 's'} with no screenshots`,
    detail: 'Work without images is the most common reason a portfolio page gets skipped.',
    to: '/admin/projects',
    action: 'Add images',
  }));

  const logoless = brands.filter((b) => !b.logo);
  check(logoless.length === 0, () => ({
    id: 'brand-logos',
    severity: 'warning',
    title: `${logoless.length} brand${logoless.length === 1 ? '' : 's'} missing a logo`,
    detail: 'The logo row on the homepage will show a gap.',
    to: '/admin/brands',
    action: 'Upload logos',
  }));

  /* --------------------------------------------- findable and shareable */

  check(Boolean(seo?.metaDescription?.trim()), () => ({
    id: 'seo-description-missing',
    severity: 'blocking',
    title: 'No meta description',
    detail: 'Search results will quote an arbitrary line from the page instead.',
    to: '/admin/seo',
    action: 'Write one',
  }));

  const descLength = seo?.metaDescription?.trim().length ?? 0;
  check(
    descLength === 0 ||
      (descLength >= RECOMMENDED_DESCRIPTION_MIN && descLength <= RECOMMENDED_DESCRIPTION_MAX),
    () => ({
      id: 'seo-description-length',
      severity: 'warning',
      title: `Meta description is ${descLength} characters`,
      detail: `Aim for ${RECOMMENDED_DESCRIPTION_MIN}–${RECOMMENDED_DESCRIPTION_MAX}. Google truncates past about ${RECOMMENDED_DESCRIPTION_MAX}.`,
      to: '/admin/seo',
      action: 'Adjust',
    })
  );

  check(Boolean(seo?.ogImage?.trim()), () => ({
    id: 'seo-og-image',
    severity: 'blocking',
    title: 'No social share image',
    detail: 'Links to your site posted on LinkedIn, X or Slack will preview as a blank card.',
    to: '/admin/seo',
    action: 'Set an image',
  }));

  check(Boolean(seo?.canonicalUrl?.trim()), () => ({
    id: 'seo-canonical',
    severity: 'warning',
    title: 'No canonical URL',
    detail: 'Set it once your domain is live so search engines index a single address.',
    to: '/admin/seo',
    action: 'Set URL',
  }));

  /* ------------------------------------------------------- accessibility */

  const altless = artifacts.filter((a) => !a.alt?.trim());
  check(altless.length === 0, () => ({
    id: 'artifact-alt',
    severity: 'warning',
    title: `${altless.length} image${altless.length === 1 ? '' : 's'} without alt text`,
    detail: 'Screen readers announce nothing, and search engines cannot index the image.',
    to: '/admin/artifacts',
    action: 'Describe them',
  }));

  /* --------------------------------------------------- unfinished content */

  const placeholderProjects = projects.filter(
    (p) =>
      isPlaceholder(p.title) ||
      isPlaceholder(p.company) ||
      isPlaceholder(p.shortDescription) ||
      isPlaceholder(p.heroHeadline) ||
      isPlaceholder(p.challenge) ||
      (p.description ?? []).some(isPlaceholder)
  );
  check(placeholderProjects.length === 0, () => ({
    id: 'placeholder-copy',
    severity: 'blocking',
    title: `${placeholderProjects.length} project${placeholderProjects.length === 1 ? '' : 's'} still has starter text`,
    detail: `Sample copy is live on ${placeholderProjects
      .map((p) => p.title)
      .slice(0, 2)
      .join(', ')}.`,
    to: '/admin/projects',
    action: 'Replace it',
  }));

  const urlless = projects.filter(
    (p) => !(p.liveUrl || p.siteUrl || p.companyUrl || '').trim() || isPlaceholder(p.liveUrl)
  );
  check(urlless.length === 0, () => ({
    id: 'project-links',
    severity: 'warning',
    title: `${urlless.length} project${urlless.length === 1 ? '' : 's'} without a working link`,
    detail: 'The "Visit site" button has nowhere to go.',
    to: '/admin/projects',
    action: 'Add links',
  }));

  const thinCaseStudies = caseStudies.filter((cs) => (cs.keyDecisions ?? []).length === 0);
  check(thinCaseStudies.length === 0, () => ({
    id: 'case-study-depth',
    severity: 'idea',
    title: `${thinCaseStudies.length} case stud${thinCaseStudies.length === 1 ? 'y has' : 'ies have'} no key decisions`,
    detail: 'Explaining your decisions is what separates a case study from a gallery.',
    to: '/admin/case-studies',
    action: 'Add decisions',
  }));

  /* ------------------------------------------------------------- follow-up */

  const unreadMessages = (state.messages ?? []).filter((m) => m.status === 'unread').length;
  check(unreadMessages === 0, () => ({
    id: 'unread-messages',
    severity: 'blocking',
    title: `${unreadMessages} enquiry${unreadMessages === 1 ? '' : ' enquiries'} unread`,
    detail: 'Someone contacted you and has not had a reply.',
    to: '/admin/messages',
    action: 'Open inbox',
  }));

  const failedNotifications = (state.messages ?? []).filter((m) => m.notifyError).length;

  // Distinct from the check below: this one is about the owner never having
  // set up mail at all, which is expected on a fresh install and only a
  // warning. A configured server that is failing to deliver is not expected,
  // and enquiries pile up unseen if nothing says so.
  check(options.emailConfigured !== false, () => ({
    id: 'email-not-configured',
    severity: 'warning',
    title: 'Nothing tells you when an enquiry arrives',
    detail:
      'Messages reach your inbox here, but no email is sent, so you only see them by ' +
      'signing in. Set OPB_SMTP_HOST and the related variables to change that.',
    to: '/admin/messages',
    action: 'See enquiries',
  }));

  check(failedNotifications === 0, () => ({
    id: 'email-failing',
    severity: 'blocking',
    title: `${failedNotifications} enquir${failedNotifications === 1 ? 'y' : 'ies'} could not be emailed to you`,
    detail: 'The enquiries are safe and listed in your inbox, but the notification failed.',
    to: '/admin/messages',
    action: 'See why',
  }));

  check(Boolean(state.settings?.resumeUrl?.trim()), () => ({
    id: 'resume',
    severity: 'warning',
    title: 'No résumé attached',
    detail: 'The footer download button stays hidden until you upload one.',
    to: '/admin/media',
    action: 'Upload a PDF',
  }));

  /* ----------------------------------------------------------- freshness */

  const publishedAt = state.lastPublishedAt ? new Date(state.lastPublishedAt) : null;
  const daysSincePublish =
    publishedAt && !Number.isNaN(publishedAt.getTime())
      ? Math.floor((Date.now() - publishedAt.getTime()) / 86_400_000)
      : null;

  /* ----------------------------------------------------------- unused files */

  const unusedMedia = media.filter((m) => countMediaUsage(m.id) === 0).length;
  const storageBytes = media.reduce((sum, m) => sum + (m.sizeBytes || 0), 0);

  const SEVERITY_RANK: Record<IssueSeverity, number> = { blocking: 0, warning: 1, idea: 2 };
  issues.sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);

  const passed = total - issues.length;

  return {
    issues,
    total,
    passed,
    score: total === 0 ? 100 : Math.round((passed / total) * 100),
    liveProjects: projects.filter((p) => p.status === 'published').length,
    liveCaseStudies: caseStudies.filter((cs) => cs.status === 'published').length,
    daysSincePublish,
    unreadMessages,
    unusedMedia,
    storageBytes,
  };
}
