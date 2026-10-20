import { describe, expect, it } from 'vitest';
import { profileLinks } from '@/core/content/profiles';
import type { SocialLinkItem } from '@/cms/types/cms';

const link = (url: string, visible = true): SocialLinkItem => ({
  id: url,
  label: 'x',
  name: 'x',
  url,
  iconType: 'github',
  visible,
  sortOrder: 0,
});

describe('profileLinks', () => {
  it('keeps visible absolute profiles once each', () => {
    expect(
      profileLinks([
        link('https://mastodon.social/@someone'),
        link('https://mastodon.social/@someone'),
        link('https://github.com/someone', false),
      ])
    ).toEqual(['https://mastodon.social/@someone']);
  });

  it('drops anything that is not an http(s) profile', () => {
    expect(
      profileLinks([link('javascript:alert(1)'), link('mailto:a@b.c'), link('/about'), link('')])
    ).toEqual([]);
    expect(profileLinks(undefined)).toEqual([]);
  });
});
