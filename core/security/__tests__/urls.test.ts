import { describe, expect, it } from 'vitest';
import { sanitizeHref, sanitizeMediaSrc } from '@/core/security/urls';

describe('sanitizeHref', () => {
  it.each(['/work', '/writing/my-post', '#anchor', '?q=1', '/api/media/a.png'])(
    'allows same-site reference %s',
    (href) => {
      expect(sanitizeHref(href)).toBe(href);
    }
  );

  it.each([
    'https://example.com',
    'http://example.com/x?q=1',
    'mailto:hi@example.com',
    'tel:+15551234567',
  ])('allows %s', (href) => {
    expect(sanitizeHref(href)).toBe(href);
  });

  it.each([
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    '  javascript:alert(1)  ',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    'blob:https://example.com/uuid',
    'file:///etc/passwd',
    '//evil.example/phish',
    '/\\evil.example/phish',
    'https://example.com\njavascript:alert(1)',
  ])('rejects %s', (href) => {
    expect(sanitizeHref(href)).toBeNull();
  });

  it('rejects empty and control characters', () => {
    expect(sanitizeHref('')).toBeNull();
    expect(sanitizeHref(null)).toBeNull();
    expect(sanitizeHref(undefined)).toBeNull();
  });
});

describe('sanitizeMediaSrc', () => {
  it('allows relative and https sources', () => {
    expect(sanitizeMediaSrc('/api/media/a.png')).toBe('/api/media/a.png');
    expect(sanitizeMediaSrc('https://example.com/a.jpg')).toBe('https://example.com/a.jpg');
  });

  it('rejects javascript, data, mailto', () => {
    expect(sanitizeMediaSrc('javascript:alert(1)')).toBeNull();
    expect(sanitizeMediaSrc('data:image/svg+xml,<svg/>')).toBeNull();
    expect(sanitizeMediaSrc('mailto:hi@example.com')).toBeNull();
  });
});
