import { describe, expect, it } from 'vitest';
import type { SocialLinkItem } from '@/cms/types/cms';
import { fediverseCreator } from '../profiles';

const link = (iconType: string, url: string, visible = true) =>
  ({ id: url, label: '', name: '', url, iconType, visible, sortOrder: 0 }) as SocialLinkItem;

describe('fediverseCreator', () => {
  it('reads @name@host from a Mastodon profile link', () => {
    expect(fediverseCreator([link('mastodon', 'https://mastodon.social/@robin')])).toBe(
      '@robin@mastodon.social'
    );
  });

  it('ignores other platforms that also use /@name, hidden links, and non-profile paths', () => {
    expect(fediverseCreator([link('medium', 'https://medium.com/@robin')])).toBeNull();
    expect(fediverseCreator([link('mastodon', 'https://a.example/@robin', false)])).toBeNull();
    expect(fediverseCreator([link('mastodon', 'https://a.example/@robin/12345')])).toBeNull();
    expect(fediverseCreator([link('mastodon', 'http://a.example/@robin')])).toBeNull();
  });
});
