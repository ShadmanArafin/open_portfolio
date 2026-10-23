'use client';

import { useEffect } from 'react';
import { trackEvent } from '../utils/analytics';

/**
 * Which work gets opened is the single most useful thing to know about a
 * portfolio, so it is reported by slug and title rather than as a bare view.
 */
export function ProjectViewed({ slug, title }: { slug: string; title: string }) {
  useEffect(() => {
    trackEvent('Project viewed', { slug, title });
  }, [slug, title]);
  return null;
}
