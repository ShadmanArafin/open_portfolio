import 'server-only';

/**
 * What an upload is allowed to be.
 *
 * The declared `Content-Type` on a multipart part is chosen by whoever is
 * uploading, so it is treated as a hint and nothing more. Every decision here
 * comes from the leading bytes of the file itself, which is the only part an
 * attacker cannot set without also changing what the file is.
 *
 * That closes the shape of attack this project's plan calls out by name: an
 * HTML page named `.pdf`, or a polyglot that is a valid JPEG to an image
 * decoder and a valid script to a browser.
 */

export class UploadRejected extends Error {
  readonly status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = 'UploadRejected';
    this.status = status;
  }
}

export interface SniffedType {
  mimeType: string;
  extension: string;
}

/** Byte-level signatures for everything the media library accepts. */
function sniff(bytes: Uint8Array): SniffedType | null {
  const startsWith = (...sig: number[]) =>
    sig.length <= bytes.length && sig.every((b, i) => bytes[i] === b);

  /** ASCII compare at an offset, for container formats with a tagged header. */
  const ascii = (offset: number, text: string) =>
    offset + text.length <= bytes.length &&
    [...text].every((ch, i) => bytes[offset + i] === ch.charCodeAt(0));

  if (startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) {
    return { mimeType: 'image/png', extension: 'png' };
  }
  if (startsWith(0xff, 0xd8, 0xff)) {
    return { mimeType: 'image/jpeg', extension: 'jpg' };
  }
  if (ascii(0, 'GIF87a') || ascii(0, 'GIF89a')) {
    return { mimeType: 'image/gif', extension: 'gif' };
  }
  if (ascii(0, 'RIFF') && ascii(8, 'WEBP')) {
    return { mimeType: 'image/webp', extension: 'webp' };
  }
  // ISO-BMFF: a four-byte size, then `ftyp`, then the brand.
  if (ascii(4, 'ftyp') && (ascii(8, 'avif') || ascii(8, 'avis'))) {
    return { mimeType: 'image/avif', extension: 'avif' };
  }
  if (ascii(0, '%PDF-')) {
    return { mimeType: 'application/pdf', extension: 'pdf' };
  }
  return null;
}

/** The first 512 bytes as lowercase text, for the checks that need to read it. */
function head(bytes: Uint8Array): string {
  return new TextDecoder('utf-8', { fatal: false })
    .decode(bytes.subarray(0, 512))
    .trimStart()
    .toLowerCase();
}

/** Looks like markup, whatever the extension claims. */
function looksLikeMarkup(bytes: Uint8Array): boolean {
  const text = head(bytes);
  return (
    text.startsWith('<?xml') ||
    text.startsWith('<!doctype') ||
    text.startsWith('<html') ||
    text.startsWith('<svg') ||
    text.includes('<script')
  );
}

/** Specifically SVG, which has its own advice worth giving. */
function looksLikeSvg(bytes: Uint8Array): boolean {
  const text = head(bytes);
  return text.startsWith('<svg') || (text.startsWith('<?xml') && text.includes('<svg'));
}

/**
 * Turns an original filename into a key that is safe on every backend.
 *
 * Flat — no slashes — because Supabase Storage's list endpoint treats `/` as a
 * folder boundary and would stop reporting nested objects. Unique, because two
 * people uploading `screenshot.png` must not overwrite each other.
 */
export function makeMediaKey(originalName: string, extension: string): string {
  const stem = originalName
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);

  const unique = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  return `${stem || 'file'}-${unique}.${extension}`;
}

export interface ValidatedUpload {
  bytes: Uint8Array;
  mimeType: string;
  extension: string;
}

/**
 * Accepts the bytes or explains, in words a non-developer can act on, why not.
 */
export function validateUpload(
  bytes: Uint8Array,
  declaredName: string,
  maxBytes: number
): ValidatedUpload {
  if (bytes.byteLength === 0) {
    throw new UploadRejected('That file is empty.');
  }
  if (bytes.byteLength > maxBytes) {
    const limit = Math.floor(maxBytes / (1024 * 1024));
    throw new UploadRejected(`That file is larger than the ${limit}MB limit.`, 413);
  }

  const sniffed = sniff(bytes);

  if (!sniffed) {
    if (looksLikeSvg(bytes)) {
      throw new UploadRejected(
        'SVG files cannot be uploaded, because a browser will run any script inside them as ' +
          'if you had written it yourself. Export the artwork as PNG or WebP.'
      );
    }
    if (looksLikeMarkup(bytes)) {
      throw new UploadRejected(
        `"${declaredName}" is a web page, not an image or a PDF, whatever its name says.`
      );
    }
    throw new UploadRejected(
      `"${declaredName}" is not a PNG, JPEG, GIF, WebP, AVIF or PDF. Whatever its name says, ` +
        'its contents are something else.'
    );
  }

  // A PDF that also parses as markup is a polyglot; nothing legitimate needs it.
  if (sniffed.mimeType === 'application/pdf' && looksLikeMarkup(bytes)) {
    throw new UploadRejected('That PDF contains embedded markup and was not accepted.');
  }

  return { bytes, mimeType: sniffed.mimeType, extension: sniffed.extension };
}
