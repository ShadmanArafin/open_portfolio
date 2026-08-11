import { describe, expect, it } from 'vitest';
import { makeMediaKey, UploadRejected, validateUpload } from '../validate';

/**
 * Uploads are the one place a stranger's bytes become a file this site serves,
 * so the tests here are all about what must be refused. The accepted cases are
 * the easy half.
 */

const MB = 1024 * 1024;
const LIMIT = 5 * MB;

function bytes(...values: number[]): Uint8Array {
  return new Uint8Array(values);
}

function ascii(text: string): Uint8Array {
  return new Uint8Array([...text].map((c) => c.charCodeAt(0)));
}

/** Real leading bytes for each accepted format, padded to a plausible length. */
const PNG = bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13);
const JPEG = bytes(0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46);
const GIF = new Uint8Array([...ascii('GIF89a'), 0x01, 0x00]);
const WEBP = new Uint8Array([...ascii('RIFF'), 0, 0, 0, 0, ...ascii('WEBP')]);
const AVIF = new Uint8Array([0, 0, 0, 0x20, ...ascii('ftyp'), ...ascii('avif')]);
const PDF = ascii('%PDF-1.7\n1 0 obj\n');

describe('upload validation', () => {
  describe('accepts', () => {
    const cases: [string, Uint8Array, string, string][] = [
      ['PNG', PNG, 'image/png', 'png'],
      ['JPEG', JPEG, 'image/jpeg', 'jpg'],
      ['GIF', GIF, 'image/gif', 'gif'],
      ['WebP', WEBP, 'image/webp', 'webp'],
      ['AVIF', AVIF, 'image/avif', 'avif'],
      ['PDF', PDF, 'application/pdf', 'pdf'],
    ];

    for (const [label, data, mimeType, extension] of cases) {
      it(`a real ${label}`, () => {
        const result = validateUpload(data, `thing.${extension}`, LIMIT);
        expect(result.mimeType).toBe(mimeType);
        expect(result.extension).toBe(extension);
      });
    }

    it('the type from the bytes, not from the filename', () => {
      // A genuine PNG that someone named `.jpg`. The bytes decide.
      expect(validateUpload(PNG, 'mislabelled.jpg', LIMIT).mimeType).toBe('image/png');
    });
  });

  describe('refuses', () => {
    it('an HTML page named .pdf, and says so rather than talking about SVG', () => {
      const html = ascii('<!DOCTYPE html><html><body><script>alert(1)</script></body></html>');
      try {
        validateUpload(html, 'invoice.pdf', LIMIT);
        throw new Error('should have been rejected');
      } catch (err) {
        expect(err instanceof UploadRejected).toBe(true);
        expect((err as Error).message.includes('is a web page')).toBe(true);
      }
    });

    it('an SVG, with an explanation of why', () => {
      const svg = ascii('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"></svg>');
      try {
        validateUpload(svg, 'logo.svg', LIMIT);
        throw new Error('should have been rejected');
      } catch (err) {
        expect(err instanceof UploadRejected).toBe(true);
        // The message has to tell a non-developer what to do instead.
        expect((err as Error).message.includes('PNG or WebP')).toBe(true);
      }
    });

    it('an XML document dressed as an image', () => {
      const xml = ascii('<?xml version="1.0"?><svg><script>alert(1)</script></svg>');
      expect(() => validateUpload(xml, 'chart.png', LIMIT)).toThrow(UploadRejected);
    });

    it('a PDF carrying embedded markup', () => {
      const polyglot = new Uint8Array([...PDF, ...ascii('<script>alert(1)</script>')]);
      expect(() => validateUpload(polyglot, 'cv.pdf', LIMIT)).toThrow(UploadRejected);
    });

    it('plain text with no signature at all', () => {
      expect(() => validateUpload(ascii('just some words'), 'notes.png', LIMIT)).toThrow(
        UploadRejected
      );
    });

    it('an empty file', () => {
      expect(() => validateUpload(new Uint8Array(0), 'nothing.png', LIMIT)).toThrow(UploadRejected);
    });

    it('anything over the limit, with a 413', () => {
      const huge = new Uint8Array(LIMIT + 1);
      huge.set(PNG);
      try {
        validateUpload(huge, 'enormous.png', LIMIT);
        throw new Error('should have been rejected');
      } catch (err) {
        expect((err as UploadRejected).status).toBe(413);
      }
    });

    it('a file that is one byte too short of a signature', () => {
      // Truncation must not be read as a match against a shorter prefix.
      expect(() => validateUpload(bytes(0x89, 0x50), 'cut-off.png', LIMIT)).toThrow(UploadRejected);
    });
  });
});

describe('media keys', () => {
  it('keeps the readable part of the original name', () => {
    expect(makeMediaKey('My Project Shot.PNG', 'png')).toMatch(/^my-project-shot-[a-z0-9]+\.png$/);
  });

  it('never contains a slash', () => {
    // Supabase Storage treats `/` as a folder boundary and would stop listing
    // the object; the local adapter would write outside its media directory.
    const key = makeMediaKey('../../etc/passwd', 'png');
    expect(key.includes('/')).toBe(false);
    expect(key.includes('..')).toBe(false);
  });

  it('survives a name with nothing usable in it', () => {
    expect(makeMediaKey('***.png', 'png')).toMatch(/^file-[a-z0-9]+\.png$/);
  });

  it('does not collide across rapid uploads of the same name', () => {
    const keys = new Set(Array.from({ length: 200 }, () => makeMediaKey('shot.png', 'png')));
    expect(keys.size).toBe(200);
  });
});
