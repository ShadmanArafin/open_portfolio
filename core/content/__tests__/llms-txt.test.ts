import { describe, expect, it } from 'vitest';
import { INITIAL_CMS_STATE } from '@/cms/data/initialData';
import { buildLlmsTxt } from '../llms-txt';
import type { WritingEntry } from '@/core/writing/schema';

describe('llms.txt', () => {
  const content = structuredClone(INITIAL_CMS_STATE);
  content.settings.fullName = 'Ada Lovelace';
  content.seo.metaDescription = 'Notes on the Analytical Engine.';

  it('follows the llmstxt.org shape: H1, summary blockquote, H2 link lists', () => {
    const body = buildLlmsTxt({
      content,
      siteUrl: 'https://ada.example.org',
      projects: content.projects.slice(0, 1),
      pages: [],
      writing: [
        { title: 'On engines', slug: 'on-engines', summary: 'Why\nnumbers' } as WritingEntry,
      ],
      writingLabel: 'Notes',
    });
    const lines = body.split('\n');
    expect(lines[0]).toBe('# Ada Lovelace');
    expect(body).toContain('> Notes on the Analytical Engine.');
    expect(body).toContain('## Pages');
    expect(body).toContain('- [About](https://ada.example.org/about)');
    expect(body).toContain('## Notes');
    // Newlines inside a note would break the list.
    expect(body).toContain(
      '- [On engines](https://ada.example.org/writing/on-engines): Why numbers'
    );
  });

  it('falls back to relative links when the site does not know its address', () => {
    const body = buildLlmsTxt({
      content,
      siteUrl: undefined,
      projects: [],
      pages: [],
      writing: [],
      writingLabel: '',
    });
    expect(body).toContain('- [Work](/work): Selected projects');
    expect(body).not.toContain('## Work');
  });
});
