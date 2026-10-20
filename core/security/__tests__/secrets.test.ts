import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { isPlaceholderSecret } from '@/core/security/secrets';

describe('isPlaceholderSecret', () => {
  it('recognises every example value the repository ships', () => {
    // Read from the files themselves, so a new example cannot slip past.
    const compose = readFileSync('docker-compose.yml', 'utf8');
    const values = [...compose.matchAll(/OPB_(?:SETUP_TOKEN|SECRET_KEY): (\S+)/g)].map((m) => m[1]);
    expect(values.length).toBeGreaterThanOrEqual(2);
    for (const value of values) expect(isPlaceholderSecret(value), value).toBe(true);

    expect(isPlaceholderSecret('a long phrase you invent')).toBe(true);
    expect(isPlaceholderSecret('A different long phrase ')).toBe(true);
    expect(isPlaceholderSecret('changeme')).toBe(true);
  });

  it('leaves phrases somebody invented alone, short ones included', () => {
    expect(isPlaceholderSecret(undefined)).toBe(false);
    expect(isPlaceholderSecret('')).toBe(false);
    expect(isPlaceholderSecret('token')).toBe(false);
    expect(isPlaceholderSecret('correct horse battery staple')).toBe(false);
    expect(isPlaceholderSecret('please-change-me-later-xyz')).toBe(false);
  });
});
