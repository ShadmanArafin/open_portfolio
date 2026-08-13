import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AdminStorage } from '@/admin/pages/AdminStorage';

// Renders the real screen with the real Astryx components. Catches a wrong
// prop or a bad import, which typecheck alone does not — Astryx props are
// checked, but a component that throws at render still typechecks.
describe('the storage screen renders', () => {
  it('does not throw, and lists every backend', () => {
    vi.stubGlobal('fetch', () => new Promise(() => {}));
    const html = renderToStaticMarkup(<AdminStorage />);
    for (const name of ['This machine', 'Neon + Vercel Blob', 'Supabase', 'Any Postgres']) {
      expect(html).toContain(name);
    }
    expect(html).toContain('You choose this by deploying');
  });
});
