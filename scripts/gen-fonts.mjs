import fs from 'node:fs';
const s = fs.readFileSync('src/utils/googleFonts.ts', 'utf8');
const entries = [
  ...s.matchAll(
    /\{\s*name: '([^']+)',\s*family: '([^']+)',\s*category: '([^']+)',\s*weights: 'wght@([^']+)'\s*,?\s*\}/g
  ),
].map((m) => ({ name: m[1], category: m[3], weights: m[4].split(';') }));
console.log('count:', entries.length);
const exp = (n) => n.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '');
const slug = (n) =>
  n
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
const lines = [];
lines.push('/* Self-hosted catalogue fonts.');
lines.push(' *');
lines.push(' * One static next/font/google loader per family the Appearance picker offers.');
lines.push(' * Static is the whole point: next/font downloads and self-hosts the files at');
lines.push(' * build time, so no visitor request ever reaches Google (remote font CSS leaks');
lines.push(' * visitor IPs). Dynamic choice survives because selection stays data: the');
lines.push(' * layout attaches every variable class, and --font-display/body/mono point at');
lines.push(' * whichever variable the saved appearance names. Unused families cost parsed');
lines.push(' * CSS, not downloads — the browser only fetches a woff2 whose family is');
lines.push(' * actually referenced.');
lines.push(' *');
lines.push(' * preload:false: preloading every catalogue family would turn each page load');
lines.push(' * into a font firehose. adjustFontFallback stays on so the swap does not shift');
lines.push(' * layout. Adding a catalogue font means adding one block here and one entry');
lines.push(' * in GOOGLE_FONTS_LIST — the build fails naming an unknown family, which is');
lines.push(' * the test.');
lines.push(' */');
lines.push(
  'import {\n  ' + entries.map((e) => exp(e.name)).join(',\n  ') + "\n} from 'next/font/google';"
);
lines.push('');
lines.push(
  'export interface SelfHostedFont { variable: string; className: string; generic: string; }'
);
lines.push('');
for (const e of entries) {
  const v = '--font-' + slug(e.name);
  lines.push(
    'const ' +
      exp(e.name) +
      '_font = ' +
      exp(e.name) +
      '({ weight: [' +
      e.weights.map((w) => "'" + w + "'").join(', ') +
      "], subsets: ['latin'], display: 'swap', preload: false, variable: '" +
      v +
      "' });"
  );
}
lines.push('');
lines.push('export const SELF_HOSTED_FONTS: Record<string, SelfHostedFont> = {');
for (const e of entries) {
  const generic =
    e.category === 'serif' ? 'serif' : e.category === 'monospace' ? 'monospace' : 'sans-serif';
  lines.push(
    "  '" +
      e.name +
      "': { variable: '--font-" +
      slug(e.name) +
      "', className: " +
      exp(e.name) +
      "_font.variable, generic: '" +
      generic +
      "' },"
  );
}
lines.push('};');
lines.push('');
lines.push('/** Every variable class, for the root element. CSS only until used. */');
lines.push(
  'export const ALL_FONT_VARIABLES: string = Object.values(SELF_HOSTED_FONTS).map((f) => f.className).join(" ");'
);
lines.push('');
fs.writeFileSync('core/theme/fonts.ts', lines.join('\n'));
console.log('wrote core/theme/fonts.ts');
