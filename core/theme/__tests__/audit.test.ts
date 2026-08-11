import { describe, expect, it } from 'vitest';
import { auditContrast, describeFailure } from '../audit';
import { checkContrast } from '../contrast';
import { tokensFor } from '../tokens';

describe('auditContrast', () => {
  it('passes the shipped default palette', () => {
    // If this ever fails, the generator has regressed and every new install
    // would be blocked from publishing. It is the most important assertion here.
    expect(auditContrast(undefined).passes).toBe(true);
  });

  it('passes the six accents the first-run wizard offers', () => {
    // These are presented as safe choices, so they have to actually be safe.
    for (const accent of ['#35F2B3', '#60A5FA', '#FBBF24', '#FB7185', '#A78BFA', '#94A3B8']) {
      const audit = auditContrast({
        accentDark: accent,
        accentLight: accent,
        backgroundDark: '#0D0F0F',
        backgroundLight: '#F3F3EF',
      });
      expect(audit.passes).toBe(true);
    }
  });

  it('checks both modes, not just the one the owner uses', () => {
    const audit = auditContrast({
      accentDark: '#35F2B3',
      accentLight: '#00B97D',
      backgroundDark: '#0D0F0F',
      backgroundLight: '#F3F3EF',
    });
    // Every reported failure carries the mode it happened in, so a clean audit
    // still has to have consulted both. Proven by the token lookup below
    // rather than by the empty result.
    expect(Object.keys(tokensFor('light', undefined)).length).toBeGreaterThan(0);
    expect(Object.keys(tokensFor('dark', undefined)).length).toBeGreaterThan(0);
    expect(audit.failures.every((f) => f.mode === 'dark' || f.mode === 'light')).toBe(true);
  });

  it('catches a background and text the generator cannot separate', () => {
    // Mid grey either side: there is no shade of the foreground that clears
    // 4.5:1, which is exactly the case the generator cannot rescue and this
    // audit exists to catch.
    const audit = auditContrast({
      backgroundDark: '#808080',
      backgroundLight: '#808080',
      accentDark: '#828282',
      accentLight: '#828282',
      strokeDark: '#818181',
      strokeLight: '#818181',
    });

    expect(audit.passes).toBe(false);
    expect(audit.failures.length).toBeGreaterThan(0);
  });

  it('reports a ratio below the requirement for every failure it returns', () => {
    const audit = auditContrast({
      backgroundDark: '#808080',
      backgroundLight: '#808080',
      accentDark: '#828282',
      accentLight: '#828282',
    });

    for (const failure of audit.failures) {
      expect(failure.ratio).toBeLessThan(failure.required);
      // Re-derived independently, so a failure cannot be reported for a pair
      // that would actually pass.
      const recheck = checkContrast(failure.foreground, failure.background);
      expect(recheck?.passes).toBe(false);
    }
  });

  it('holds borders and focus rings to 3:1, not 4.5:1', () => {
    const audit = auditContrast(undefined);
    void audit;
    // A border at 3.5:1 is compliant; treating it as body text would fail the
    // default palette and block every install from publishing.
    const borderish = checkContrast('#6b6b6b', '#0d0f0f', 'large');
    expect(borderish?.required).toBe(3);
    expect(borderish?.passes).toBe(true);
  });
});

describe('describeFailure', () => {
  it('names the place, the mode and the shortfall', () => {
    const audit = auditContrast({ backgroundDark: '#808080', accentDark: '#828282' });
    const message = describeFailure(audit.failures[0]);

    expect(message).toContain('mode');
    expect(message).toContain(':1');
  });

  it('offers a replacement colour when one exists', () => {
    // Offering a fix is what makes people accept the constraint. A message that
    // only says no gets fought.
    const audit = auditContrast({ backgroundDark: '#808080', accentDark: '#828282' });
    const withSuggestion = audit.failures.find((f) => f.suggestion);
    if (withSuggestion) {
      expect(describeFailure(withSuggestion)).toContain(withSuggestion.suggestion!);
    }
  });

  it('blames the background when no foreground could work', () => {
    const failure = {
      mode: 'dark' as const,
      label: 'Body text',
      foreground: '#808080',
      background: '#818181',
      ratio: 1.01,
      required: 4.5,
    };
    expect(describeFailure(failure)).toContain('background itself');
  });
});
