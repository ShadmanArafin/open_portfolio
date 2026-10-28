import { describe, expect, it } from 'vitest';
import { parseExif } from '../exif';

describe('Client-side EXIF Metadata Parser', () => {
  it('returns null for empty or non-JPEG buffers', () => {
    expect(parseExif(new ArrayBuffer(0))).toBe(null);
    expect(parseExif(new Uint8Array([0x00, 0x01, 0x02]).buffer)).toBe(null);
    expect(parseExif(new Uint8Array([0x89, 0x50, 0x4e, 0x47]).buffer)).toBe(null); // PNG
  });

  it('rejects truncated JPEG segments without throwing', () => {
    const truncated = new Uint8Array([0xff, 0xd8, 0xff, 0xe1, 0x00, 0x20, 0x45, 0x78]).buffer;
    expect(() => parseExif(truncated)).not.toThrow();
    expect(parseExif(truncated)).toBe(null);
  });

  it('parses structured EXIF tags from a constructed JPEG APP1 buffer', () => {
    // Construct a minimal valid JPEG with an APP1 Exif marker
    const tiffHeader = [
      0x49,
      0x49, // 'II' little endian
      0x2a,
      0x00, // 42
      0x08,
      0x00,
      0x00,
      0x00, // offset to IFD0 (8 bytes)
    ];

    // IFD0 entries: 2 tags (Make, Model)
    const numEntries = [0x02, 0x00];
    const makeTag = [
      0x0f,
      0x01, // Tag 0x010F Make
      0x02,
      0x00, // Type 2 (ASCII)
      0x05,
      0x00,
      0x00,
      0x00, // Count 5 ("Sony\0")
      0x26,
      0x00,
      0x00,
      0x00, // Offset to value in TIFF space (38)
    ];
    const modelTag = [
      0x10,
      0x01, // Tag 0x0110 Model
      0x02,
      0x00, // Type 2 (ASCII)
      0x09,
      0x00,
      0x00,
      0x00, // Count 9 ("ILCE-7M4\0")
      0x2b,
      0x00,
      0x00,
      0x00, // Offset to value in TIFF space (43)
    ];
    const nextIfd = [0x00, 0x00, 0x00, 0x00];
    const stringValues = Buffer.from('Sony\0ILCE-7M4\0', 'ascii');

    const app1Data = Buffer.concat([
      Buffer.from('Exif\0\0', 'ascii'),
      Buffer.from(tiffHeader),
      Buffer.from(numEntries),
      Buffer.from(makeTag),
      Buffer.from(modelTag),
      Buffer.from(nextIfd),
      stringValues,
    ]);

    const app1Length = app1Data.length + 2;
    const jpeg = Buffer.concat([
      Buffer.from([0xff, 0xd8]), // SOI
      Buffer.from([0xff, 0xe1]), // APP1 marker
      Buffer.from([(app1Length >> 8) & 0xff, app1Length & 0xff]),
      app1Data,
      Buffer.from([0xff, 0xd9]), // EOI
    ]);

    const exif = parseExif(jpeg.buffer.slice(jpeg.byteOffset, jpeg.byteOffset + jpeg.byteLength));
    expect(exif).not.toBe(null);
    expect(exif?.make).toBe('Sony');
    expect(exif?.model).toBe('ILCE-7M4');
    expect(exif?.formattedSummary).toContain('Sony ILCE-7M4');
  });
});
