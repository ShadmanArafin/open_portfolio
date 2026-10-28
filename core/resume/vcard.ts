import type { SiteSettings, SocialLinkItem } from '@/cms/types/cms';

/**
 * RFC 6350 (vCard 4.0) generator.
 *
 * Dependency-free, in-process, and RFC-compliant:
 * - UTF-8 character encoding.
 * - Proper escaping for commas, semicolons, and backslashes.
 * - Line folding at 75 octets per RFC 6350 §3.2.
 * - CRLF line endings (\r\n).
 */

function escapeValue(val: string): string {
  return val
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * Folds lines longer than 75 octets with CRLF followed by a space.
 */
function foldLine(line: string): string {
  const maxBytes = 75;
  const buf = Buffer.from(line, 'utf-8');
  if (buf.length <= maxBytes) return line;

  const chunks: string[] = [];
  let current = '';
  let currentBytes = 0;

  for (const char of line) {
    const charBytes = Buffer.byteLength(char, 'utf-8');
    if (currentBytes + charBytes > (chunks.length === 0 ? maxBytes : maxBytes - 1)) {
      chunks.push(current);
      current = char;
      currentBytes = charBytes;
    } else {
      current += char;
      currentBytes += charBytes;
    }
  }
  if (current) chunks.push(current);

  return chunks.join('\r\n ');
}

export interface VCardOptions {
  settings: Partial<SiteSettings>;
  socialLinks?: SocialLinkItem[];
  siteUrl?: string;
}

export function generateVCard({ settings, socialLinks = [], siteUrl }: VCardOptions): string {
  const lines: string[] = ['BEGIN:VCARD', 'VERSION:4.0'];

  const fullName = settings.fullName?.trim() || 'Portfolio Owner';
  lines.push(`FN:${escapeValue(fullName)}`);

  // Split Name for structured N field (Family;Given;Additional;Prefix;Suffix)
  const parts = fullName.split(/\s+/);
  if (parts.length > 1) {
    const given = parts[0];
    const family = parts.slice(1).join(' ');
    lines.push(`N:${escapeValue(family)};${escapeValue(given)};;;`);
  } else {
    lines.push(`N:${escapeValue(fullName)};;;;`);
  }

  if (settings.role?.trim()) {
    lines.push(`TITLE:${escapeValue(settings.role.trim())}`);
  }

  if (settings.email?.trim()) {
    lines.push(`EMAIL;TYPE=work:${escapeValue(settings.email.trim())}`);
  }

  const url = siteUrl?.trim() || settings.siteUrl?.trim();
  if (url) {
    lines.push(`URL:${escapeValue(url)}`);
  }

  if (settings.location?.trim()) {
    lines.push(`ADR;TYPE=work:;;;${escapeValue(settings.location.trim())};;;`);
  }

  if (settings.aboutStoryParagraphs?.[0]) {
    const note = settings.aboutStoryParagraphs[0].trim();
    lines.push(`NOTE:${escapeValue(note)}`);
  }

  for (const link of socialLinks) {
    if (link.visible && link.url?.trim()) {
      lines.push(
        `URL;TYPE=${escapeValue(link.label || link.iconType)}:${escapeValue(link.url.trim())}`
      );
    }
  }

  lines.push('END:VCARD');

  return lines.map(foldLine).join('\r\n') + '\r\n';
}
