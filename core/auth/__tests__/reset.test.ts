import { describe, expect, it } from 'vitest';
import { hashResetToken } from '../reset';

describe('reset tokens', () => {
  it('never stores the token itself', () => {
    const token = 'a'.repeat(64);
    const stored = hashResetToken(token);
    expect(stored.includes(token)).toBe(false);
    expect(stored.length).toBe(64); // sha256, hex
  });

  it('is stable for the same token and different for another', () => {
    expect(hashResetToken('one')).toBe(hashResetToken('one'));
    expect(hashResetToken('one')).not.toBe(hashResetToken('two'));
  });
});
