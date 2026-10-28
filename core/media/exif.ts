/**
 * Pure TypeScript client-side EXIF parser for JPEG and TIFF images.
 *
 * Inspired by Immich and PhotoPrism:
 * Extracts camera body, lens model, focal length, aperture, shutter speed,
 * and ISO ratings directly from the image ArrayBuffer with zero external
 * dependencies and zero server load.
 */

export interface ExifData {
  make?: string;
  model?: string;
  lensModel?: string;
  focalLength?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: number;
  dateTime?: string;
  formattedSummary?: string;
}

export function parseExif(buffer: ArrayBuffer): ExifData | null {
  const view = new DataView(buffer);
  if (view.byteLength < 16) return null;

  // Check JPEG SOI (0xFFD8)
  if (view.getUint16(0) !== 0xffd8) return null;

  let offset = 2;
  while (offset < view.byteLength - 4) {
    const marker = view.getUint16(offset);
    offset += 2;

    // APP1 marker (0xFFE1) carries EXIF
    if (marker === 0xffe1) {
      const length = view.getUint16(offset);
      offset += 2;
      return parseApp1(view, offset, length - 2);
    }

    // Skip other markers (0xFFE0 - 0xFFEF, etc.)
    if ((marker & 0xff00) === 0xff00 && marker !== 0xffd8 && marker !== 0xffd9) {
      const len = view.getUint16(offset);
      offset += len;
    } else {
      break;
    }
  }

  return null;
}

function parseApp1(view: DataView, offset: number, length: number): ExifData | null {
  // Check "Exif\0\0" header (0x45 0x78 0x69 0x66 0x00 0x00)
  if (view.getUint32(offset) !== 0x45786966 || view.getUint16(offset + 4) !== 0x0000) {
    return null;
  }

  const tiffOffset = offset + 6;
  const isLittleEndian = view.getUint16(tiffOffset) === 0x4949; // "II" vs "MM"

  // Check 0x002A marker
  if (view.getUint16(tiffOffset + 2, isLittleEndian) !== 0x002a) return null;

  const firstIfdOffset = view.getUint32(tiffOffset + 4, isLittleEndian);
  if (firstIfdOffset < 8 || firstIfdOffset > length) return null;

  const result: ExifData = {};
  parseIfd(view, tiffOffset, tiffOffset + firstIfdOffset, isLittleEndian, result);

  result.formattedSummary = buildSummary(result);
  return result;
}

function parseIfd(
  view: DataView,
  tiffOffset: number,
  ifdOffset: number,
  isLittleEndian: boolean,
  out: ExifData
) {
  if (ifdOffset + 2 > view.byteLength) return;
  const entriesCount = view.getUint16(ifdOffset, isLittleEndian);

  let exifSubIfdOffset = 0;

  for (let i = 0; i < entriesCount; i++) {
    const entryOffset = ifdOffset + 2 + i * 12;
    if (entryOffset + 12 > view.byteLength) break;

    const tag = view.getUint16(entryOffset, isLittleEndian);
    const type = view.getUint16(entryOffset + 2, isLittleEndian);
    const count = view.getUint32(entryOffset + 4, isLittleEndian);

    const typeSizes: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 };
    const byteSize = (typeSizes[type] || 1) * count;
    const valOffset =
      byteSize <= 4
        ? entryOffset + 8
        : tiffOffset + view.getUint32(entryOffset + 8, isLittleEndian);

    switch (tag) {
      case 0x010f: // Make
        out.make = readString(view, valOffset, count);
        break;
      case 0x0110: // Model
        out.model = readString(view, valOffset, count);
        break;
      case 0x8769: // Exif SubIFD Offset
        exifSubIfdOffset = tiffOffset + view.getUint32(entryOffset + 8, isLittleEndian);
        break;
      case 0x829a: // ExposureTime
        out.shutterSpeed = readFraction(view, valOffset, isLittleEndian);
        break;
      case 0x829d: // FNumber
        out.aperture = `f/${readRational(view, valOffset, isLittleEndian).toFixed(1)}`;
        break;
      case 0x8827: // ISO
        out.iso = view.getUint16(entryOffset + 8, isLittleEndian);
        break;
      case 0x920a: // FocalLength
        out.focalLength = `${readRational(view, valOffset, isLittleEndian).toFixed(0)}mm`;
        break;
      case 0xa434: // LensModel
        out.lensModel = readString(view, valOffset, count);
        break;
      case 0x9003: // DateTimeOriginal
        out.dateTime = readString(view, valOffset, count);
        break;
    }
  }

  if (exifSubIfdOffset > 0 && exifSubIfdOffset < view.byteLength) {
    parseIfd(view, tiffOffset, exifSubIfdOffset, isLittleEndian, out);
  }
}

function readString(view: DataView, offset: number, maxLen: number): string {
  if (offset + maxLen > view.byteLength) maxLen = view.byteLength - offset;
  let str = '';
  for (let i = 0; i < maxLen; i++) {
    const char = view.getUint8(offset + i);
    if (char === 0) break;
    str += String.fromCharCode(char);
  }
  return str.trim();
}

function readRational(view: DataView, offset: number, isLittleEndian: boolean): number {
  if (offset + 8 > view.byteLength) return 0;
  const num = view.getUint32(offset, isLittleEndian);
  const den = view.getUint32(offset + 4, isLittleEndian);
  return den === 0 ? 0 : num / den;
}

function readFraction(view: DataView, offset: number, isLittleEndian: boolean): string {
  if (offset + 8 > view.byteLength) return '';
  const num = view.getUint32(offset, isLittleEndian);
  const den = view.getUint32(offset + 4, isLittleEndian);
  if (den === 0) return '';
  if (num === 1) return `1/${den}s`;
  if (num >= den) return `${(num / den).toFixed(1)}s`;
  return `${num}/${den}s`;
}

function buildSummary(exif: ExifData): string {
  const parts: string[] = [];
  const camera = [exif.make, exif.model]
    .filter(Boolean)
    .join(' ')
    .replace(/\b(\w+)\s+\1\b/i, '$1'); // deduplicate if model already contains make
  if (camera) parts.push(camera);
  if (exif.focalLength) parts.push(exif.focalLength);
  if (exif.aperture) parts.push(exif.aperture);
  if (exif.shutterSpeed) parts.push(exif.shutterSpeed);
  if (exif.iso) parts.push(`ISO ${exif.iso}`);
  return parts.join(' · ');
}
