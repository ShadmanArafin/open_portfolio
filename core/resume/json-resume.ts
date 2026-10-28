import { z } from 'zod';
import type {
  CapabilityGroupItem,
  CMSState,
  EducationItem,
  ExperienceItem,
  SocialLinkItem,
  SocialPlatformId,
} from '@/cms/types/cms';

/**
 * Standard JSON Resume (schema.jsonresume.org) parser and exporter.
 *
 * Implements the open JSON Resume specification v1.0.0.
 * Allows students to export their portfolio career data in standard format
 * or import existing resumes from LinkedIn / Reactive Resume exports.
 */

const jsonResumeProfileSchema = z.object({
  network: z.string().optional(),
  username: z.string().optional(),
  url: z.string().optional(),
});

const jsonResumeWorkSchema = z.object({
  name: z.string().optional(),
  position: z.string().optional(),
  url: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  summary: z.string().optional(),
  highlights: z.array(z.string()).optional(),
});

const jsonResumeEducationSchema = z.object({
  institution: z.string().optional(),
  url: z.string().optional(),
  area: z.string().optional(),
  studyType: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  score: z.string().optional(),
  courses: z.array(z.string()).optional(),
});

const jsonResumeSkillSchema = z.object({
  name: z.string().optional(),
  level: z.string().optional(),
  keywords: z.array(z.string()).optional(),
});

const jsonResumeProjectSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  url: z.string().optional(),
  roles: z.array(z.string()).optional(),
  entity: z.string().optional(),
  type: z.string().optional(),
});

export const jsonResumeSchema = z.object({
  $schema: z.string().optional(),
  basics: z
    .object({
      name: z.string().optional(),
      label: z.string().optional(),
      image: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      url: z.string().optional(),
      summary: z.string().optional(),
      location: z
        .object({
          address: z.string().optional(),
          postalCode: z.string().optional(),
          city: z.string().optional(),
          countryCode: z.string().optional(),
          region: z.string().optional(),
        })
        .optional(),
      profiles: z.array(jsonResumeProfileSchema).optional(),
    })
    .optional(),
  work: z.array(jsonResumeWorkSchema).optional(),
  education: z.array(jsonResumeEducationSchema).optional(),
  skills: z.array(jsonResumeSkillSchema).optional(),
  projects: z.array(jsonResumeProjectSchema).optional(),
});

export type JsonResume = z.infer<typeof jsonResumeSchema>;

/**
 * Serialises current CMSState into standard JSON Resume format.
 */
export function exportToJsonResume(content: CMSState): JsonResume {
  const {
    settings,
    experience = [],
    education = [],
    capabilityGroups = [],
    projects = [],
  } = content;

  const profiles = (content.socialLinks ?? [])
    .filter((link) => link.visible && link.url)
    .map((link) => ({
      network: link.label || link.iconType,
      username: link.name || undefined,
      url: link.url,
    }));

  const work = experience.map((exp) => ({
    name: exp.company,
    position: exp.role,
    url: exp.companyUrl || undefined,
    startDate: exp.startDate || undefined,
    endDate: exp.current ? undefined : exp.endDate || undefined,
    summary: exp.summary,
    highlights: exp.highlights?.length ? exp.highlights : undefined,
  }));

  const edu = education.map((ed) => ({
    institution: ed.institution,
    url: ed.institutionUrl || undefined,
    studyType: ed.degree,
    startDate: undefined,
    endDate: ed.yearLabel || undefined,
  }));

  const skills = capabilityGroups.map((group) => ({
    name: group.title,
    keywords: group.capabilities,
  }));

  const projs = projects
    .filter((p) => p.status === 'published')
    .map((p) => ({
      name: p.title || p.name,
      description: p.shortDescription,
      highlights: p.deliverables?.length ? p.deliverables : undefined,
      url: p.liveUrl || p.siteUrl || undefined,
    }));

  return {
    $schema: 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
    basics: {
      name: settings.fullName || undefined,
      label: settings.role || undefined,
      image: settings.portraitPath || settings.avatarPath || undefined,
      email: settings.email || undefined,
      url: settings.siteUrl || undefined,
      summary: settings.aboutStoryParagraphs?.[0] || undefined,
      location: settings.location ? { city: settings.location } : undefined,
      profiles: profiles.length ? profiles : undefined,
    },
    work: work.length ? work : undefined,
    education: edu.length ? edu : undefined,
    skills: skills.length ? skills : undefined,
    projects: projs.length ? projs : undefined,
  };
}

