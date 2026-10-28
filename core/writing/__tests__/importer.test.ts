import { describe, expect, it } from 'vitest';
import { createEntryFromMarkdown, parseMarkdownArticle } from '../importer';

const sampleMarkdown = `---
title: Designing with Grid Systems
slug: designing-with-grid-systems
date: 2026-05-01
tags: design, typography, swiss
summary: An introduction to Swiss rationalist graphic design.
image: /images/swiss-grid.jpg
---

# Designing with Grid Systems

Josef Müller-Brockmann introduced grid systems to create harmonious visual rhythm.

## Key Principles

The grid serves as an architectural blueprint for the page.

> A grid system is an aid, not a guarantee.

\`\`\`css
.container { display: grid; }
\`\`\`

![A grid study](https://example.com/grid.jpg)

Consistency across viewports builds reader trust.
`;

describe('Writing-screen Markdown importer', () => {
  it('parses supported front matter and reports content it cannot carry', () => {
    const result = parseMarkdownArticle('designing-with-grid-systems.md', sampleMarkdown);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.note.title).toBe('Designing with Grid Systems');
    expect(result.note.slug).toBe('designing-with-grid-systems');
    expect(result.note.summary).toContain('Swiss rationalist');
    expect(result.note.tags).toEqual(['design', 'typography', 'swiss']);
    expect(result.note.publishedAt).toBe('2026-05-01T00:00:00.000Z');
    expect(result.note.blocks.some((block) => block.type === 'richText')).toBe(true);
    expect(result.note.blocks.some((block) => block.type === 'quote')).toBe(true);
    expect(result.warnings).toContain('Code became plain text.');
    expect(result.warnings).toContain(
      'One image was left out. Add it from your media library when you review the piece.'
    );
  });

  it('creates a local draft entry with the reviewed slug and order', () => {
    const result = parseMarkdownArticle('designing-with-grid-systems.md', sampleMarkdown);
    if (!result.ok) throw new Error(result.error);

    const entry = createEntryFromMarkdown(result.note, 'writing_imported', 3);
    expect(entry.id).toBe('writing_imported');
    expect(entry.title).toBe('Designing with Grid Systems');
    expect(entry.slug).toBe('designing-with-grid-systems');
    expect(entry.status).toBe('draft');
    expect(entry.sortOrder).toBe(3);
    expect(entry.tags).toEqual(['design', 'typography', 'swiss']);
    expect(entry.seo.image).toBeUndefined();
  });

  it('uses the file name when front matter and a leading heading are absent', () => {
    const result = parseMarkdownArticle('architecture-notes.md', 'Exploring timber structures.');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.note.title).toBe('architecture notes');
      expect(result.note.slug).toBe('architecture-notes');
    }
  });
});
