import { parsePage } from '@/core/blocks/lookup';
import { sanitizeHref, sanitizeMediaSrc } from '@/core/security/urls';

/**
 * A piece's blocks as HTML for an RSS `content:encoded` element.
 *
 * A feed reader gets HTML, not a React tree, and it is not running this site's
 * components, theme or client JavaScript. Rather than pretend the whole block
 * set can be reproduced there, this renders what an article is made of - its
 * prose, quotations, images and questions - and leaves out the blocks that only
 * mean something on the page: forms, embeds, video facades, collection views.
 * A feed that carried a broken contact form would be worse than one that
 * carried none.
 *
 * Everything is escaped here. Block props are owner-authored but can arrive
 * through a backup or an import, and a feed is read by software that trusts
 * HTML more than a browser does; the same allowlist the site uses for links and
 * media applies before anything becomes an attribute.
 */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function text(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function absoluteUrl(value: string | null, siteUrl: string): string | null {
  if (!value) return null;
  if (!value.startsWith('/')) return value;
  return siteUrl.replace(/\/$/, '') + value;
}

function mediaSrc(raw: unknown, siteUrl: string): string | null {
  const safe = sanitizeMediaSrc(typeof raw === 'string' ? raw : null);
  return absoluteUrl(safe, siteUrl);
}

function figure(
  image: { src?: unknown; alt?: unknown; decorative?: unknown; caption?: unknown },
  siteUrl: string
): string | null {
  const src = mediaSrc(image.src, siteUrl);
  if (!src) return null;
  const alt = image.decorative ? '' : (text(image.alt) ?? '');
  const caption = text(image.caption);
  return [
    '<figure>',
    `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" />`,
    caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : '',
    '</figure>',
  ]
    .filter(Boolean)
    .join('');
}

type Props = Record<string, unknown>;

function blockHtml(type: string, props: Props, siteUrl: string): string | null {
  switch (type) {
    case 'richText': {
      const heading = text(props.heading);
      const paragraphs = Array.isArray(props.paragraphs)
        ? props.paragraphs.filter((paragraph): paragraph is string => typeof paragraph === 'string')
        : [];
      const body = paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('');
      if (!heading && !body) return null;
      return `${heading ? `<h2>${escapeHtml(heading)}</h2>` : ''}${body}`;
    }

    case 'quote': {
      const quote = text(props.quote);
      if (!quote) return null;
      const who = [text(props.attribution), text(props.role)].filter(Boolean).join(' · ');
      return [
        '<figure>',
        `<blockquote><p>${escapeHtml(quote)}</p></blockquote>`,
        who ? `<figcaption>${escapeHtml(who)}</figcaption>` : '',
        '</figure>',
      ]
        .filter(Boolean)
        .join('');
    }

    case 'image': {
      const media = (props.media ?? {}) as Record<string, unknown>;
      return figure({ ...media, caption: props.caption ?? media.caption }, siteUrl) ?? null;
    }

    case 'gallery': {
      const heading = text(props.heading);
      const items = Array.isArray(props.items) ? props.items : [];
      const figures = items
        .map((item) => figure((item ?? {}) as Record<string, unknown>, siteUrl))
        .filter(Boolean)
        .join('');
      if (!heading && !figures) return null;
      return `${heading ? `<h2>${escapeHtml(heading)}</h2>` : ''}${figures}`;
    }

    case 'faq': {
      const heading = text(props.heading);
      const items = Array.isArray(props.items) ? props.items : [];
      const pairs = items
        .map((item) => {
          const entry = (item ?? {}) as Record<string, unknown>;
          const question = text(entry.question);
          const answer = text(entry.answer);
          if (!question || !answer) return '';
          return `<h3>${escapeHtml(question)}</h3><p>${escapeHtml(answer)}</p>`;
        })
        .join('');
      if (!heading && !pairs) return null;
      return `${heading ? `<h2>${escapeHtml(heading)}</h2>` : ''}${pairs}`;
    }

    case 'download': {
      const href = absoluteUrl(sanitizeHref(text(props.file)), siteUrl);
      const label = text(props.label);
      if (!href || !label) return null;
      const description = text(props.description);
      return `<p><a href="${escapeHtml(href)}">${escapeHtml(label)}</a>${
        description ? ` — ${escapeHtml(description)}` : ''
      }</p>`;
    }

    case 'separator':
      return props.rule === false ? null : '<hr />';

    default:
      // Layout, collection and interactive blocks: see the file note.
      return null;
  }
}

export function writingFeedHtml(blocks: unknown[], siteUrl: string): string {
  const out: string[] = [];
  for (const entry of parsePage(blocks)) {
    if (entry.kind !== 'block' || entry.block.hidden) continue;
    const block = entry.block as { type: string; props: unknown };
    const props =
      block.props && typeof block.props === 'object' && !Array.isArray(block.props)
        ? (block.props as Props)
        : {};
    const html = blockHtml(block.type, props, siteUrl);
    if (html) out.push(html);
  }
  return out.join('\n');
}

/**
 * `]]>` inside CDATA would end the section early, so split it the standard way:
 * close, emit the bracket as text, reopen.
 */
export function cdata(html: string): string {
  return `<![CDATA[${html.split(']]>').join(']]]]><![CDATA[>')}]]>`;
}