/**
 * Normalises an icon type string into a recognized SocialPlatformId.
 */
function inferPlatformId(network?: string): SocialPlatformId {
  if (!network) return 'website';
  const clean = network.toLowerCase().trim();
  const known: Record<string, SocialPlatformId> = {
    github: 'github',
    linkedin: 'linkedin',
    twitter: 'twitter',
    x: 'twitter',
    dribbble: 'dribbble',
    behance: 'behance',
    figma: 'figma',
    instagram: 'instagram',
    youtube: 'youtube',
    medium: 'medium',
    bluesky: 'bluesky',
    mastodon: 'mastodon',
    codepen: 'codepen',
  };
  return known[clean] || 'website';
}

/**
 * Imports a JSON Resume object into existing CMSState.
 * Merges career information without overwriting theme or system settings.
 */
export function importFromJsonResume(raw: unknown, existing: CMSState): CMSState {
  const parsed = jsonResumeSchema.parse(raw);
  const updated: CMSState = JSON.parse(JSON.stringify(existing));

  if (parsed.basics) {
    const { name, label, email, location, summary, url } = parsed.basics;
    if (name) updated.settings.fullName = name;
    if (label) updated.settings.role = label;
    if (email) updated.settings.email = email;
    if (url) updated.settings.siteUrl = url;
    if (location?.city) {
      updated.settings.location = [location.city, location.region, location.countryCode]
        .filter(Boolean)
        .join(', ');
    }
    if (summary) {
      updated.settings.aboutStoryParagraphs = [summary];
    }
  }

  // Work -> Experience
  if (parsed.work && parsed.work.length > 0) {
    const newExp: ExperienceItem[] = parsed.work.map((w, index) => {
      const isCurrent = !w.endDate || w.endDate.toLowerCase() === 'present';
      const period = w.startDate
        ? `${w.startDate} — ${isCurrent ? 'Present' : w.endDate}`
        : 'Past Experience';

      return {
        id: `exp_import_${Date.now()}_${index}`,
        period,
        startDate: w.startDate,
        endDate: isCurrent ? undefined : w.endDate,
        type: 'Full-time',
        role: w.position || 'Contributor',
        company: w.name || 'Company',
        companyUrl: w.url,
        current: isCurrent,
        summary: w.summary || '',
        highlights: w.highlights || [],
        sortOrder: index + 1,
        visible: true,
      };
    });
    updated.experience = newExp;
  }

  // Education
  if (parsed.education && parsed.education.length > 0) {
    const newEdu: EducationItem[] = parsed.education.map((e, index) => ({
      id: `edu_import_${Date.now()}_${index}`,
      number: String(index + 1).padStart(2, '0'),
      yearLabel: e.endDate || e.startDate || 'Recent',
      degree: e.studyType ? `${e.studyType}${e.area ? ` in ${e.area}` : ''}` : e.area || 'Degree',
      institution: e.institution || 'University',
      institutionUrl: e.url,
      status: e.endDate ? 'Graduated' : 'In Progress',
      isCurrent: !e.endDate,
      sortOrder: index + 1,
      visible: true,
    }));
    updated.education = newEdu;
  }

  // Skills -> CapabilityGroups
  if (parsed.skills && parsed.skills.length > 0) {
    const newSkills: CapabilityGroupItem[] = parsed.skills.map((s, index) => ({
      id: `skill_import_${Date.now()}_${index}`,
      number: String(index + 1).padStart(2, '0'),
      title: s.name || 'Skills',
      description: s.level ? `Proficiency: ${s.level}` : '',
      capabilities: s.keywords || [],
      sortOrder: index + 1,
      visible: true,
    }));
    updated.capabilityGroups = newSkills;
  }

  // Profiles -> Social Links
  if (parsed.basics?.profiles && parsed.basics.profiles.length > 0) {
    const newSocials: SocialLinkItem[] = parsed.basics.profiles
      .filter((p) => p.url)
      .map((p, index) => ({
        id: `soc_import_${Date.now()}_${index}`,
        label: p.network || 'Profile',
        name: p.username || p.network || 'Social',
        url: p.url!,
        iconType: inferPlatformId(p.network),
        visible: true,
        sortOrder: index + 1,
      }));
    if (newSocials.length > 0) {
      updated.socialLinks = newSocials;
    }
  }

  return updated;
}
