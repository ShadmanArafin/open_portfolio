import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { isZip, readZip, writeZip, ZipError } from '../zip';

const text = (s: string) => new TextEncoder().encode(s);

describe('zip', () => {
  it('round-trips text and binary, deflating only where it helps', () => {
    const random = new Uint8Array(4096).map(() => Math.floor(Math.random() * 256));
    const entries = [
      { name: 'backup.json', data: text(JSON.stringify({ a: 'x'.repeat(5000) })) },
      { name: 'media/photo-1.jpg', data: random },
      { name: 'media/café.txt', data: text('unicode names') },
    ];
    const zip = writeZip(entries);
    expect(isZip(zip)).toBe(true);
    expect(zip.length).toBeLessThan(5000 + 4096);
    expect(readZip(zip)).toEqual(entries);
  });

  it('writes archives the system unzip tool accepts', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'opb-zip-'));
    try {
      const file = path.join(dir, 'site.zip');
      writeFileSync(file, writeZip([{ name: 'backup.json', data: text('{"ok":true}') }]));
      let listed = '';
      try {
        listed = execFileSync('unzip', ['-l', file], { encoding: 'utf8' });
      } catch {
        return; // no unzip on this machine; the round trip above still holds
      }
      expect(listed).toContain('backup.json');
      execFileSync('unzip', ['-o', '-q', file, '-d', dir]);
      expect(readFileSync(path.join(dir, 'backup.json'), 'utf8')).toBe('{"ok":true}');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('refuses something that is not a zip, and a damaged one', () => {
    expect(() => readZip(text('not a zip at all, just words'))).toThrow(ZipError);
    const zip = writeZip([{ name: 'a.txt', data: text('hello world hello world') }]);
    zip[40] ^= 0xff; // flip a byte in the body
    expect(() => readZip(zip)).toThrow(ZipError);
  });
});

describe('zip timestamps', () => {
  it('stamps a real MS-DOS date, not month 0 of 1980', () => {
    const zip = writeZip(
      [{ name: 'a.txt', data: new TextEncoder().encode('a') }],
      new Date(Date.UTC(2026, 9, 21, 13, 45, 30))
    );
    const view = new DataView(zip.buffer, zip.byteOffset);
    const date = view.getUint16(12, true);
    expect([(date >> 9) + 1980, (date >> 5) & 0xf, date & 0x1f]).toEqual([2026, 10, 21]);
    const time = view.getUint16(10, true);
    expect([time >> 11, (time >> 5) & 0x3f, (time & 0x1f) * 2]).toEqual([13, 45, 30]);
  });
});
