/**
 * The site holds itself to the rule the product enforces.
 *
 * The builder refuses to publish a palette nobody could read. It would be a
 * poor look for the page that says so to fail its own check — and this is not
 * hypothetical: the first pass of this palette shipped a muted grey at 4.04:1
 * on the paper and 3.71:1 on the tinted band, used for every eyebrow, every
 * table header and the whole footer. It looked fine on the monitor it was
 * chosen on, which is the entire problem with judging contrast by eye.
 *
 * Run with `npm run check:contrast`. Reads the tokens out of the stylesheet
 * rather than duplicating them, so a colour changed in one place cannot pass
 * here while failing on the page.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';

const css = readFileSync(path.join(import.meta.dirname, '..', 'app', 'globals.css'), 'utf8');

/** Pulls `--name: #hex;` out of the light block or the dark block. */
function tokens(scheme) {
  const block =
    scheme === 'dark'
      ? css.slice(css.indexOf('@media (prefers-color-scheme: dark)'))
      : css.slice(0, css.indexOf('@media (prefers-color-scheme: dark)'));

  const found = {};
  for (const [, name, value] of block.matchAll(/(--[a-z0-9-]+):\s*(#[0-9a-f]{6})\b/gi)) {
    found[name] = value.toLowerCase();
  }
  return found;
}

const channels = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
const linear = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = (hex) => {
  const [r, g, b] = channels(hex).map(linear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/**
 * Every pair that actually appears. Text on its own background, in both
 * schemes. The minimum is 4.5 throughout rather than 3 for large text, because
 * these tokens are shared and the same colour that sets a headline sets a
 * caption three sections later.
 */
const PAIRS = [
  ['--ink', '--paper'],
  ['--ink', '--paper-sunken'],
  ['--ink', '--card'],
  ['--ink-2', '--paper'],
  ['--ink-2', '--paper-sunken'],
  ['--ink-2', '--card'],
  ['--ink-3', '--paper'],
  ['--ink-3', '--paper-sunken'],
  ['--ink-3', '--card'],
  ['--seal', '--paper'],
  ['--seal', '--paper-sunken'],
  ['--seal', '--card'],
  ['--seal', '--seal-wash'],
  ['--stamp', '--stamp-wash'],
  // The primary button paints paper on seal, so the pair is inverted.
  ['--paper', '--seal'],
];

const MINIMUM = 4.5;
let failures = 0;

for (const scheme of ['light', 'dark']) {
  const palette = tokens(scheme);
  for (const [fg, bg] of PAIRS) {
    const front = palette[fg];
    const back = palette[bg];
    if (!front || !back) {
      console.error(`MISSING ${scheme}: ${fg} or ${bg} is not defined as a hex value.`);
      failures++;
      continue;
    }
    const ratio = contrast(front, back);
    if (ratio < MINIMUM) {
      console.error(
        `FAIL  ${ratio.toFixed(2)}  ${scheme}: ${fg} (${front}) on ${bg} (${back}) — needs ${MINIMUM}`
      );
      failures++;
    } else {
      console.log(`pass  ${ratio.toFixed(2)}  ${scheme}: ${fg} on ${bg}`);
    }
  }
}

if (failures > 0) {
  console.error(`\n${failures} pair(s) below ${MINIMUM}:1.`);
  process.exit(1);
}
console.log(`\nAll ${PAIRS.length * 2} pairs clear ${MINIMUM}:1.`);
