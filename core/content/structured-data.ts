import type { BreadcrumbList, Person, ProfilePage, WebSite, WithContext } from 'schema-dts';
import type { CMSState } from '@/cms/types/cms';
import { profileLinks } from './profiles';
import { resolveSiteUrl } from './metadata';
import { isWelcomePlaceholder } from './welcome';

/**
 * Schema.org data for the pages that say who the site is about.
 *
 * Search engines and the assistants that answer questions from the web read
 * this rather than guess from layout: the home page is a `WebSite`, the About
 * page a `ProfilePage` whose subject is a `Person` with their role and their
 * profiles elsewhere (`sameAs`, the same links that carry `rel="me"`), and
 * detail pages carry a `BreadcrumbList` back to their section.
 *
 * Every builder returns null rather than half an object: without the site's
 * own address the URLs cannot be absolute, and a placeholder name is not an
 * identity worth publishing.
 */

/** A Person with the `@id` the other objects point at, which schema-dts types loosely. */
type IdentifiedPerson = Exclude<Person, string> & { '@id': string; name: string };

function absolute(siteUrl: string, path: string | undefined): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return path.startsWith('/') ? `${siteUrl}${path}` : undefined;
}

export function personFor(content: CMSState): IdentifiedPerson | null {
  const siteUrl = resolveSiteUrl(content);
  const name = content.settings?.fullName?.trim();
  if (!siteUrl || !name || isWelcomePlaceholder(name)) return null;
  const image = absolute(siteUrl, content.settings.portraitPath || content.settings.avatarPath);
  const sameAs = profileLinks(content.socialLinks);
  return {
    '@type': 'Person',
    '@id': `${siteUrl}/#person`,
    name,
    url: siteUrl,
    ...(content.settings.role ? { jobTitle: content.settings.role } : {}),
    ...(image ? { image } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function websiteFor(content: CMSState): WithContext<WebSite> | null {
  const siteUrl = resolveSiteUrl(content);
  const person = personFor(content);
  if (!siteUrl || !person) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    url: siteUrl,
    name: content.seo?.siteTitle?.trim() || person.name,
    ...(content.seo?.metaDescription ? { description: content.seo.metaDescription } : {}),
    publisher: { '@id': person['@id'] },
    ...(content.settings?.language ? { inLanguage: content.settings.language } : {}),
  };
}

export function profilePageFor(content: CMSState): WithContext<ProfilePage> | null {
  const siteUrl = resolveSiteUrl(content);
  const person = personFor(content);
  if (!siteUrl || !person) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: `${siteUrl}/about`,
    mainEntity: person,
    ...(content.lastPublishedAt ? { dateModified: content.lastPublishedAt } : {}),
  };
}

export function breadcrumbsFor(
  content: CMSState,
  trail: { name: string; path: string }[]
): WithContext<BreadcrumbList> | null {
  const siteUrl = resolveSiteUrl(content);
  if (!siteUrl || trail.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${siteUrl}${crumb.path}`,
    })),
  };
}
