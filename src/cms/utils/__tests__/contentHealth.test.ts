import { describe, it, expect } from 'vitest';
import { analyseContent } from '../contentHealth';
import type { CMSState, ContactMessage } from '@/cms/types/cms';

function mockMessage(id: string, status: ContactMessage['status'] = 'unread'): ContactMessage {
  return {
    id,
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    projectType: 'Design',
    message: 'Hello world',
    status,
    receivedAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('contentHealth', () => {
  describe('unread-messages check', () => {
    it('pluralises single unread enquiry correctly', () => {
      const state = {
        messages: [mockMessage('m1', 'unread')],
      } as unknown as CMSState;

      const report = analyseContent(state, () => 0);
      const issue = report.issues.find((i) => i.id === 'unread-messages');
      expect(issue).toBeDefined();
      expect(issue?.title).toBe('1 enquiry unread');
    });

    it('pluralises multiple unread enquiries correctly without duplicating words', () => {
      const state = {
        messages: [mockMessage('m1', 'unread'), mockMessage('m2', 'unread')],
      } as unknown as CMSState;

      const report = analyseContent(state, () => 0);
      const issue = report.issues.find((i) => i.id === 'unread-messages');
      expect(issue).toBeDefined();
      expect(issue?.title).toBe('2 enquiries unread');
    });
  });
});
