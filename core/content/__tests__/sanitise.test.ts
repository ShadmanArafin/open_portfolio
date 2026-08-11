import { describe, expect, it } from 'vitest';
import type { CMSState, ContactMessage } from '@/cms/types/cms';
import { makeTestContent } from '@/core/storage/conformance';
import { withoutEnquiries } from '../sanitise';

/**
 * The published snapshot is handed to a client component, which means it is
 * serialised into the HTML of every public page. Anything an enquirer wrote is
 * therefore published to strangers if it survives this far, and a version
 * snapshot is a whole content document nested one level down.
 */

const enquiry: ContactMessage = {
  id: 'msg-1',
  name: 'Dana Okafor',
  email: 'dana@example.com',
  company: 'Northwind',
  projectType: 'Website',
  message: 'Here is my phone number, call me.',
  receivedAt: '2026-01-01T00:00:00.000Z',
  status: 'unread',
};

/** A document carrying the inbox everywhere it can be carried. */
function stateWithInbox(): CMSState {
  const inner = makeTestContent('two versions ago');
  inner.messages = [enquiry];

  const middle = makeTestContent('one version ago');
  middle.messages = [enquiry];
  middle.versions = [
    {
      id: 'v-1',
      timestamp: '2026-01-01T00:00:00.000Z',
      editor: 'Owner',
      action: 'Published Site Changes',
      summary: 'Changed: sections.',
      snapshot: inner,
    },
  ];

  const state = makeTestContent('live');
  state.messages = [enquiry];
  state.versions = [
    {
      id: 'v-2',
      timestamp: '2026-02-01T00:00:00.000Z',
      editor: 'Owner',
      action: 'Published Site Changes',
      summary: 'Changed: projects.',
      snapshot: middle,
    },
  ];
  return state;
}

describe('preparing content for publication', () => {
  it('leaves no trace of an enquiry anywhere in the document', () => {
    const published = JSON.stringify(withoutEnquiries(stateWithInbox()));

    // Searched as text rather than field by field: the point is that none of
    // it reaches the page, not that one particular key was cleared.
    expect(published.includes('Dana Okafor')).toBe(false);
    expect(published.includes('dana@example.com')).toBe(false);
    expect(published.includes('Here is my phone number')).toBe(false);
    expect(published.includes('Northwind')).toBe(false);
    expect(published.includes('msg-1')).toBe(false);
  });

  it('clears the inbox inside every version snapshot, not only the top level', () => {
    const result = withoutEnquiries(stateWithInbox());

    expect(result.messages).toEqual([]);
    expect(result.versions.length).toBe(1);
    expect(result.versions[0].snapshot.messages).toEqual([]);
  });

  it('keeps the content itself untouched', () => {
    const result = withoutEnquiries(stateWithInbox());

    expect(result.settings.fullName).toBe('live');
    expect(result.versions[0].id).toBe('v-2');
    expect(result.versions[0].summary).toBe('Changed: projects.');
    expect(result.versions[0].snapshot.settings.fullName).toBe('one version ago');
  });

  it('does not mutate what it was given', () => {
    const original = stateWithInbox();
    withoutEnquiries(original);

    // The caller's copy is the one being written elsewhere; quietly emptying
    // it would be a different bug of the same shape.
    expect(original.messages.length).toBe(1);
  });

  it('copes with a document that has no versions at all', () => {
    const bare = makeTestContent('bare');
    bare.versions = undefined as unknown as CMSState['versions'];
    expect(withoutEnquiries(bare).versions).toEqual([]);
  });
});
