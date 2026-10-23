/**
 * `next/font/local` only exists under the Next compiler — under the test
 * runner it is not a function at all. The stub echoes the variable each
 * loader names and a className derived from it, which is everything the
 * catalogue map (`core/theme/fonts.ts`) needs: the tests assert that every
 * preset and picker family resolves, not the bytes of any font file. Real
 * file resolution is proven by `next build`, which reads each file from
 * `node_modules` or fails naming the missing one.
 */
export default function localFont(options: { variable?: string }): {
  variable: string;
  className: string;
} {
  const variable = options.variable ?? '--font-unnamed';
  return { variable, className: `next-font${variable.replace(/^--font/, '')}` };
}
