import { NextResponse } from 'next/server';
import { getPublishedContent } from '@/core/content/read';
import { resolveSiteUrl } from '@/core/content/metadata';
import { generateVCard } from '@/core/resume/vcard';

/**
 * Public vCard (RFC 6350) download endpoint.
 *
 * Allows recruiters, employers and visitors to download the site owner's
 * contact information directly into their address book (Apple Contacts,
 * Google Contacts, Outlook).
 */
export async function GET() {
  const content = await getPublishedContent();
  const siteUrl = resolveSiteUrl(content);

  const vcard = generateVCard({
    settings: content.settings,
    socialLinks: content.socialLinks,
    siteUrl,
  });

  const rawName = content.settings.fullName?.trim() || 'contact';
  const filename = `${rawName.toLowerCase().replace(/[^a-z0-9_-]+/g, '-')}.vcf`;

  return new NextResponse(vcard, {
    status: 200,
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=3540',
    },
  });
}
