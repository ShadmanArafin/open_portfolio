import { describe, expect, it } from 'vitest';
import { INITIAL_CMS_STATE } from '@/cms/data/initialData';
import type { CMSState } from '@/cms/types/cms';
import { detectHost, formatDiagnostics, summariseContent, type Diagnostics } from '../diagnostics';
import { buildBody, buildIssueUrl, isReportReady, type Report } from '../report';
import { compareVersions, isNewerThan } from '../../version';

/**
 * Reports, and the promise made about what is in them.
 *
 * The screen says "nothing you have written is included". That is a claim about
 * behaviour, and a claim about behaviour that nothing checks is a claim that
 * quietly stops being true — the first time somebody adds a field to make
 * triage easier. So the promise is a test.
 */

const diagnostics: Diagnostics = {
  server: {
    version: '0.5.0',
    adapter: 'neon',
    host: 'Vercel',
    nodeVersion: 'v24.0.0',
    emailConfigured: true,
  },
  content: {
    pages: 3,
    blocks: 11,
    blockTypes: ['cards', 'gallery', 'hero'],
    projects: 4,
    caseStudies: 2,
    mediaItems: 7,
    theme: { appearanceCustomised: true },
  },
  client: { userAgent: 'Mozilla/5.0', screen: '1920×1080', language: 'en-GB' },
  errors: [{ message: 'Cannot read properties of null', where: 'at Gallery', at: '14:02:11' }],
};

describe('what a report may contain', () => {
  it('carries nothing the owner wrote', () => {
    // The strongest version of this check: build a site whose every text field
    // is a marker, summarise it, and assert no marker survives.
    const secret = 'SHOULD-NEVER-APPEAR';
    const content: CMSState = {
      ...INITIAL_CMS_STATE,
      settings: { ...INITIAL_CMS_STATE.settings, fullName: secret, email: secret },
      seo: { ...INITIAL_CMS_STATE.seo, metaDescription: secret },
      pages: [
        {
          id: 'p1',
          slug: secret,
          title: secret,
          status: 'published',
          seo: { description: secret },
          nav: { show: true, label: secret, order: 0 },
          updatedAt: '2026-01-01T00:00:00.000Z',
          revision: 1,
          blocks: [{ id: 'b1', type: 'hero', v: 1, props: { headline: secret } }],
        },
      ],
    };

    const summary = summariseContent(content);
    expect(JSON.stringify(summary)).not.toContain(secret);

    const body = formatDiagnostics({ ...diagnostics, content: summary });
    expect(body).not.toContain(secret);
    // But it did learn the useful thing: which block type is involved.
    expect(body).toContain('hero');
  });

  it('counts what is there', () => {
    const summary = summariseContent({
      ...INITIAL_CMS_STATE,
      pages: [
        {
          id: 'p1',
          slug: 'a',
          title: 'A',
          status: 'published',
          seo: {},
          nav: { show: false, order: 0 },
          updatedAt: '',
          revision: 1,
          blocks: [
            { id: 'b1', type: 'hero', v: 1, props: {} },
            { id: 'b2', type: 'hero', v: 1, props: {} },
            { id: 'b3', type: 'gallery', v: 1, props: {} },
          ],
        },
      ],
    });

    expect(summary.pages).toBe(1);
    expect(summary.blocks).toBe(3);
    // Types, deduplicated and sorted — a set, not a log of what is on the page.
    expect(summary.blockTypes).toEqual(['gallery', 'hero']);
  });

  it('survives content that predates pages', () => {
    expect(summariseContent({ ...INITIAL_CMS_STATE, pages: undefined }).pages).toBe(0);
  });
});

describe('detectHost', () => {
  it('names the platform from what it sets', () => {
    expect(detectHost({ VERCEL: '1' } as never)).toBe('Vercel');
    expect(detectHost({ NETLIFY: 'true' } as never)).toBe('Netlify');
    expect(detectHost({ CF_PAGES: '1' } as never)).toBe('Cloudflare Pages');
  });

  it('says self-hosted rather than guessing', () => {
    expect(detectHost({} as never)).toBe('Self-hosted');
  });
});

