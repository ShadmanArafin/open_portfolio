import { describe, expect, it } from 'vitest';
import { resolveTransport } from '../transport';

describe('transport resolution', () => {
  it('is not configured when no host is set', () => {
    const result = resolveTransport({} as unknown as NodeJS.ProcessEnv);
    expect(result.kind).toBe('none');
  });

  it('selects smtp on the presence of a host alone', () => {
    const result = resolveTransport({ OPB_SMTP_HOST: 'localhost' } as unknown as NodeJS.ProcessEnv);
    expect(result.kind).toBe('smtp');
  });

  it('defaults the port to 587 and TLS to off', () => {
    const result = resolveTransport({ OPB_SMTP_HOST: 'localhost' } as unknown as NodeJS.ProcessEnv);
    if (result.kind !== 'smtp') throw new Error('expected smtp');
    expect(result.config.port).toBe(587);
    expect(result.config.secure).toBe(false);
  });

  it('turns on implicit TLS only for the documented value', () => {
    const on = resolveTransport({
      OPB_SMTP_HOST: 'h',
      OPB_SMTP_SECURE: '1',
    } as unknown as NodeJS.ProcessEnv);
    if (on.kind !== 'smtp') throw new Error('expected smtp');
    expect(on.config.secure).toBe(true);
  });

  it('derives a From address when none is given', () => {
    // Mailpit needs no credentials and no From; a developer should not have to
    // invent one to see their first email.
    const result = resolveTransport({
      OPB_SMTP_HOST: 'mail.example.com',
    } as unknown as NodeJS.ProcessEnv);
    if (result.kind !== 'smtp') throw new Error('expected smtp');
    expect(result.config.from).toBe('no-reply@mail.example.com');
  });

  it('prefers an explicit From', () => {
    const result = resolveTransport({
      OPB_SMTP_HOST: 'h',
      OPB_MAIL_FROM: 'me@example.com',
    } as unknown as NodeJS.ProcessEnv);
    if (result.kind !== 'smtp') throw new Error('expected smtp');
    expect(result.config.from).toBe('me@example.com');
  });

  it('ignores a port that is not a number', () => {
    const result = resolveTransport({
      OPB_SMTP_HOST: 'h',
      OPB_SMTP_PORT: 'not-a-port',
    } as unknown as NodeJS.ProcessEnv);
    if (result.kind !== 'smtp') throw new Error('expected smtp');
    expect(result.config.port).toBe(587);
  });
});
