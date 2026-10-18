import { describe, expect, it } from 'vitest';
import { contentSecurityPolicy } from '../../../next.config';
import { toEmbedUrl, toSchedulingUrl, toSocialEmbed } from '../standard';

/**
 * Every address a facade can frame is one the policy allows framing.
 *
 * Two lists, one bug, already shipped once: the Turnstile widget's iframe was
 * refused by the very policy meant to let challenges through, because the
 * policy lives in `next.config.ts` and the frame is built in a block that had
 * never met it. A block that frames a host the policy does not name renders as
 * nothing at all — the failure looks like a broken provider, not a broken
 * policy, which is the expensive kind. So the list is checked rather than
 * remembered: this test fails the moment a facade learns a host the policy has
 * not been told about.
 */

const frameSrc = contentSecurityPolicy
  .split('; ')
  .find((directive) => directive.startsWith('frame-src '))
  ?.split(' ')
  .slice(1);

if (!frameSrc) throw new Error('the policy has no frame-src directive to check');

function allows(url: string | undefined) {
  if (!url) throw new Error('no embed address was built for a link that should have one');
  const { origin, hostname } = new URL(url);
  return frameSrc!.some((source) => {
    if (source === origin) return true;
    // `https://*.substack.com` — every publication is its own host, so the
    // policy names the family rather than one member of it.
    if (source.startsWith('https://*.')) {
      return hostname.endsWith(`.${source.slice('https://*.'.length)}`);
    }
    return false;
  });
}

describe('the frame policy covers every facade', () => {
  it('names the video hosts the facade rebuilds to', () => {
    // youtube-nocookie, never youtube: the privacy-enhanced host is chosen in
    // the block *and* named here, and a policy listing the other one would
    // leave the facade broken in a way no unit test of the block can see.
    expect(allows(toEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')?.url)).toBe(true);
    expect(allows(toEmbedUrl('https://vimeo.com/76979871')?.url)).toBe(true);
  });

  it('names the scheduling hosts', () => {
    expect(allows(toSchedulingUrl('https://cal.com/you/intro')?.url)).toBe(true);
    expect(allows(toSchedulingUrl('https://calendly.com/you/30min')?.url)).toBe(true);
  });

  it('names the social hosts, the Substack family included', () => {
    expect(allows(toSocialEmbed('https://www.instagram.com/p/CxYz12abcDe/')?.url)).toBe(true);
    expect(allows(toSocialEmbed('https://www.behance.net/gallery/123456789/Logo')?.url)).toBe(true);
    expect(allows(toSocialEmbed('https://astralcodexten.substack.com/p/a-post')?.url)).toBe(true);
  });

  it('names the challenge widget, which is the one that got this wrong before', () => {
    expect(frameSrc).toContain('https://challenges.cloudflare.com');
  });
});
