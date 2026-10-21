/**
 * The admin's sections, in the order the nav shows them.
 *
 * Kept out of `layout.tsx` — a page file's exports are Next's business — and
 * out of the nav itself, so the test that checks every href is a real route
 * reads the same list the nav renders instead of a copy that can drift.
 */
export type AdminGroup = 'Build' | 'Profile' | 'Audience' | 'Look & reach' | 'System';

export type AdminSection = { href: string; label: string; group?: AdminGroup };

/**
 * Twenty-five links in one wrapped row asked a person to scan all of them to
 * find one (Hick's law), and gave the eye nothing to hold on to (Miller's).
 * Grouped by what someone came to do, the same links read as five small
 * lists. The order below is the order on screen, group by group.
 *
 * Case studies is listed for sites that still have legacy case-study records
 * only (`withLegacyCaseStudies`): since the work merge a new site has nothing
 * to put there, and a menu entry for an empty screen is a question nobody
 * should have to ask.
 */
export const ADMIN_SECTIONS: AdminSection[] = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/pages', label: 'Pages', group: 'Build' },
  { href: '/admin/writing', label: 'Writing', group: 'Build' },
  { href: '/admin/projects', label: 'Projects', group: 'Build' },
  { href: '/admin/case-studies', label: 'Case studies', group: 'Build' },
  { href: '/admin/media', label: 'Media', group: 'Build' },
  { href: '/admin/experience', label: 'Experience', group: 'Profile' },
  { href: '/admin/education', label: 'Education', group: 'Profile' },
  { href: '/admin/brands', label: 'Brands', group: 'Profile' },
  { href: '/admin/recommendations', label: 'Recommendations', group: 'Profile' },
  { href: '/admin/capabilities', label: 'Capabilities', group: 'Profile' },
  { href: '/admin/process', label: 'Process', group: 'Profile' },
  { href: '/admin/artifacts', label: 'Artifacts', group: 'Profile' },
  { href: '/admin/messages', label: 'Messages', group: 'Audience' },
  { href: '/admin/newsletter', label: 'Newsletter', group: 'Audience' },
  { href: '/admin/analytics', label: 'Analytics', group: 'Audience' },
  { href: '/admin/appearance', label: 'Appearance', group: 'Look & reach' },
  { href: '/admin/navigation', label: 'Navigation', group: 'Look & reach' },
  { href: '/admin/seo', label: 'SEO', group: 'Look & reach' },
  { href: '/admin/settings', label: 'Settings', group: 'System' },
  { href: '/admin/services', label: 'Services', group: 'System' },
  { href: '/admin/storage', label: 'Storage', group: 'System' },
  { href: '/admin/your-site', label: 'Your site', group: 'System' },
  { href: '/admin/history', label: 'History', group: 'System' },
  { href: '/admin/help', label: 'Help', group: 'System' },
];

export function withLegacyCaseStudies(hasLegacy: boolean): AdminSection[] {
  return hasLegacy
    ? ADMIN_SECTIONS
    : ADMIN_SECTIONS.filter((section) => section.href !== '/admin/case-studies');
}

/** Consecutive runs of one group, in order. Dashboard stands alone. */
export function groupSections(
  sections: AdminSection[]
): { group: AdminGroup | null; sections: AdminSection[] }[] {
  const groups: { group: AdminGroup | null; sections: AdminSection[] }[] = [];
  for (const section of sections) {
    const group = section.group ?? null;
    const last = groups.at(-1);
    if (last && last.group === group) last.sections.push(section);
    else groups.push({ group, sections: [section] });
  }
  return groups;
}
