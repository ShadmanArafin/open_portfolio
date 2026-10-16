/**
 * The slug shared with the generator (`scripts/gen-fonts.mjs`) and the
 * self-hosted map (`core/theme/fonts.ts`): `Space Grotesk` → `space-grotesk`.
 *
 * Dependency-free on purpose — both the server layout and the client-side
 * preview mapper import it, and neither may drag `next/font` into the other
 * runtime.
 */
export function fontSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** CSS `var()` reference for a catalogue family, e.g. `var(--font-inter)`. */
export function fontVariableFor(name: string): string {
  return `var(--font-${fontSlug(name)})`;
}
