import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEMO_RESTRICTIONS, demoRestrictionMessage, isDemoMode } from '../config';

/**
 * The demo, and the two properties it rests on.
 *
 * One shared sandbox everybody edits is the arrangement every dead demo in the
 * research had — it survives until somebody renames the site to something
 * obscene, after which the project's most persuasive asset argues against it.
 * Isolation is what lets the editor be left fully usable instead.
 *
 * The restrictions are the other half, and they are enforced at the endpoints
 * rather than by hiding buttons: a disabled control is a suggestion, and the
 * endpoint is reachable without it.
 */

const cookieValue = { current: 'visitor-a' };
vi.mock('next/headers', () => ({
  cookies: async () => ({ get: () => ({ value: cookieValue.current }) }),
}));

const { demoAdapter, __resetDemoSandboxes, __sandboxCount } =
  await import('../../storage/adapters/demo');

beforeEach(() => {
  __resetDemoSandboxes();
  cookieValue.current = 'visitor-a';
});

describe('isDemoMode', () => {
  it('is off unless explicitly switched on', () => {
    expect(isDemoMode({} as never)).toBe(false);
    expect(isDemoMode({ OPB_DEMO_MODE: '0' } as never)).toBe(false);
    expect(isDemoMode({ OPB_DEMO_MODE: 'true' } as never)).toBe(false);
    expect(isDemoMode({ OPB_DEMO_MODE: '1' } as never)).toBe(true);
  });
});

describe('sandboxes', () => {
  it('keeps one visitor out of another visitor’s site', async () => {
    await demoAdapter.messages.append({
      id: 'a1',
      name: 'From A',
      email: 'a@example.com',
      message: 'only A should see this',
      status: 'unread',
      receivedAt: new Date().toISOString(),
    } as never);

    cookieValue.current = 'visitor-b';
    expect(await demoAdapter.messages.list()).toEqual([]);

    cookieValue.current = 'visitor-a';
    expect((await demoAdapter.messages.list())[0]?.name).toBe('From A');
  });

  it('gives each visitor a working, already-claimed site', async () => {
    // Nobody should have to invent a setup token to look at the editor.
    expect(await demoAdapter.readOwner()).not.toBeNull();
    expect((await demoAdapter.readSnapshot('published'))?.settings).toBeTruthy();
  });

  it('does not let one visitor’s edit reach another', async () => {
    const content = await demoAdapter.readSnapshot('published');
    await demoAdapter.writeSnapshot('published', {
      ...content!,
      settings: { ...content!.settings, fullName: 'Edited by A' },
    });

    cookieValue.current = 'visitor-b';
    expect((await demoAdapter.readSnapshot('published'))?.settings.fullName).not.toBe(
      'Edited by A'
    );
  });

  it('makes a new sandbox per visitor rather than one for everybody', async () => {
    await demoAdapter.readSnapshot('published');
    cookieValue.current = 'visitor-b';
    await demoAdapter.readSnapshot('published');
    expect(__sandboxCount()).toBe(2);
  });
});

describe('restrictions', () => {
  it('refuses to store anything', async () => {
    // Uploading is the one that turns a public demo into free file hosting.
    await expect(demoAdapter.media.put('k', new Uint8Array(), 'image/png')).rejects.toThrow(
      /switched off/i
    );
  });

  it('explains each one in terms of what could go wrong', () => {
    for (const restriction of DEMO_RESTRICTIONS) {
      const message = demoRestrictionMessage(restriction.id);
      expect(message).toContain(restriction.label);
      // A refusal with no reason reads as a broken feature.
      expect(message.length).toBeGreaterThan(40);
    }
  });

  it('is never durable, so the registry cannot pick it by accident', () => {
    expect(demoAdapter.capabilities.durable).toBe(false);
    expect(demoAdapter.capabilities.worksOnEphemeralHosts).toBe(false);
  });
});
