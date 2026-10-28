import { describe, expect, it } from 'vitest';
import { parseMarkdownArticle, createEntryFromMarkdown, markdownToBlocks } from '../importer';

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
.container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
}
\`\`\`

![Swiss Poster](https://example.com/poster.jpg)

Consistency across viewports builds reader trust.
`;

describe('Markdown & Article Importer', () => {
  it('parses frontmatter metadata and tags', () => {
    const parsed = parseMarkdownArticle(sampleMarkdown);

    expect(parsed.title).toBe('Designing with Grid Systems');
    expect(parsed.slug).toBe('designing-with-grid-systems');
    expect(parsed.summary).toContain('Swiss rationalist');
    expect(parsed.tags).toEqual(['design', 'typography', 'swiss']);
    expect(parsed.coverImage).toBe('/images/swiss-grid.jpg');
    expect(parsed.blocks.length).toBeGreaterThan(4);
  });

  it('converts markdown syntax into structured blocks', () => {
    const blocks = markdownToBlocks(sampleMarkdown);

    const hasHeading = blocks.some((b) => b.type === 'heading');
    const hasQuote = blocks.some((b) => b.type === 'quote');
    const hasCode = blocks.some((b) => b.type === 'code');
    const hasImage = blocks.some((b) => b.type === 'image');
    const hasText = blocks.some((b) => b.type === 'text');

    expect(hasHeading).toBe(true);
    expect(hasQuote).toBe(true);
    expect(hasCode).toBe(true);
    expect(hasImage).toBe(true);
    expect(hasText).toBe(true);
  });

  it('creates complete WritingEntry ready for storage', () => {
    const entry = createEntryFromMarkdown(sampleMarkdown, 2);

    expect(entry.id).toMatch(/^wri_/);
    expect(entry.title).toBe('Designing with Grid Systems');
    expect(entry.slug).toBe('designing-with-grid-systems');
    expect(entry.status).toBe('published');
    expect(entry.sortOrder).toBe(3);
    expect(entry.tags).toEqual(['design', 'typography', 'swiss']);
    expect(entry.seo.image).toBe('/images/swiss-grid.jpg');
  });

  it('infers title from first markdown # heading if frontmatter has no title', () => {
    const raw = `# My Architecture Thesis\n\nExploring sustainable timber structures.`;
    const parsed = parseMarkdownArticle(raw);
    expect(parsed.title).toBe('My Architecture Thesis');
  });
});
