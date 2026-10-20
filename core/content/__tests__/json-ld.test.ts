import { describe, expect, it } from 'vitest';
import { serializeJsonLd } from '@/core/content/json-ld';

describe('serializeJsonLd', () => {
  const hostile = { '@type': 'Article', headline: '</script><script>alert(1)</script>' };

  it('cannot close the script element it is placed in', () => {
    const out = serializeJsonLd(hostile);
    expect(out).not.toContain('<');
    expect(out).toContain('\\u003c/script>');
  });

  it('still parses to exactly the same data', () => {
    expect(JSON.parse(serializeJsonLd(hostile))).toEqual(hostile);
  });
});
