import { describe, expect, it } from 'vitest';
import { arrivedOverHttps, contentSecurityPolicy, plainHttpContentSecurityPolicy } from '../csp';

describe('content security policy', () => {
  it('upgrades insecure requests over https only', () => {
    expect(contentSecurityPolicy).toContain('upgrade-insecure-requests');
    expect(plainHttpContentSecurityPolicy).not.toContain('upgrade-insecure-requests');
    expect(plainHttpContentSecurityPolicy).toBe(
      contentSecurityPolicy.replace('; upgrade-insecure-requests', '')
    );
  });

  it('believes a TLS proxy over the URL the server saw', () => {
    expect(arrivedOverHttps(new URL('http://app:3000/'), 'https')).toBe(true);
    expect(arrivedOverHttps(new URL('http://app:3000/'), 'https, http')).toBe(true);
    expect(arrivedOverHttps(new URL('http://box.lan/'), null)).toBe(false);
    expect(arrivedOverHttps(new URL('https://site.example/'), null)).toBe(true);
  });
});