describe('the issue URL', () => {
  const bug: Report = {
    kind: 'bug',
    title: 'Contact form sends twice',
    whatHappened: 'Two emails arrive.',
    whatIExpected: 'One email.',
    steps: 'Submit the form.',
  };

  it('labels a bug and a feature differently', () => {
    expect(buildIssueUrl(bug)).toContain('labels=bug%2Cfrom-admin');
    expect(
      buildIssueUrl({ kind: 'feature', title: 'x', problem: 'y', idea: '', whoElse: '' })
    ).toContain('labels=enhancement%2Cfrom-admin');
  });

  it('points at the upstream project, not at whatever this copy is called', () => {
    // A report has to reach the person who can fix it. Somebody who renamed
    // their copy must not end up filing bugs against themselves.
    expect(buildIssueUrl(bug)).toContain('ShadmanArafin/open_portfolio/issues/new');
  });

  it('encodes a body that would otherwise break the URL', () => {
    const url = buildIssueUrl({ ...bug, whatHappened: 'A & B #1 "quoted" 100%' });
    expect(() => new URL(url)).not.toThrow();
    expect(new URL(url).searchParams.get('body')).toContain('A & B #1 "quoted" 100%');
  });

  it('gives a title even when somebody leaves it blank', () => {
    expect(new URL(buildIssueUrl({ ...bug, title: '   ' })).searchParams.get('title')).toBe(
      'Bug report'
    );
  });

  it('truncates rather than producing a link GitHub refuses', () => {
    const url = buildIssueUrl({ ...bug, steps: 'x'.repeat(20000) });
    expect(new URL(url).searchParams.get('body')!.length).toBeLessThan(6200);
    expect(new URL(url).searchParams.get('body')).toContain('truncated');
  });

  it('leaves the diagnostics out when they were not offered', () => {
    expect(buildBody(bug)).not.toContain('Diagnostics');
    expect(buildBody(bug, diagnostics)).toContain('Diagnostics');
  });
});

describe('readiness', () => {
  it('needs a title and something describing the problem', () => {
    expect(
      isReportReady({ kind: 'bug', title: '', whatHappened: 'x', whatIExpected: '', steps: '' })
    ).toBe(false);
    expect(
      isReportReady({ kind: 'bug', title: 'x', whatHappened: '', whatIExpected: '', steps: '' })
    ).toBe(false);
    expect(
      isReportReady({ kind: 'bug', title: 'x', whatHappened: 'y', whatIExpected: '', steps: '' })
    ).toBe(true);
  });

  it('accepts a feature request describing either the problem or the idea', () => {
    expect(
      isReportReady({ kind: 'feature', title: 'x', problem: 'y', idea: '', whoElse: '' })
    ).toBe(true);
    expect(
      isReportReady({ kind: 'feature', title: 'x', problem: '', idea: 'y', whoElse: '' })
    ).toBe(true);
  });
});

describe('version comparison', () => {
  it('orders releases properly', () => {
    expect(isNewerThan('0.6.0', '0.5.0')).toBe(true);
    expect(isNewerThan('0.5.1', '0.5.0')).toBe(true);
    expect(isNewerThan('1.0.0', '0.9.9')).toBe(true);
    expect(isNewerThan('0.5.0', '0.5.0')).toBe(false);
    expect(isNewerThan('0.4.9', '0.5.0')).toBe(false);
  });

  it('does not compare version numbers as strings', () => {
    // The classic: "0.10.0" < "0.9.0" alphabetically, and an install would sit
    // on an old version being told it was current.
    expect(isNewerThan('0.10.0', '0.9.0')).toBe(true);
  });

  it('tolerates a leading v, which is how tags are written', () => {
    expect(compareVersions('v1.2.3', '1.2.3')).toBe(0);
  });

  it('treats something unparseable as oldest rather than throwing', () => {
    expect(isNewerThan('not-a-version', '0.1.0')).toBe(false);
  });
});
